const DiscordJS = require('discord.js');
const { Client, Intents } = require('discord.js');
require('dotenv').config();
const { getMmrList } = require('./mmrlista.js');
const { parseUrl } = require('./utils');
const {
    calcWinrate,
    calcMmr,
    shuffleTeams,
    getPlayerMmr,
    poolMmr,
} = require('./faceit.js');
const express = require('express');
const { webHookPool, webHookMmr } = require('./webhookfunctions.js');
const expressApp = express();
const PORT = 3000;
const mmrChannelId = '963891141638516777';
const testiChannelId = '853741293134020652';
// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
expressApp.use(express.json());

expressApp.listen(PORT, () =>
    console.log(`🚀 Express running on port ${PORT}`)
);

expressApp.post('/kaaoshook', async (req, res) => {
    res.status(200).end(); // Responding is important
    try {
        let body = req.body;
        if (body.event === 'match_object_created') {
            let embed = await webHookPool(body.payload.id);
            if (embed) {
                sendPayload(embed);
            }
        } else if (body.event === 'match_status_configuring') {
            let embed = webHookMmr(body);
            if (embed) {
                sendPayload(embed);
            }
        } else {
            sendString(`? ${body.event}`);
        }
    } catch (e) {
        console.log(e, 'error @ express router'); //ei pitäs tapahtuu
    }
});
const sendPayload = (embed) => {
    client.channels.cache.get(testiChannelId).send({ embeds: [embed] });
};
const sendString = (string) => {
    client.channels.cache.get(testiChannelId).send(string);
};

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// When the client is ready, run this code (only once)
client.on('ready', () => {
    console.log('Ready!');
    getMmrList();

    let minutes = 20 * 60 * 1000;
    setInterval(() => {
        getMmrList();
    }, minutes);
    // const guildID = null;
    // const guildID = '853741293134020649';
    const guildIDKaaos = '907363330174357535';
    // process.on("unhandledRejection", error => console.error("Promise rejection:", error);
    const guild = client.guilds.cache.get(guildIDKaaos);
    // guild.commands.set([]);
    // client.application.commands.set([]);
    // let commands = client.application?.commands;

    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands?.create({
        name: 'mmr',
        description: 'Tarkistaa pelin tasaisuuden',
        options: [
            {
                name: 'matchid',
                description: 'Anna matchID tai URL',
                // required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
    });
    commands?.create({
        name: 'winrate',
        description: 'Laskee Radiant/Dire voitot (100 peliä)',
        options: [
            {
                name: 'luku',
                description: 'Laskettavat pelit numerona',
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            },
        ],
    });
    commands?.create({
        name: 'shuffle',
        description: 'Tekee tiimit MMR:än mukaan tasaisiksi',
        options: [
            {
                name: 'matchid',
                description: 'Anna matchID tai URL',
                // required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
    });
    commands?.create({
        name: 'pool',
        description: 'Tarkistaa pickattavien pelaajien MMR:ät',
        options: [
            {
                name: 'matchid',
                description: 'Anna matchID tai URL',
                // required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
    });
    commands?.create({
        name: 'player',
        description: 'Hakee pelaajan MMR:än',
        options: [
            {
                name: 'name',
                description: 'Anna pelaajan Faceit Nimi',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
    });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    if (
        interaction.channelId != mmrChannelId &&
        interaction.channelId != testiChannelId
    ) {
        interaction.reply({
            content: 'Et voi käyttää bottia tällä kanavalla',
            ephemeral: true,
        });
        return;
    }
    // if (interaction.channelId != testiChannelId) {
    //     interaction.reply({
    //         content: 'Botti debugmoodissa sori',
    //         ephemeral: true,
    //     });
    //     return;
    // }

    const { commandName, options } = interaction;

    if (commandName === 'mmr') {
        let matchID = options.getString('matchid') || null;
        matchID = parseUrl(matchID);
        if (matchID === 'FAIL') {
            interaction.reply({
                content: `Virheellinen input`,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({});
        const string = await calcMmr(matchID);
        await interaction.editReply({
            content: string,
        });
    } else if (commandName === 'winrate') {
        const luku = options.getNumber('luku') || 100;

        await interaction.deferReply({});
        const string = await calcWinrate(luku);
        await interaction.editReply({
            content: string,
        });
    } else if (commandName === 'shuffle') {
        let matchID = options.getString('matchid') || null;
        matchID = parseUrl(matchID);
        if (matchID === 'FAIL') {
            interaction.reply({
                content: `Virheellinen input`,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({});
        const string = await shuffleTeams(matchID);
        await interaction.editReply({
            content: string,
        });
    } else if (commandName === 'player') {
        const name = options.getString('name') || null;
        const string = getPlayerMmr(name);
        interaction.reply({
            content: string,
        });
    } else if (commandName === 'pool') {
        let matchID = options.getString('matchid') || null;
        matchID = parseUrl(matchID);
        if (matchID === 'FAIL') {
            interaction.reply({
                content: `Virheellinen input`,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({});
        const string = await poolMmr(matchID);
        await interaction.editReply({
            content: string,
        });
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORDJS_TOKEN);
