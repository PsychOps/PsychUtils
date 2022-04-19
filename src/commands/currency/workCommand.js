const util = require("../../util");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const config = require("../../../config.json");

module.exports = {
    name: "work",

    description: "Work for your money",

    cooldown: 5,

    async execute(message, args, client) {
        const now = Date.now();
        const database = await mysql.createConnection(config.database);
        const cooldown = await database.query("SELECT expireTime FROM cooldowns WHERE user_id = ? AND command = ?", [message.author.id, 'work']);

        if(cooldown[0][0] === undefined || cooldown[0][0]['expireTime'] === undefined || cooldown[0][0]['expireTime'] * 1000 < now) {
            //success
            await message.reply(`Success!`)
            const dates = Date.now() / 1000 + 1800
            await database.execute("INSERT INTO cooldowns (user_id, command, expireTime) VALUES (?,?,?)", [message.author.id, 'work', dates]);
        }
        else {
            // fail
            return await message.reply(`:no_entry_sign: The cooldown ends <t:${cooldown[0][0]['expireTime']}:R>`);
        }
    },
}