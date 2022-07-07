const { MessageReaction } = require("discord.js");
const config = require("../../../config.json");
const mysql = require('mysql2/promise')

module.exports = {
    name: "reactionroles",

    aliases: ["rr", "reactions"],

    description: "Set up reaction roles",

    usage: "#channel messageID :emoji: @role OR roleID",

    cooldown: 10,

    async execute(message, args, client) {
        if (!message.member.permissions.has("MANAGE_MESSAGES")) {
            return await message.reply("You do not have the required permissions to use this command!");
        }
        if (!message.mentions.channels.first()) {
            return await message.reply("Please mention a channel!");
        }

        //fetch channel
        const reactchannel = await client.channels.fetch(message.mentions.channels.first().id);

        //fetch message
        const reactmessage = await reactchannel.messages.fetch(args[1])

        //get the role
        let role;
        if (!message.mentions.roles.first()) {
            role = args[3]
        } else {
            role = message.mentions.roles.first().id
        }

        //make sure the role actually exists
        const guild = await message.guild.fetch()
        if (!await guild.roles.resolve(role)) {
            return message.reply("Failed to find that role!")
        }

        await reactmessage.react(args[2]);
        if (reactchannel === message.channel) {
            await reactmessage.reply("Reaction successfully added!")
        } else {
            await message.reply("Reaction successfully added!")
        }

        console.log(args[2])
        const database = await mysql.createConnection(config.database);
        await database.execute("INSERT INTO reactionroles (message_id, reaction, role_id, guild_id) VALUES (?, ?, ?, ?)", [reactmessage.id, args[2], role, message.guild.id]);
        await database.end();
    },
};