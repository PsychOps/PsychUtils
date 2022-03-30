const util = require("../../util");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const config = require("../../../config.json");

module.exports = {
    name: "balance",

    usage: "<user|ID>",

    aliases: ["bal"],

    description: "Check your or someone else's balance",

    cooldown: 5,

    async execute(message, args, client) {
        let user = args.length ? util.userMentionToId(args[0]) : message.author;
        if (!(user instanceof Discord.User)) {
            try {
                user = await client.users.fetch(user);
            }
            catch (e) {
                if (e.httpStatus === 404) {
                    await message.reply(`Please use valid IDs or mentions.`);
                    return;
                }
                throw e;
            }
        }

        let wallet;
        let bank;
        const database = await mysql.createConnection(config.database);
        const balance = await database.query("SELECT wallet, bank FROM balance WHERE user_id = ?", [user.id]);

        if (balance[0][0] === undefined) {
            const embed = new Discord.MessageEmbed()
                .setAuthor(user.tag, user.avatarURL())
                .setDescription("This user does not have a profile yet.\n*Start by using commands such as `work`*")
                .setColor(util.color.red);
            await message.reply( { embeds: [embed] } );
        } else {
            wallet = balance[0][0]["wallet"]
            bank = balance[0][0]["bank"]

            const embed = new Discord.MessageEmbed()
                .setAuthor(user.username + '\'s balance', user.avatarURL())
                .addFields(
                    /** @type {any} */ {name: 'Wallet', value: `\`⌬ ${wallet}\``, inline: true},
                    /** @type {any} */ {name: 'Bank', value: `\`⌬ ${bank}\``, inline: true}
                )
                .setColor(util.color.blue)
                .setTimestamp();

            await message.reply({embeds: [embed]});
        }
    },
};