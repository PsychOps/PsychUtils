const util = require("../../util");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const config = require("../../../config.json");

module.exports = {
    name: "daily",

    description: "Get your daily money",

    cooldown: 5,

    async execute(message, args, client) {
        const now = Date.now();
        const database = await mysql.createConnection(config.database);
        const cooldown = await database.query("SELECT expireTime FROM cooldowns WHERE user_id = ? AND command = ?", [message.author.id, 'daily']);
        const wallet = await database.query("SELECT wallet FROM balance WHERE user_id = ?", [message.author.id]);

        if(wallet[0][0] === undefined || wallet === undefined) {
            await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?)", [message.author.id, 0, 0]);
        }

        console.log(wallet[0][0]['wallet']);

        if(cooldown[0][0] === undefined || cooldown[0][0]['expireTime'] === undefined || cooldown[0][0]['expireTime'] * 1000 < now) {
            //success
            const addwallet = parseInt(wallet[0][0]['wallet']) + 500;
            await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [message.author.id, addwallet, 0, addwallet]);
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setDescription(`You have successfully received your daily \`500 ⌬\`!`)
                .setColor(util.color.green);
            await message.reply({ embeds: [embed] });

            const dates = Date.now() / 1000 + 86400
            await database.execute("INSERT INTO cooldowns (user_id, command, expireTime) VALUES (?,?,?)", [message.author.id, 'daily', dates]);
        }
        else {
            // fail
            return await message.reply(`:no_entry_sign: You are still on a cooldown until <t:${cooldown[0][0]['expireTime']}:t> tommorow.`);
        }
    },
}