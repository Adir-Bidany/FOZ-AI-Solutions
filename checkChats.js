const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const ChatExternalSchema = new Schema({}, { strict: false });
const ChatExternal = models.ChatExternal || model('ChatExternal', ChatExternalSchema, 'chatexternals');

const uri = "mongodb+srv://admin:adirfozaisolutions3010@cluster0.t2mmnum.mongodb.net/?appName=Cluster0";

mongoose.connect(uri).then(async () => {
    const chats = await ChatExternal.find({});
    console.log('Total chats: ' + chats.length);
    const empty = chats.filter(c => !c.messages || c.messages.length === 0);
    console.log('Empty chats: ' + empty.length);
    if (empty.length > 0) {
        console.log('Sample empty chat: ', JSON.stringify(empty[0], null, 2));
    } else if (chats.length > 0) {
        console.log('Sample chat: ', JSON.stringify(chats[0], null, 2));
    }
    process.exit(0);
});
