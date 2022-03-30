const util = require("../../util");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const config = require("../../../config.json");

module.exports = {
    name: "withdraw",

    args: true,

    usage: "<amount>|all",

    aliases: ["with"],

    description: "Withdraw money from your bank",

    async execute(message, args, client) {
        const database = await mysql.createConnection(config.database);
        const wallet = await database.query("SELECT wallet FROM balance WHERE user_id = ?", [message.author.id]);
        const bank = await database.query("SELECT bank FROM balance WHERE user_id = ?", [message.author.id]);

        if (wallet[0][0] == undefined || bank[0][0] == undefined) {
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setDescription("You do not have a profile yet.\n*Start by using commands such as `work`*")
                .setColor(util.color.red);
            await message.reply( { embeds: [embed] } );
        } else {
            if (bank[0][0]['bank'] < args[0] || 1 > args[0]) {
                return await message.reply(`You only have \`⌬ ${bank[0][0]['bank']}\` in your bank. `);
            }

            if (Number.isNaN(+args[0]) && args[0] !== "all") {
                return await message.reply(`You must provide a number.`);
            }

            if (args[0] === "all") {
                const offbankall = bank[0][0]['bank'] - bank[0][0]['bank'];
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE bank = ?", [message.author.id, 0, offbankall, offbankall]);
                const onwalletall = parseInt(wallet[0][0]['wallet']) + parseInt(bank[0][0]['bank']);
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [message.author.id, onwalletall, 0, onwalletall]);

                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .addFields(
                        /** @type {any} */ {name: 'Withdrawn', value: `\`⌬ ${onwalletall}\``, inline: false},
                        /** @type {any} */ {name: 'Wallet', value: `\`⌬ ${onwalletall}\``, inline: true},
                        /** @type {any} */ {name: 'Bank', value: `\`⌬ ${offbankall}\``, inline: true}
                    )
                    .setColor(util.color.green);

                await message.reply({embeds: [embed]});
            } else {
                const offbank = bank[0][0]['bank'] - args[0];
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE bank = ?", [message.author.id, 0, offbank, offbank]);
                const onwallet = parseInt(wallet[0][0]['wallet']) + parseInt(args[0]);
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [message.author.id, onwallet, 0, onwallet]);

                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .addFields(
                        /** @type {any} */ {name: 'Withdrawn', value: `\`⌬ ${args[0]}\``, inline: false},
                        /** @type {any} */ {name: 'Wallet', value: `\`⌬ ${onwallet}\``, inline: true},
                        /** @type {any} */ {name: 'Bank', value: `\`⌬ ${offbank}\``, inline: true}
                    )
                    .setColor(util.color.green);

                await message.reply({embeds: [embed]});
            }
        }
    },
};