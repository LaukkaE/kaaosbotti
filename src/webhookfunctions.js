const {
    appendMmr,
    sortTeam,
    calcTotalTeamMmr,
    appendCaptain,
    constructDireTeam,
} = require('./faceit');
const { webHookGetMatchInfo } = require('./routing');
const { sortByHighest, k_combinations, sortByTeamBalance } = require('./utils');

const webhookParseCaptain = (captain) => {
    return `${captain[0]}\n**${captain[1]}**${
        captain[2] ? `: ${captain[2]}` : ''
    }`;
};

const webhookParsePlayer = (player) => {
    return `MMR **${player[1]}** ${
        player[1] === 4004 ? '** Eioo**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }${player[3]} ${player[2] != null ? `: ${player[2]}` : ''}`;
};
const webHookMMRParsePlayer = (player) => {
    return `MMR **${player[1]}** ${
        player[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }\nRoolit${player[2] != null ? ` ${player[2]}` : ''}`;
};

const webHookParseTeam = (team) => {
    let string = '';
    team.forEach((e) => {
        string += `**${e[0]}**\n**${e[1]}**${
            e[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
        }${e[2] != null ? `: **${e[2]}**` : ''}\n`;
    });
    return string;
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

const webHookShuffle = async (gameId) => {
    let data = await webHookGetMatchInfo(gameId);
    if (!data) return null;
    try {
        let playerpool = [];
        data.teams?.faction1.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        data.teams?.faction2.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        playerpool = appendMmr(playerpool);
        let poolMmr = calcTotalTeamMmr(playerpool);
        let radiantCapWithMmr = playerpool[0];
        let direCapWithMmr = playerpool[5];
        let radiantCap = data.teams.faction1.roster[0].nickname;
        let direCap = data.teams.faction2.roster[0].nickname;
        playerpool = playerpool.filter(
            (e) =>
                !e[0].includes(`${radiantCap}`) && !e[0].includes(`${direCap}`)
            // .filter((e) => e[0] != `${radiantCap}` && e[0] != `${direCap}`)
        );
        let poolCombinations = k_combinations(playerpool, 4);
        let appendedCombinations = appendCaptain(
            poolCombinations,
            radiantCapWithMmr,
            poolMmr
        );
        appendedCombinations.sort(sortByTeamBalance);
        let teamRadiant = randomATeam(appendedCombinations);
        let teamDire = constructDireTeam(
            teamRadiant,
            playerpool,
            direCapWithMmr
        );
        let radiantMmr = calcTotalTeamMmr(teamRadiant);
        let direMmr = calcTotalTeamMmr(teamDire);
        const shuffleEmbed = {
            title: 'Pelaajat randomoitu',
            color: '#00b0f4',
            fields: [
                {
                    name: 'Radiant',
                    value: `**${Math.round(radiantMmr / 5)}** average`,
                    inline: true,
                },
                {
                    name: 'Dire',
                    value: `**${Math.round(direMmr / 5)}** average`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[0][0],
                    value: webHookMMRParsePlayer(teamRadiant[0]),
                    inline: true,
                },
                {
                    name: teamDire[0][0],
                    value: webHookMMRParsePlayer(teamDire[0]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[1][0],
                    value: webHookMMRParsePlayer(teamRadiant[1]),
                    inline: true,
                },
                {
                    name: teamDire[1][0],
                    value: webHookMMRParsePlayer(teamDire[1]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[2][0],
                    value: webHookMMRParsePlayer(teamRadiant[2]),
                    inline: true,
                },
                {
                    name: teamDire[2][0],
                    value: webHookMMRParsePlayer(teamDire[2]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[3][0],
                    value: webHookMMRParsePlayer(teamRadiant[3]),
                    inline: true,
                },
                {
                    name: teamDire[3][0],
                    value: webHookMMRParsePlayer(teamDire[3]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[4][0],
                    value: webHookMMRParsePlayer(teamRadiant[4]),
                    inline: true,
                },
                {
                    name: teamDire[4][0],
                    value: webHookMMRParsePlayer(teamDire[4]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: 'Lisätietoja',
                    value: `MMR-ero **${Math.abs(radiantMmr - direMmr)}** ${
                        radiantMmr >= direMmr
                            ? 'Radiantin eduksi'
                            : 'Diren eduksi'
                    }`,
                    inline: false,
                },
            ],
        };
        return shuffleEmbed;
    } catch (e) {
        console.log(e, 'webhookmmrerror');
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

        const newEmbed = {
            title: 'Peli Alkaa',
            color: 16065893,
            fields: [
                {
                    name: 'Radiant',
                    value: `**${Math.round(radiantMmr / 5)}** average`,
                    inline: true,
                },
                {
                    name: 'Dire',
                    value: `**${Math.round(direMmr / 5)}** average`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[0][0],
                    value: webHookMMRParsePlayer(teamRadiant[0]),
                    inline: true,
                },
                {
                    name: teamDire[0][0],
                    value: webHookMMRParsePlayer(teamDire[0]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[1][0],
                    value: webHookMMRParsePlayer(teamRadiant[1]),
                    inline: true,
                },
                {
                    name: teamDire[1][0],
                    value: webHookMMRParsePlayer(teamDire[1]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[2][0],
                    value: webHookMMRParsePlayer(teamRadiant[2]),
                    inline: true,
                },
                {
                    name: teamDire[2][0],
                    value: webHookMMRParsePlayer(teamDire[2]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[3][0],
                    value: webHookMMRParsePlayer(teamRadiant[3]),
                    inline: true,
                },
                {
                    name: teamDire[3][0],
                    value: webHookMMRParsePlayer(teamDire[3]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[4][0],
                    value: webHookMMRParsePlayer(teamRadiant[4]),
                    inline: true,
                },
                {
                    name: teamDire[4][0],
                    value: webHookMMRParsePlayer(teamDire[4]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: 'Lisätietoja',
                    value: `MMR-ero **${Math.abs(radiantMmr - direMmr)}** ${
                        radiantMmr >= direMmr
                            ? 'Radiantin eduksi'
                            : 'Diren eduksi'
                    }`,
                    inline: false,
                },
            ],
        };
        return newEmbed;
    } catch (e) {
        console.log(e, 'webhookmmrerror');
        return null;
    }
};

module.exports = { webHookPool, webHookMmr, webHookShuffle };
