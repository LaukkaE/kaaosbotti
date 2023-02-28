import {
    appendPlayerInfo,
    calcTotalTeamMmr,
    getPlayer,
    parseCap,
    parseTeam,
    sortTeam,
} from './faceitfunctions';
import {
    appendCaptain,
    constructDireTeam,
    randomATeam,
} from './shufflefuntions';

require('dotenv').config();
const { mmrlista } = require('../mmrlista');
const {
    k_combinations,
    sortByTeamBalance,
    sortByHighest,
} = require('../utils');
const { getMatchInfo, getMatchHistory, getLatestMatch } = require('../routing');

const MAXGAMESTOCALC = 500;

// Palauttaa pelaajan MMR numeron jos löytää sen, vain 7 ensimmäistä merkkiä lasketaan nimeen
const getPlayerMmr = (name: string): string => {
    let player = getPlayer(name);
    if (player && player.mmr) {
        return `Pelaajan ${name} MMR : **${player.mmr}**`;
    } else {
        return `Ei löytynyt pelaajaa : ${name}`;
    }
};

// Palauttaa playerpoolin stringinä MMR-järjestyksessä
const poolMmr = async (gameId: string, data: any = null): Promise<string> => {
    if (!mmrlista) return 'botti ei valmis tjsp';
    try {
        if (!data) {
            //Jos data on valmiina, tulee se MMR komennolta pickkien ollessa kesken
            if (!gameId) {
                data = await getLatestMatch();
            } else {
                data = await getMatchInfo(gameId);
            }
        }
        if (!data) return 'Ei löytynyt peliä, tarkista matchID';
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
        // parsedPlayerList = removeCaptains(parsedPlayerList).sort(sortByHighest);
        return `Radiant Cap : ${parseCap(
            radiantCaptain
        )}, Dire Cap : ${parseCap(direCaptain)} \nPlayerpool :\n${parseTeam(
            parsedPlayerList
        )}`;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe';
    }
};
//  Laskee pelien tasaisuuden
const calcMmr = async (gameId: string): Promise<string> => {
    if (!mmrlista) return 'botti ei valmis tjsp';
    try {
        let data;
        if (!gameId) {
            data = await getLatestMatch();
        } else {
            data = await getMatchInfo(gameId);
        }
        if (!data) return 'Ei löytynyt peliä, tarkista matchID';
        if (data?.status === 'CAPTAIN_PICK') {
            //Jos pickit kesken, käytetään poolMMR komentoa
            return poolMmr(null, data);
        }
        let radiantNames: string[] = [];
        let direNames: string[] = [];
        data.teams?.faction1.roster.forEach((e: any) => {
            radiantNames.push(e.nickname);
        });
        data.teams?.faction2.roster.forEach((e: any) => {
            direNames.push(e.nickname);
        });
        let teamRadiant = appendPlayerInfo(radiantNames);
        let teamDire = appendPlayerInfo(direNames);
        teamRadiant = sortTeam(teamRadiant);
        teamDire = sortTeam(teamDire);
        let radiantMmr = calcTotalTeamMmr(teamRadiant);
        let direMmr = calcTotalTeamMmr(teamDire);
        return `Team Radiant : average MMR **${Math.round(
            radiantMmr / 5
        )}**\n${parseTeam(teamRadiant)}\nTeam Dire : average MMR **${Math.round(
            direMmr / 5
        )}**\n${parseTeam(teamDire)}MMR-ero **${Math.abs(
            radiantMmr - direMmr
        )}** ${radiantMmr >= direMmr ? 'Radiantin eduksi' : 'Diren eduksi'}

        
        `;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe';
    }
};

// Laskee radiantin ja diren välisen winraten lasketuista peleistä, match historyssä on mukana cancelled pelejä, joten laskettujen pelien lukumäärä on vähemmän kun pyydettyjen pelien lukumäärä
const calcWinrate = async (games = 100): Promise<string> => {
    if (games < 0) return 'Anna positiivinen luku';
    if (games > MAXGAMESTOCALC) games = MAXGAMESTOCALC;
    try {
        let data: any[] = [];
        let startPos = 0;
        // do...while loop Syystä että: estetään faceitAPI:n "Bad pagination request: 'offset' must be a multiple of 'limit'" , jos pyydetään vaikka 444 peliä.
        do {
            let newData = await getMatchHistory(games, startPos);
            if (newData) data = [...data, ...newData];
            games -= 100;
            startPos += 100;
        } while (games >= 100);
        let cancelled = 0;
        let radiantWins = 0;
        let direWins = 0;
        data.forEach((e) => {
            if (e.status === 'CANCELLED') cancelled++;
            else if (e.results?.winner === 'faction1') radiantWins++;
            else if (e.results?.winner === 'faction2') direWins++;
            else {
                console.log('virhe', e);
            }
        });
        let totalGames = radiantWins + direWins;

        return `Radiant voitti ${radiantWins} peliä,Dire voitti ${direWins} peliä. laskettuja pelejä :${totalGames} Radiant winrate **${Math.round(
            (radiantWins * 100) / totalGames
        )}%**, dire winrate **${Math.round(
            (direWins * 100) / totalGames
        )}%**, cancelled pelejä ${cancelled}, Tarkistettuja pelejä ${
            radiantWins + direWins + cancelled
        }`;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe ;(';
    }
};

// Randomoi tiimeistä tasaiset : Tekee kaikki mahdolliset tiimit, sorttaa ne MMR eron perusteella averageen nähden, randomoi yhden tasaisimmasta päästä (configuroitava kuinka monesta randomoi), ja tunkee loput pelaajat direlle
const shuffleTeams = async (gameId: string): Promise<string> => {
    if (!mmrlista) return 'botti ei valmis tjsp';
    try {
        let data;
        if (!gameId) {
            data = await getLatestMatch();
        } else {
            data = await getMatchInfo(gameId);
        }
        if (!data) return 'Ei löytynyt peliä, tarkista matchID';
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
        // parsedPlayerList = removeCaptains(parsedPlayerList);
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

        return `Tiimit Randomoitu: \nTeam Radiant : average MMR **${Math.round(
            radiantMmr / 5
        )}**\n${parseTeam(teamRadiant)}\nTeam Dire : average MMR **${Math.round(
            direMmr / 5
        )}**\n${parseTeam(teamDire)}MMR-ero ${Math.abs(radiantMmr - direMmr)} ${
            radiantMmr >= direMmr ? 'Radiantin eduksi' : 'Diren eduksi'
        }
        `;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe';
    }
};

export { calcWinrate, calcMmr, shuffleTeams, getPlayerMmr, poolMmr };
