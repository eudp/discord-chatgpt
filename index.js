const Discord = require("discord.js");
const { fork } = require("node:child_process");
require('dotenv').config()

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let chats = [];
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  const indexChat = chats.findIndex((chat) => chat.id === msg.author.id);
  if (indexChat > -1) {
    chats[indexChat].msg = msg;
    chats[indexChat].child.send(msg.content);
    return;
  }

  const child = fork("chatgpt.js", [msg.author.id, msg.content]);

  child.on("message", function (message) {
    const indexChat = chats.findIndex((chat) => chat.id === message.chatId);

    chats[indexChat].msg.reply(message.text);
  });

  chats.push({ id: msg.author.id, child, msg });
});

client.login(process.env.DISCORD_KEY);
