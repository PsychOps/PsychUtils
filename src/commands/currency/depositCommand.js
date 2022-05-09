const util = require("../../util");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const config = require("../../../config.json");

module.exports = {
    name: "deposit",

    args: true,

    usage: "<amount>|all",

    aliases: ["dep"],

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
            if (wallet[0][0]['wallet'] < args[0] || 1 > args[0]) {
                return await message.reply(`You only have \`⌬ ${wallet[0][0]['wallet']}\` in your wallet. `);
            }

            if (Number.isNaN(+args[0]) && args[0] !== "all") {
                return await message.reply(`You must provide a number.`);
            }

            if (args[0] === "all") {
                const offwalletall = wallet[0][0]['wallet'] - wallet[0][0]['wallet'];
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [message.author.id, offwalletall, 0, offwalletall]);
                const onbankall = parseInt(bank[0][0]['bank']) + parseInt(wallet[0][0]['wallet']);
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE bank = ?", [message.author.id, 0, onbankall, onbankall]);

                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .addFields(
                        /** @type {any} */ {name: 'Deposited', value: `\`⌬ ${onbankall}\``, inline: false},
                        /** @type {any} */ {name: 'Wallet', value: `\`⌬ ${offwalletall}\``, inline: true},
                        /** @type {any} */ {name: 'Bank', value: `\`⌬ ${onbankall}\``, inline: true}
                    )
                    .setColor(util.color.green)

                await message.reply({embeds: [embed]})
            } else {
                const onbank = parseInt(bank[0][0]['bank']) + parseInt(args[0]);
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE bank = ?", [message.author.id, 0, onbank, onbank]);
                const offwallet = wallet[0][0]['wallet'] - args[0];
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [message.author.id, offwallet, 0, offwallet]);

                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .addFields(
                        /** @type {any} */ {name: 'Deposited', value: `\`⌬ ${args[0]}\``, inline: false},
                        /** @type {any} */ {name: 'Wallet', value: `\`⌬ ${offwallet}\``, inline: true},
                        /** @type {any} */ {name: 'Bank', value: `\`⌬ ${onbank}\``, inline: true}
                    )
                    .setColor(util.color.green);

                await message.reply({embeds: [embed]});
            }
        }
    },
};
