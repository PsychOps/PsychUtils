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

        const filter = (m) => m.author.id === message.author.id;
        //get channel from the args
        const reactchannel = message.mentions.channels.first();
        if (!reactchannel) {
            message.reply("Please mention a channel!");
            return;
        }

        const collector = message.channel.createMessageCollector({ filter, time: 300000 });

        let reactroles = [];
        let reactrolesemoji = [];

        let cancelled = false;
        while (cancelled === false) {
            console.log("while loop entered")
            message.channel.send("Please mention the role you want to assign to the reactions");
            const collector = message.channel.createMessageCollector({ filter, time: 300000, max: 1 });

            collector.on('collect', m => {
                console.log(`Collected ${m.content}`);
                if (m.content == "cancel") {
                    cancelled = true;
                }
                m.reply("yo")
            });
            // collector.on('end', collected => {
            //     console.log(`Collected ${collected.size} items`);
            // });
        }
        //AFTER WHILE
        let channel = await reactchannel.fetch()
        await channel.send("Hi")
    },
};