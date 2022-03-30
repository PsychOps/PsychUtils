const util = require("../../util");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const config = require("../../../config.json");

module.exports = {
    name: "pay",

    args: true,

    usage: "<mention|ID> <amount>",

    aliases: ["transfer"],

    description: "Give someone some of your money",

    cooldown: 5,

    async execute(message, args, client) {
        let user = util.userMentionToId(args[0]);
        if (user === message.author.id) {
            return await message.reply(`You can't pay yourself.`)
        }
        if (!(user instanceof Discord.User)) {
            try {
                user = await client.users.fetch(user);
            } catch (e) {
                if (e.httpStatus === 404) {
                    await message.reply(`Please use valid IDs or mentions.`);
                    return;
                }
                throw e;
            }
        }

        if (!args[1]) {
            return await message.reply(`You need to tell us what you want to transfer to them.`)
        }

        const database = await mysql.createConnection(config.database);
        const balancegiv = await database.query("SELECT wallet FROM balance WHERE user_id = ?", [message.author.id])

        if (balancegiv[0][0] == undefined) {
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setDescription("You do not have a profile yet.\n*Start by using commands such as `work`*")
                .setColor(util.color.red)
            await message.reply( { embeds: [embed] } )
        }

        console.log(balancegiv[0][0]['wallet'])

        if (balancegiv[0][0]['wallet'] < args[1] || 1 > args[1]) {
            return await message.reply(`You only have \`⌬ ${balancegiv[0][0]['wallet']}\`. You can't even afford this much yourself??`)
        }

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('yes')
                    .setLabel('Yes')
                    .setStyle('DANGER'),
                new Discord.MessageButton()
                    .setCustomId('no')
                    .setLabel('No')
                    .setStyle('SUCCESS'),
            );

        await message.reply({
            content: `You are about to send \`⌬ ${args[1]}\` to ${user.tag}. Are you sure?`,
            components: [row]
        });

        const filter = i => i.customId === 'yes' || 'no' && i.user.id === message.author.id;

        const collector = message.channel.createMessageComponentCollector({filter, time: 15000});

        collector.on('collect', async i => {

            if (i.customId === 'yes') {
                const balancerec = await database.query("SELECT wallet FROM balance WHERE user_id = ?", [user.id])
                const balancegiv = await database.query("SELECT wallet FROM balance WHERE user_id = ?", [message.author.id])

                if (balancerec[0][0] == undefined) {
                    await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?)", [user.id,0,0])
                }

                const newvaluerec = balancerec[0][0]['wallet'] + args[1];
                const newvaluegiv = balancegiv[0][0]['wallet'] - args[1];

                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [message.author.id, newvaluegiv, 0, newvaluegiv])
                await database.execute("INSERT INTO balance (user_id, wallet, bank) VALUES (?,?,?) ON DUPLICATE KEY UPDATE wallet = ?", [user.id, newvaluerec, 0, newvaluerec])
                await i.update({content: `Transaction finished.`, components: []});
            }
            if (i.customId === 'no') {
                await i.update({content: `Cancelling transaction...`, components: []});
            }
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    },
};