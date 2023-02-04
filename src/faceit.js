require('dotenv').config();
const { mmrlista } = require('./mmrlista');
// const localMmrLista = require('../localmmrlist.json');
const { k_combinations, sortByTeamBalance, sortByHighest } = require('./utils');
const { getMatchInfo, getMatchHistory, getLatestMatch } = require('./routing');

const NUMBERTORANDOMTEAMSFROM = 5;
const MAXGAMESTOCALC = 500;

const getMmrFromList = (name) => {
    if (mmrlista[`${name.toLowerCase()?.replace(/ /g, '').substring(0, 7)}`]) {
        return mmrlista[
            `${name.toLowerCase()?.replace(/ /g, '').substring(0, 7)}`
        ][0];
    }
    return null;
};
const getRolesFromList = (name) => {
    if (mmrlista[`${name.toLowerCase().replace(/ /g, '').substring(0, 7)}`]) {
        return mmrlista[
            `${name.toLowerCase().replace(/ /g, '').substring(0, 7)}`
        ][1];
    }
    return null;
};

const getAliasFromList = (name) => {
    if (mmrlista[`${name.toLowerCase().replace(/ /g, '').substring(0, 7)}`]) {
        let alias =
            mmrlista[
                `${name.toLowerCase().replace(/ /g, '').substring(0, 7)}`
            ][2];
        if (alias) {
            return `${alias}(${name})`;
        }
    }
    return name;
};

const appendMmr = (team) => {
    return team.map((e) => {
        return [
            getAliasFromList(e),
            getMmrFromList(e) || 4004, // jos mmr ei löydy, defaultataan 4004
            getRolesFromList(e),
        ];
    });
};
const calcTotalTeamMmr = (team) => {
    return team.reduce((acc, val) => {
        return acc + val[1];
    }, 0);
};
const sortTeam = (team) => {
    let cap = team.shift();
    team.sort(sortByHighest);
    team.unshift(cap);
    return team;
};

const parseTeam = (team) => {
    let string = '';
    team.forEach((e) => {
        // let nameMMR = `**${e[0]}**(${e[1]}) ${
        //     e[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
        // }`;
        // let roolit = `${e[2] != null ? `Roolit : **${e[2]}**` : ''}`;
        // let minLength = 60;
        // minLength -= nameMMR.length;
        // minLength -= roolit.length;
        // if (minLength <= 0) minLength = 0;
        // string += `${nameMMR} ${' '.repeat(minLength)}${roolit}\n`;
        string += `**${e[0]}**[${e[1]}] ${
            e[1] === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
        }${e[2] != null ? `: **${e[2]}**` : ''}\n`;
    });
    return string;
};
const parseCap = (cap) => {
    return `**${cap[0]}**[${cap[1]}]`;
};
const appendCaptain = (combinations, captain, poolMmr) => {
    for (let i = 0; i < combinations.length; i++) {
        combinations[i].unshift(captain);
        combinations[i].push([
            'MMRDEVIATIONFROMAVG',
            Math.abs(calcTotalTeamMmr(combinations[i]) - poolMmr / 2),
        ]);
    }
    return combinations;
};

const randomATeam = (sortedTeams) => {
    let team = sortedTeams[Math.floor(Math.random() * NUMBERTORANDOMTEAMSFROM)]; // valitsee jonkun parhaiten balansoidusta
    team.pop(); //poista MMR
    team = sortTeam(team);
    return team;
};
const constructDireTeam = (radiant, playerpool, direCapWithMmr) => {
    const radiantToDelete = new Set(radiant);

    const team = [
        direCapWithMmr,
        ...playerpool
            .filter((e) => {
                return !radiantToDelete.has(e);
            })
            .sort(sortByHighest),
    ];
    return team;
};

// Palauttaa pelaajan MMR numeron jos löytää sen, vain 7 ensimmäistä merkkiä lasketaan nimeen
const getPlayerMmr = (name) => {
    let mmr = getMmrFromList(name);
    if (mmr) {
        return `Pelaajan ${name} MMR : **${mmr}**`;
    } else {
        return `Ei löytynyt pelaajaa : ${name}`;
    }
};

// Palauttaa playerpoolin stringinä MMR-järjestyksessä
const poolMmr = async (gameId, data = null) => {
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
        return `Radiant Cap : ${parseCap(
            radiantCapWithMmr
        )}, Dire Cap : ${parseCap(direCapWithMmr)} \nPlayerpool :\n${parseTeam(
            playerpool
        )}`;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe';
    }
};
//  Laskee pelien tasaisuuden
const calcMmr = async (gameId) => {
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
            //Jos pickit keske, käytetään poolMMR komentoa
            return poolMmr(null, data);
        }
        let teamRadiant = [];
        let teamDire = [];
        data.teams?.faction1.roster.forEach((e) => {
            teamRadiant.push(e.nickname);
        });
        data.teams?.faction2.roster.forEach((e) => {
            teamDire.push(e.nickname);
        });
        teamRadiant = appendMmr(teamRadiant);
        teamDire = appendMmr(teamDire);
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
const calcWinrate = async (games = 100) => {
    if (games < 0) return 'Anna positiivinen luku';
    if (games > MAXGAMESTOCALC) games = MAXGAMESTOCALC;
    try {
        let data = [];
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
const shuffleTeams = async (gameId) => {
    if (!mmrlista) return 'botti ei valmis tjsp';
    try {
        let data;
        if (!gameId) {
            data = await getLatestMatch();
        } else {
            data = await getMatchInfo(gameId);
        }
        if (!data) return 'Ei löytynyt peliä, tarkista matchID';
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

module.exports = {
    calcWinrate,
    calcMmr,
    shuffleTeams,
    getPlayerMmr,
    poolMmr,
    appendMmr,
    sortTeam,
    calcTotalTeamMmr,
};
