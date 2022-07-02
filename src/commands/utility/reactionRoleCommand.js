module.exports = {
    name: "reactionroles",

    aliases: ["rr", "reactions"],

    description: "Set up reaction roles",

    cooldown: 10,

    async execute(message, args, client) {
        //check if author has manage messages permissions
        if (!message.member.permissions.has("MANAGE_MESSAGES")) {
            return message.reply("You do not have the required permissions to use this command!");
        }
        if (message.channel.type === "dm") {
            message.reply("Please use this command in a server.");
            return;
        }

        //get channel from the args
        var reactchannel = message.mentions.channels.first().id;
        if (!reactchannel) {
            message.reply("Please mention a channel!");
            return;
        }

        reactchannel = await client.channels.fetch(reactchannel)
        var reactID = args[1]
        console.log(reactID)
        reactmessage1 = await reactchannel.messages.fetch(reactID)
        console.log(reactmessage1.content)
        await reactmessage1.react('😂');
    },
};