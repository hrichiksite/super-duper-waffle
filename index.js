const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config()

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

//AI function
async function run(model, input) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACC_ID}/ai/run/${model}`,
      {
        headers: { Authorization: "Bearer "+process.env.CFAI_API_KEY },
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    const result = await response.json();
    return result;
  }


// Listening to all incoming messages
client.on('message', async message => {
    console.log(`Received message from ${message.from}: ${message.body}`);
    //only reply if the message is from a allowed number
    //check if the message is from a allowed number
    //allowed numbers list
    const allowedNumbers = []; // add the allowed numbers here, empty array will allow all numbers
    if (allowedNumbers.length > 0 && !allowedNumbers.includes(message.from)) {
        console.log('Message from not allowed number, ignoring');
        return;
    }
    //TODO: append allowlist during a session

    if (message.body === '!ping') {
        client.sendMessage(message.from, 'pong');
    }

    //catch all other messages
    //and process them with a ai function or something
    //lets use cloudflare ai - @hf/thebloke/zephyr-7b-beta-awq for this (for now), later we will probably use Ollama
    //TODO: Ollama integration
    //get name of the user
    const contact = await message.getContact();
    const name = contact.name;

    //get chat
    const chat = await message.getChat();

        //get last 30 messages
        const messages = await chat.fetchMessages({ limit: 30 });
        //get strings from messages, and format them like this:
        //{ role: 'user', content: 'Say this is a test' }
        //messages from me would be assistant messages
        //messages from others would be user messages
        
        const messagesArray = [];
        var systemPrompt = `You are a human who has taken my place. 
        You're talking with my friends. You are talking with ${name} on WhatsApp. 
        You will talk naturally with them in short replies, reply accordingly, request time for any questions you can't answer by saying you're busy or similar excuse.

        Examples: 
        If the user says "yo" you respond with "yo"
        
        If the user says "what's up" you respond with "nothing much, you?"

        If the user says "can you share me the notes for the class" you respond with "I'm busy right now, can I share it later?"
        
        keep it simple, keep it short, keep it human.
        
        USE AS LITTLE WORDS AS POSSIBLE, and keep it simple.`
        messages.reverse();
        messages.every((thismessage) => {
            //if empty message, ignore
            if(thismessage.body === ""){
                return true;
            }
            messagesArray.push({role: thismessage.fromMe ? "assistant" : "user",  content: thismessage.body});
            return true;
        });
        messagesArray.reverse();
        
        messagesArray.unshift({role: "system", content: systemPrompt});
        console.log(messagesArray);
    run("@hf/thebloke/zephyr-7b-beta-awq", {
        messages: messagesArray,
        max_tokens: 50,
      }).then((response) => {
        console.log(response);
        if(response.success){
            //send the response
            message.reply(response.result.response.trim());
        }
      });


});


client.initialize();
