const util = require("../../util");
const Discord = require("discord.js");

module.exports = {
    name: "serverinfo",

    aliases: ["si"],

    description: "Displays general info about the server.",

    async execute() {
        const guild = this.source.getGuild();
        
        let owner = await guild.fetchOwner();
      
        let generic = '';
        generic += `**Owner:** <@!${owner.id}> (${owner.user.tag}) \n`;
        generic += `**Owner ID:** ${owner.id} \n`;
        generic += `**Created:** <t:${Math.floor(guild.createdTimestamp/1000)}:D> \n`;
        generic += `**Guild ID:** ${guild.id} \n`;
        
        let statistics = '';
        statistics += `**Members:** ${guild.memberCount} \n`;
        statistics += `**Max members:** ${guild.maximumMembers} \n`;
        statistics += `**Verified:** ${guild.verified ? 'Yes' : 'No'} \n`;
        statistics += `**Partnered:** ${guild.partnered ? 'Yes' : 'No'} \n`;

        const embed = new Discord.MessageEmbed()
            .setTitle(`Info of ${guild.name}`)
            .setColor(util.color.red)
            .setThumbnail(guild.iconURL({dynamic: true, size: 2048}))
            .setFooter(`Command executed by $${message.author.tag}`)
            .setTimestamp()
            .addFields(
                /** @type {any} */ {name: '__**Generic**__', value: generic, inline: true},
                /** @type {any} */ {name: '__**Statistics**__', value: statistics, inline: true },
                /** @type {any} */ {name: '__**Features**__', value: features.join(', ') || 'None', inline: false }
            );
              
        await this.reply(embed);
    }
};