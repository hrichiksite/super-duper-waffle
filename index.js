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
            headers: { Authorization: "Bearer " + process.env.CFAI_API_KEY },
            method: "POST",
            body: JSON.stringify(input),
        }
    );
    const result = await response.json();
    return result;
}

async function query(input) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
		{
			headers: {
				Authorization: "Bearer " + process.env.HF_API_TOKEN,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: input,
		}
	);
	const result = await response.json();
	return result;
}



// Listening to all incoming messages
client.on('message', async message => {
    message.react("🤖");
    try{
    console.log(`Received message from ${message.from}: ${message.body}`);
    //only reply if the message is from a allowed number
    //check if the message is from a allowed number
    //allowed numbers list
    const allowedNumbers = []; // add the allowed numbers here, empty array will allow all numbers
    if (allowedNumbers.length > 0 && !allowedNumbers.includes(message.from)) {
        console.log('Message from not allowed number, ignoring');
        return;
    }
    // append allowlist during a session
    if (message.body.startsWith("!allowlist-code supersecretcode")) {
        //add the number to the allowed list
        const contact = await message.getContact();
        allowedNumbers.push(contact.id);
        message.reply("Added to allowed list");
        return; 
    }

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

    //change system prompt if the user is a friend
    // add a way to add friends
    // if the recent messages contain the a secret code, add the user to the friends list
    var friendsList = [];
    var isFriend = !!name.includes("Friend") || friendsList.includes(name);
    if(message.body.startsWith("!add-friend-code supersecretcode")) {
        //add the number to the allowed list
        friendsList.push(name);
        message.reply("Added to friends list");
        return; 
    }

    const messagesArray = [];
    var systemPrompt = `You are a human who has taken my place. 
        ${isFriend ? "You are talking to a friend of mine." : ""} 
        You are talking with ${name} on WhatsApp. 
        You will talk naturally with them in short replies, reply accordingly, request time for any questions you can't answer by saying you're busy or similar excuse.

        Examples: 
        If the user says "yo" you respond with "yo"
        
        If the user says "what's up" you respond with "nothing much, you?"

        If the user says "can you share me the notes for the class" you respond with "I'm busy right now, can I share it later?"
        
        keep it simple, keep it short, keep it human.
        
        USE AS LITTLE WORDS AS POSSIBLE, and keep it simple.`
    messages.reverse();
    let startNewChat = false;
    messages.every(async (thismessage) => {
        
        //if empty message, ignore
        if (thismessage.body === "" && !thismessage.hasMedia) {
            return true;
        }
        //if new context is started, stop the loop
        if (thismessage.body.startsWith("!contextboundary")) {
            startNewChat = true;
        }
        if (startNewChat) {
            return false;
        }
        //if message is a command, ignore
        if (thismessage.body.startsWith("!")) {
            return true;
        }
        
        console.log(thismessage.hasMedia);
        let appendmsgbody = thismessage.body
        // if (thismessage.hasMedia) {
        //     //download the media
        //     const msgmedia = await thismessage.downloadMedia();
        //     console.log(msgmedia);
        //     if (msgmedia.mimetype.includes("image")) {
        //         query(Buffer.from(msgmedia.data, 'base64')).then((response) => {
        //             console.log(response);
        //             if (response.generated_text) {
        //                 appendmsgbody += "\n\n" + "GENERATED IMAGE DESCRIPTION" + response.generated_text.trim();
        //                 messagesArray.push({ role: thismessage.fromMe ? "assistant" : "user", content: appendmsgbody });
        //                 return true;
        //             }
        //         })
        //     }
        // } else {
        messagesArray.push({ role: thismessage.fromMe ? "assistant" : "user", content: appendmsgbody });
        return true;
        // }
    });
    //console.log(ac);
    console.log(messagesArray, 'messagesArray');

    messagesArray.reverse();
    if (message.body.startsWith("!contextboundary") || messagesArray.length === 0) {
        //do not reply to a boundary message
        return;
    }

    messagesArray.unshift({ role: "system", content: systemPrompt });
    run("@hf/thebloke/zephyr-7b-beta-awq", {
        messages: messagesArray,
        max_tokens: 50,
    }).then((response) => {
        console.log(response);
        if (response.success) {
            //send the response
            message.reply(response.result.response.trim());
            message.react("✅");
        }
    });
} catch (e) {
    console.error(e);
    message.react("❌");
}

});


client.initialize();
