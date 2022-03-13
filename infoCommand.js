const util = require("../../util");
const Discord = require("discord.js");

module.exports = {
    name: "info",

    aliases: ["information", "support", "invite"],

    description: "Information about PsychUtils",

    async execute(message, args, client) {
        const embed = new Discord.MessageEmbed()
            .setDescription(
                `${client.user.username} is a bot developed from and for PsychOps Studios \
                 [PsychOps Studios](https://psychops.tk) with the only purpose of serving PsychOps' server \
                  utility commands.\n\n[[Invite]](${util.links.invite}) [[Support]](${util.links.support}) \
                   [[Github]](https://github.com/PsychOps/PsychUtils)`
            )
            .setColor(util.color.blue);

        await message.reply({ embeds: [embed] });
    },
};