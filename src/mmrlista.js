const axios = require('axios');
const fs = require('fs');
const { getFaceitData } = require('./routing');
let range = 'Vastauksista 1!B:E';
let mmrlista = {};
let faceitlista = {};
// const localMmrLista = require('../localmmrlist.json');

//TODO: yhdistä mmrlista ja faceitlista (offseason)

// Tallentaa listan objectiin muodossa {nimi:[mmr,roolit,alias]}
const getMmrList = async () => {
    try {
        // mmrlista = {};
        const response = await axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/1TlP5V9JCKHxBxtuPAIbsb4egNZyIEPj7a_1XYFFCEJQ/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`
        );
        response.data.values.shift(); //poista legend
        response.data.values.forEach((e, i) => {
            if (e[0] !== undefined) {
                let roles = e[2]?.replace(/[^\d]/g, '');
                let alias = e[3] || null;
                if (roles === '') roles = null;
                mmrlista[e[0].toLowerCase().replace(/ /g, '').substring(0, 7)] =
                    [Number(e[1]), roles, alias];
            }
            // let json = JSON.stringify(mmrlista);
            // fs.writeFileSync('localmmrlist.json', json);
        });
    } catch (error) {
        console.log(error, 'mmrlistaupdate-error');
    }
};
const getFaceitPlayers = async () => {
    let offset = 0;
    let playerArray = [];
    let sanity = 0;
    while (sanity < 20) {
        //jos pelaajien määrä > 2k ei löydä kaikkia sanity checkin takia
        const players = await getFaceitData(offset);
        if (!players) break;
        offset += 100;
        sanity++;
        playerArray = [...playerArray, ...players];
        if (players.length < 100) break;
    }
    playerArray.forEach((player) => {
        faceitlista[
            player['nickname'].toLowerCase().replace(/ /g, '').substring(0, 7)
        ] = {
            Winrate: player.stats['Win Rate %'],
            MatchesPlayed: player.stats['Matches'],
        };
    });
};

module.exports = { mmrlista, getMmrList, getFaceitPlayers, faceitlista };
