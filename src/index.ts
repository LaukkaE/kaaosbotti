import { Constants } from 'discord.js';
import { Client, Intents, TextChannel } from 'discord.js';
require('dotenv').config();
import { getMmrList, getFaceitPlayers } from './mmrlista';
import { parseUrl } from './utils';
import {
  calcWinrate,
  calcMmr,
  shuffleTeams,
  getPlayerMmr,
  poolMmr,
} from './faceit/faceit';
import express, { json } from 'express';
import { webHookPool, webHookMmr, webHookShuffle } from './webhookfunctions';
const expressApp = express();
const PORT = 3000;
const kliigaChannelId = '963891141638516777';
const fuzerChannelId = '1417114011807387719';
const hyytyyChannelId = '1438570764310937620';
const mmrChannelId = kliigaChannelId;
const testiChannelId = '853741293134020652';
const AdminUsers = [
  '398131762875727872', //Nevari
  '208996987293401088', //Windo
  '103569575643197440', //Asplo
  // '273628718767800321', //fuzer
  // '276366753578090496', //anton
];
let legacyPostingMode = false; //Käytä vanhoja stringejä embedien sijaan.
let shuffleMode = false; //Jos true, käytä shufflea poolin sijasta webhookissa
// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
expressApp.use(json());

expressApp.listen(PORT, () =>
  console.log(`🚀 Express running on port ${PORT}`)
);

expressApp.post('/kaaoshook', async (req: any, res: any) => {
  res.status(200).end(); // RESPOND HETI ettei tuu kasaa requesteja
  sendStringToTest(`hook`);
  try {
    let body = req.body;
    if (body.event === 'match_object_created') {
      if (!shuffleMode) {
        let embed = await webHookPool(body.payload.id);
        if (embed) {
          sendPayload(embed);
        }
      } else {
        let shuffleEmbed = await webHookShuffle(body.payload.id);
        if (shuffleEmbed) {
          sendPayload(shuffleEmbed);
        }
      }
    } else if (body.event === 'match_status_configuring') {
      let embed = webHookMmr(body);
      if (embed) {
        sendPayload(embed);
      }
    } else {
      sendStringToTest(`? ${body.event}`);
    }
  } catch (e) {
    console.log(e, 'error @ express'); //ei pitäs tapahtuu
  }
});

const sendPayload = (embed: any) => {
  const mmrChannel = client.channels.cache.get(mmrChannelId) as TextChannel;
  mmrChannel.send({ embeds: [embed] });
};
const sendString = (string: string) => {
  const mmrChannel = client.channels.cache.get(mmrChannelId) as TextChannel;
  mmrChannel.send(string);
};
const sendStringToTest = (string: string) => {
  const testChannel = client.channels.cache.get(testiChannelId) as TextChannel;
  testChannel.send(string);
};
const sendPayLoadToTest = (embed: any) => {
  const testChannel = client.channels.cache.get(testiChannelId) as TextChannel;
  testChannel.send({ embeds: [embed] });
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.on('ready', () => {
  console.log('Ready!');
  getMmrList();
  getFaceitPlayers();

  let minutes = 20 * 60 * 1000;
  setInterval(() => {
    getMmrList();
  }, minutes);
  let faceitMinutes = 57 * 60 * 1000;
  setInterval(() => {
    getFaceitPlayers();
  }, faceitMinutes);
  const guildIDKaaos = '907363330174357535';
  const guildIDFliiga = '451771912570535948';
  const guildIdHyytyy = '278695719735394314';
  const guild = client.guilds.cache.get(guildIdHyytyy);
  let commands;

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
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });
  commands?.create({
    name: 'toggleshuffle',
    description: 'Vaihtaa webhookkia Shuffle/pool (Vaatii oikeudet)',
  });
  commands?.create({
    name: 'updatelist',
    description: 'Updatee MMR listat (Vaatii oikeudet)',
  });
  commands?.create({
    name: 'test',
    description: 'juuh (Vaatii oikeudet)',
  });
  commands?.create({
    name: 'winrate',
    description: 'Laskee Radiant/Dire voitot (100 peliä)',
    options: [
      {
        name: 'luku',
        description: 'Laskettavat pelit numerona',
        type: Constants.ApplicationCommandOptionTypes.NUMBER,
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
        type: Constants.ApplicationCommandOptionTypes.STRING,
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
        type: Constants.ApplicationCommandOptionTypes.STRING,
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
        type: Constants.ApplicationCommandOptionTypes.STRING,
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
  } else if (commandName === 'toggleshuffle') {
    if (AdminUsers.includes(interaction.user.id)) {
      shuffleMode = !shuffleMode;
      console.log(`shufflemode togglettu ${shuffleMode}`);
      let reply = shuffleMode ? 'Shuffle aktivoitu' : 'Shuffle Deaktivoitu';
      interaction.reply({
        ephemeral: true,
        content: reply,
      });
    } else {
      let reply = `${interaction.user.username} is not in the sudoers file. This incident will be reported.`;
      interaction.reply({
        ephemeral: true,
        content: reply,
      });
    }
  } else if (commandName === 'updatelist') {
    if (AdminUsers.includes(interaction.user.id)) {
      getMmrList();
      getFaceitPlayers();
      interaction.reply({
        ephemeral: true,
        content: 'MMR-listojen update aloitettu',
      });
    } else {
      let reply = `${interaction.user.username} is not in the sudoers file. This incident will be reported.`;
      interaction.reply({
        ephemeral: true,
        content: reply,
      });
    }
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
