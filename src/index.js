const DiscordJS = require('discord.js');
const { Client, Intents } = require('discord.js');
require('dotenv').config();
const { mmrlista, getMmrList } = require('./mmrlista.js');
const { calcWinrate } = require('./faceit.js');

// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// When the client is ready, run this code (only once)
client.on('ready', () => {
    console.log('Ready!');
    const guildID = '853741293134020649';
    const guild = client.guilds.cache.get(guildID);
    let commands;

    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands?.create({
        name: 'ping',
        description: 'pong',
    });
    commands?.create({
        name: 'winrate',
        description: 'Laskee Radiant/Dire voitot (Default 40 peliä)',
        options: [
            {
                name: 'luku',
                description: 'Laskettavat pelit numerona',
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            },
        ],
    });

    // getMmrList();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName, options } = interaction;

    if (commandName === 'ping') {
        interaction.reply({
            content: 'pong',
            ephemeral: true,
        });
    } else if (commandName === 'winrate') {
        const luku = options.getNumber('luku') || 40;

        const string = await calcWinrate(luku);

        await interaction.deferReply({});
        await interaction.editReply({
            content: string,
        });
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORDJS_TOKEN);
