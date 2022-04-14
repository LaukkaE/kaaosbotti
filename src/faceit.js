const axios = require('axios');
require('dotenv').config();
const { mmrlista } = require('./mmrlista');
const localMmrLista = require('../localmmrlist.json');
const { k_combinations, sortByTeamBalance, sortByHighest } = require('./utils');

const hubURL =
    'https://open.faceit.com/data/v4/hubs/dfa16147-e981-4f97-8781-fe2cb0d6f765';
const matchURL = 'https://open.faceit.com/data/v4/matches';
const config = {
    headers: { Authorization: `Bearer ${process.env.FACEIT_API_CLIENT_TOKEN}` },
};
const NUMBERTORANDOMTEAMSFROM = 8;

const getMmrFromList = (name) => {
    return localMmrLista[
        `${name.toLowerCase().replace(/ /g, '').substring(0, 7)}`
    ];
};

const appendMmr = (team) => {
    return team.map((e) => {
        return [e, getMmrFromList(e) || 4004]; // jos mmr ei löydy, defaultataan 4004
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
        string += `**${e[0]}**(${e[1]}) `;
    });
    return string;
};
const parseCap = (cap) => {
    return `**${cap[0]}**(${cap[1]})`;
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

const getPlayerMmr = (name) => {
    let mmr = getMmrFromList(name);
    if (mmr) {
        return `Pelaajan ${name} MMR : **${mmr}**`;
    } else {
        return `Ei löytynyt pelaajaa : ${name}`;
    }
};

const poolMmr = async (gameId) => {
    if (!gameId || !localMmrLista) return 'botti ei valmis tjsp';
    try {
        const response = await axios.get(`${matchURL}/${gameId}`, config);
        let playerpool = [];
        response.data.teams?.faction1.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        response.data.teams?.faction2.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        playerpool = appendMmr(playerpool);
        let poolMmr = calcTotalTeamMmr(playerpool);
        let radiantCapWithMmr = playerpool[0];
        let direCapWithMmr = playerpool[5];
        let radiantCap = response.data.teams.faction1.roster[0].nickname;
        let direCap = response.data.teams.faction2.roster[0].nickname;
        playerpool = playerpool
            .filter((e) => e[0] != `${radiantCap}` && e[0] != `${direCap}`)
            .sort(sortByHighest);
        return `Radiant Cap : ${parseCap(
            radiantCapWithMmr
        )}, Dire Cap : ${parseCap(direCapWithMmr)} \nPlayerpool : ${parseTeam(
            playerpool
        )}`;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe, matchID mahdollisesti väärin';
    }
};

const calcMmr = async (gameId) => {
    if (!gameId || !localMmrLista) return 'botti ei valmis tjsp';
    try {
        const response = await axios.get(`${matchURL}/${gameId}`, config);
        let teamRadiant = [];
        let teamDire = [];
        response.data.teams?.faction1.roster.forEach((e) => {
            teamRadiant.push(e.nickname);
        });
        response.data.teams?.faction2.roster.forEach((e) => {
            teamDire.push(e.nickname);
        });
        teamRadiant = appendMmr(teamRadiant);
        teamDire = appendMmr(teamDire);
        teamRadiant = sortTeam(teamRadiant);
        teamDire = sortTeam(teamDire);
        let radiantMmr = calcTotalTeamMmr(teamRadiant);
        let direMmr = calcTotalTeamMmr(teamDire);
        return `Team Radiant : ${parseTeam(
            teamRadiant
        )}, total MMR ${radiantMmr}, **average ${Math.round(radiantMmr / 5)}**
         Team Dire : ${parseTeam(
             teamDire
         )}, total MMR ${direMmr} , **average ${Math.round(direMmr / 5)}**
         MMR-ero ${Math.abs(radiantMmr - direMmr)} ${
            radiantMmr >= direMmr ? 'Radiantille' : 'Direlle'
        }

        
        `;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe, matchID mahdollisesti väärin';
    }
};

const calcWinrate = async (games = 100) => {
    try {
        const response = await axios.get(
            `${hubURL}/matches?type=past&offset=0&limit=${games}`,
            config
        );
        let cancelled = 0;
        let radiantWins = 0;
        let direWins = 0;
        response.data.items.forEach((e) => {
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
        )}%**, cancelled pelejä ${cancelled}`;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe ;(';
    }
};

const shuffleTeams = async (gameId) => {
    if (!gameId || !localMmrLista) return 'botti ei valmis tjsp';
    try {
        const response = await axios.get(`${matchURL}/${gameId}`, config);
        let playerpool = [];
        response.data.teams?.faction1.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        response.data.teams?.faction2.roster.forEach((e) => {
            playerpool.push(e.nickname);
        });
        playerpool = appendMmr(playerpool);
        let poolMmr = calcTotalTeamMmr(playerpool);
        let radiantCapWithMmr = playerpool[0];
        let direCapWithMmr = playerpool[5];
        let radiantCap = response.data.teams.faction1.roster[0].nickname;
        let direCap = response.data.teams.faction2.roster[0].nickname;
        playerpool = playerpool.filter(
            (e) => e[0] != `${radiantCap}` && e[0] != `${direCap}`
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

        return `Tiimit Randomoitu: \n
        Team Radiant : ${parseTeam(
            teamRadiant
        )}, total MMR ${radiantMmr}, **average ${Math.round(radiantMmr / 5)}**
        Team Dire : ${parseTeam(
            teamDire
        )}, total MMR ${direMmr} , **average ${Math.round(direMmr / 5)}**
         MMR-ero ${Math.abs(radiantMmr - direMmr)} ${
            radiantMmr >= direMmr ? 'Radiantille' : 'Direlle'
        }
        `;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe, matchID mahdollisesti väärin';
    }
};

module.exports = { calcWinrate, calcMmr, shuffleTeams, getPlayerMmr, poolMmr };
