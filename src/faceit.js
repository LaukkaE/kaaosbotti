const axios = require('axios');
require('dotenv').config();
const { mmrlista } = require('./mmrlista');

const hubURL =
    'https://open.faceit.com/data/v4/hubs/dfa16147-e981-4f97-8781-fe2cb0d6f765';

const matchURL = 'https://open.faceit.com/data/v4/matches';
const config = {
    headers: { Authorization: `Bearer ${process.env.FACEIT_API_CLIENT_TOKEN}` },
};

const getMmrFromList = (name) => {
    return mmrlista[`${name.toLowerCase()}`];
};

const appendMmr = (team) => {
    return team.map((e) => {
        return [e, getMmrFromList(e) || 3880]; // jos mmr ei löydy, defaultataan 3880
    });
};
const calcTotalTeamMmr = (team) => {
    return team.reduce((acc, val) => {
        return acc + val[1];
    }, 0);
};

const parseTeam = (team) => {
    let string = '';
    team.forEach((e) => {
        string += `**${e[0]}**(${e[1]}) `;
    });
    return string;
};

const calcMmr = async (gameId) => {
    if (!gameId || !mmrlista) return 'botti ei valmis tjsp';
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
        let radiantMmr = calcTotalTeamMmr(teamRadiant);
        let direMmr = calcTotalTeamMmr(teamDire);
        return `Team Radiant : ${parseTeam(
            teamRadiant
        )}, total MMR ${radiantMmr}, **average ${Math.round(radiantMmr / 5)}**
        Team Dire : ${parseTeam(
            teamDire
        )}, total MMR ${direMmr} , **average ${Math.round(direMmr / 5)}**
         MMR-ero ${Math.abs(radiantMmr - direMmr)}
        
        `;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe, matchID mahdollisesti väärin';
    }
};

const calcWinrate = async (games = 40) => {
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

        return `Radiant voitti ${radiantWins} peliä,Dire voitti ${direWins} peliä. laskettuja pelejä :${totalGames} Radiant winrate ${Math.round(
            (radiantWins * 100) / totalGames
        )}%, dire winrate ${Math.round(
            (direWins * 100) / totalGames
        )}%, cancelled pelejä ${cancelled}`;
    } catch (error) {
        console.log(error);
        return 'Tapahtui virhe ;(';
    }
};

module.exports = { calcWinrate, calcMmr };
