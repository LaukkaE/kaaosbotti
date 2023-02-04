const { appendMmr, sortTeam, calcTotalTeamMmr } = require('./faceit');
const { webHookGetMatchInfo } = require('./routing');
const { sortByHighest } = require('./utils');

const webhookParseCaptain = (captain) => {
    return `${captain[0]}\n**${captain[1]}**${
        captain[2] ? `: ${captain[2]}` : ''
    }`;
};

const webhookParsePlayer = (player) => {
    return `MMR **${player[1]}** ${
        player[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }${player[2] != null ? `: ${player[2]}` : ''}`;
};

const webHookMMRParsePlayer = (player) => {
    return `MMR **${player[1]}** ${
        player[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }\nRoolit${player[2] != null ? ` ${player[2]}` : ''}`;
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

const webHookMmr = (data) => {
    try {
        let teamRadiant = [];
        let teamDire = [];
        data.payload.teams[0].roster.forEach((e) => {
            teamRadiant.push(e.nickname);
        });
        data.payload.teams[1].roster.forEach((e) => {
            teamDire.push(e.nickname);
        });
        teamRadiant = appendMmr(teamRadiant);
        teamDire = appendMmr(teamDire);
        teamRadiant = sortTeam(teamRadiant);
        teamDire = sortTeam(teamDire);
        let radiantMmr = calcTotalTeamMmr(teamRadiant);
        let direMmr = calcTotalTeamMmr(teamDire);
        console.log(teamRadiant, 'teamrad');
        console.log(teamDire, 'teamdire');
        // let mmrEmbed = {
        //     title: 'Peli Alkaa',
        //     color: 16065893,
        //     fields: [
        //         {
        //             name: 'Radiant Captain',
        //             value: webhookParseCaptain(teamRadiant[0]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: 'Dire Captain',
        //             value: webhookParseCaptain(teamDire[0]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: '\u200B',
        //             value: '\u200B',
        //         },
        //         {
        //             name: `${teamRadiant[1][0]}`,
        //             value: webHookMMRParsePlayer(teamRadiant[1]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: `${teamDire[1][0]}`,
        //             value: webHookMMRParsePlayer(teamDire[1]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: '\u200B',
        //             value: '\u200B',
        //         },
        //         {
        //             name: `${teamRadiant[2][0]}`,
        //             value: webHookMMRParsePlayer(teamRadiant[2]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: `${teamDire[2][0]}`,
        //             value: webHookMMRParsePlayer(teamDire[2]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: '\u200B',
        //             value: '\u200B',
        //         },
        //         {
        //             name: `${teamRadiant[3][0]}`,
        //             value: webHookMMRParsePlayer(teamRadiant[3]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: `${teamDire[3][0]}`,
        //             value: webHookMMRParsePlayer(teamDire[3]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: '\u200B',
        //             value: '\u200B',
        //         },
        //         {
        //             name: `${teamRadiant[4][0]}`,
        //             value: webHookMMRParsePlayer(teamRadiant[4]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: `${teamDire[4][0]}`,
        //             value: webHookMMRParsePlayer(teamDire[4]) | 'error',
        //             inline: true,
        //         },
        //         {
        //             name: 'Lisätietoja',
        //             value:
        //                 `MMR-ero **${Math.abs(radiantMmr - direMmr)}** ${
        //                     radiantMmr >= direMmr
        //                         ? 'Radiantin eduksi'
        //                         : 'Diren eduksi'
        //                 }` | 'error',
        //             inline: false,
        //         },
        //     ],
        // };
        let testEmbed = {
            title: 'peli alkaa',
            color: 16065893,
        };
        return testEmbed;
    } catch (e) {
        console.log(e, 'webhookmmrerror');
        return null;
    }
};

module.exports = { webHookPool, webHookMmr };
