const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Listening to all incoming messages
client.on('message_create', message => {
	console.log(`Received message from ${message.from}: ${message.body}`);
    if (message.body === '!ping') {
        //TODO: only reply if the message is from a allowed number
		client.sendMessage(message.from, 'pong');
	}
});


client.initialize();
