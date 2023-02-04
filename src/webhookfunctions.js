// const webHookWaitPool = (gameId) => {
//     setTimeout(() => {
//         webHookPool(gameId);
//     }, 5000);
// };

const { appendMmr } = require('./faceit');
const { webHookGetMatchInfo } = require('./routing');

const webhookParseCaptain = (captain) => {
    return `${captain[0]}\n**${captain[1]} ${
        captain[2] ? `: ${captain[2]}` : ''
    }`;
};

const webhookParsePlayer = (player) => {
    return `MMR **${player[1]}**[${e[1]}] ${
        player[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }${player[2] != null ? `: ${player[2]}` : ''}`;
};

const webHookPool = async (gameId) => {
    try {
        let data = await webHookGetMatchInfo(gameId);
        if (!data) return null;
        let playerpool = [];
        data.teams?.faction1.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        data.teams?.faction2.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        playerpool = appendMmr(playerpool);
        let radiantCapWithMmr = playerpool[0];
        let direCapWithMmr = playerpool[5];
        let radiantCap = data.teams.faction1.roster[0].nickname;
        let direCap = data.teams.faction2.roster[0].nickname;
        playerpool = playerpool
            .filter(
                (e) =>
                    !e[0].includes(`${radiantCap}`) &&
                    !e[0].includes(`${direCap}`)
            )
            // .filter((e) => e[0] != `${radiantCap}` && e[0] != `${direCap}`)
            .sort(sortByHighest);
        const poolEmbed = {
            title: 'Pickit Alkaa',
            color: 52084,
            fields: [
                {
                    name: 'Radiant Captain',
                    value: webhookParseCaptain(radiantCapWithMmr),
                    inline: true,
                },
                {
                    name: 'Dire Captain',
                    value: webhookParseCaptain(direCapWithMmr),
                    inline: true,
                },
                {
                    name: `${playerpool[0][0]}`,
                    value: webhookParsePlayer(playerpool[0]),
                    inline: false,
                },
                {
                    name: `${playerpool[1][0]}`,
                    value: webhookParsePlayer(playerpool[1]),
                    inline: false,
                },
                {
                    name: `${playerpool[2][0]}`,
                    value: webhookParsePlayer(playerpool[2]),
                    inline: false,
                },
                {
                    name: `${playerpool[3][0]}`,
                    value: webhookParsePlayer(playerpool[3]),
                    inline: false,
                },
                {
                    name: `${playerpool[4][0]}`,
                    value: webhookParsePlayer(playerpool[4]),
                    inline: false,
                },
                {
                    name: `${playerpool[5][0]}`,
                    value: webhookParsePlayer(playerpool[5]),
                    inline: false,
                },
                {
                    name: `${playerpool[6][0]}`,
                    value: webhookParsePlayer(playerpool[6]),
                    inline: false,
                },
                {
                    name: `${playerpool[7][0]}`,
                    value: webhookParsePlayer(playerpool[7]),
                    inline: false,
                },
            ],
        };
        return poolEmbed;
    } catch (error) {
        console.log(error, 'webhookPoolError');
        return null;
    }
};

module.exports = { webHookPool };
