import {
    appendPlayerInfo,
    sortTeam,
    calcTotalTeamMmr,
    ParsedPlayer,
} from './faceit/faceitfunctions';
import {
    appendCaptain,
    constructDireTeam,
    randomATeam,
} from './faceit/shufflefuntions';
import { webHookGetMatchInfo } from './routing';
import { sortByHighest, k_combinations, sortByTeamBalance } from './utils';

const webhookParseCaptain = (captain: ParsedPlayer) => {
    return `${captain.parsedName}\n**${captain.mmr}**${
        captain.roles ? `: ${captain.roles}` : ''
    }`;
};

const webhookParsePlayer = (player: ParsedPlayer) => {
    return `MMR **${player.mmr}** ${
        player.mmr === 4004 ? '** Eioo**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }${player.parsedWinrate} ${
        player.roles != null ? `: ${player.roles}` : ''
    }`;
};
const webHookMMRParsePlayer = (player: ParsedPlayer) => {
    return `MMR **${player.mmr}** ${
        player.mmr === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
    }\nRoolit${player.roles != null ? ` ${player.roles}` : ''}`;
};

const webHookPool = async (gameId: string) => {
    try {
        let data = await webHookGetMatchInfo(gameId);
        if (!data) return null;
        let playerpool: string[] = [];
        data.teams?.faction1.roster.forEach((e: any) => {
            playerpool.push(e.nickname);
        });
        data.teams?.faction2.roster.forEach((e: any) => {
            playerpool.push(e.nickname);
        });
        let parsedPlayerList = appendPlayerInfo(playerpool);
        let direCaptain = parsedPlayerList.splice(5, 1)[0];
        let radiantCaptain = parsedPlayerList.shift();
        parsedPlayerList.sort(sortByHighest);
        const poolEmbed = {
            title: 'Pickit Alkaa',
            color: 52084,
            fields: [
                {
                    name: 'Radiant Captain',
                    value: webhookParseCaptain(radiantCaptain),
                    inline: true,
                },
                {
                    name: 'Dire Captain',
                    value: webhookParseCaptain(direCaptain),
                    inline: true,
                },
                {
                    name: `${parsedPlayerList[0].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[0]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[1].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[1]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[2].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[2]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[3].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[3]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[4].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[4]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[5].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[5]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[6].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[6]),
                    inline: false,
                },
                {
                    name: `${parsedPlayerList[7].parsedName}`,
                    value: webhookParsePlayer(parsedPlayerList[7]),
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

const webHookShuffle = async (gameId: string) => {
    let data = await webHookGetMatchInfo(gameId);
    if (!data) return null;
    try {
        let playerpool: string[] = [];
        data.teams?.faction1.roster.forEach((e: any) => {
            playerpool.push(e.nickname);
        });
        data.teams?.faction2.roster.forEach((e: any) => {
            playerpool.push(e.nickname);
        });
        let parsedPlayerList = appendPlayerInfo(playerpool);
        let poolMmr = calcTotalTeamMmr(parsedPlayerList);
        let direCaptain = parsedPlayerList.splice(5, 1)[0];
        let radiantCaptain = parsedPlayerList.shift();
        let poolCombinations = k_combinations(parsedPlayerList, 4);
        let appendedCombinations = appendCaptain(
            poolCombinations,
            radiantCaptain,
            poolMmr
        );
        appendedCombinations.sort(sortByTeamBalance);
        let teamRadiant = randomATeam(appendedCombinations);
        let teamDire = constructDireTeam(
            teamRadiant,
            parsedPlayerList,
            direCaptain
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
                    name: teamRadiant[0].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[0]),
                    inline: true,
                },
                {
                    name: teamDire[0].parsedName,
                    value: webHookMMRParsePlayer(teamDire[0]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[1].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[1]),
                    inline: true,
                },
                {
                    name: teamDire[1].parsedName,
                    value: webHookMMRParsePlayer(teamDire[1]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[2].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[2]),
                    inline: true,
                },
                {
                    name: teamDire[2].parsedName,
                    value: webHookMMRParsePlayer(teamDire[2]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[3].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[3]),
                    inline: true,
                },
                {
                    name: teamDire[3].parsedName,
                    value: webHookMMRParsePlayer(teamDire[3]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[4].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[4]),
                    inline: true,
                },
                {
                    name: teamDire[4].parsedName,
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
        console.log(e, 'WebhookshuffleError');
        return null;
    }
};

const webHookMmr = (data: any) => {
    try {
        let radiantNames: string[] = [];
        let direNames: string[] = [];
        data.payload.teams[0].roster.forEach((e: any) => {
            radiantNames.push(e.nickname);
        });
        data.payload.teams[1].roster.forEach((e: any) => {
            direNames.push(e.nickname);
        });
        let teamRadiant = appendPlayerInfo(radiantNames);
        let teamDire = appendPlayerInfo(direNames);
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
                    name: teamRadiant[0].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[0]),
                    inline: true,
                },
                {
                    name: teamDire[0].parsedName,
                    value: webHookMMRParsePlayer(teamDire[0]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[1].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[1]),
                    inline: true,
                },
                {
                    name: teamDire[1].parsedName,
                    value: webHookMMRParsePlayer(teamDire[1]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[2].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[2]),
                    inline: true,
                },
                {
                    name: teamDire[2].parsedName,
                    value: webHookMMRParsePlayer(teamDire[2]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[3].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[3]),
                    inline: true,
                },
                {
                    name: teamDire[3].parsedName,
                    value: webHookMMRParsePlayer(teamDire[3]),
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: teamRadiant[4].parsedName,
                    value: webHookMMRParsePlayer(teamRadiant[4]),
                    inline: true,
                },
                {
                    name: teamDire[4].parsedName,
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

export { webHookPool, webHookMmr, webHookShuffle };
