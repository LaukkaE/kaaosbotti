const axios = require('axios');
// const fs = require('fs');
const { getFaceitData } = require('./routing');
let range = 'Vastauksista 1!B:E';
let mmrlista: Record<string, Player> = {};
// const localMmrLista = require('../localmmrlist.json');


//mmrlista key muodossa : nickname.toLowerCase().replace(/ /g, '').substring(0, 7);
interface Player {
    nickname: string | null;
    alias: string | null;
    mmr: number | null;
    roles: string | null;
    matchesPlayed?: number | null;
    winRate?: number | null;
}
const getMmrList = async () => {
    try {
        const response = await axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/1TlP5V9JCKHxBxtuPAIbsb4egNZyIEPj7a_1XYFFCEJQ/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`
        );
        response.data.values.shift(); //poista legend
        response.data.values.forEach((e: any) => {
            console.log(e[0]);
            if (e[0] !== undefined) {
                let nickname = e[0] || null;
                let player: string = e[0]
                    .toLowerCase()
                    .replace(/ /g, '')
                    .substring(0, 7);
                let roles = e[2]?.replace(/[^\d]/g, '');
                if (roles === '' || !roles) roles = null;
                let mmr = Number(e[1]) || null;
                let alias = e[3] || null;
                mmrlista[player] = {
                    ...mmrlista[player],
                    nickname,
                    roles,
                    mmr,
                    alias,
                };
            }
            // let json = JSON.stringify(mmrlista);
            // fs.writeFileSync('localmmrlist.json', json);
        });
    } catch (error) {
        console.log(error, 'mmrlistaupdate-error');
    }
};

interface FaceitPlayerStats {
    'Win Rate %': string;
    Matches: string;
}

interface FaceitPlayer {
    nickname: string;
    stats: FaceitPlayerStats;
}

const getFaceitPlayers = async () => {
    let offset = 0;
    let playerArray: any[] = [];
    let sanity = 0;
    while (sanity < 25) {
        //jos pelaajien määrä > 2,5k ei löydä kaikkia sanity checkin takia
        const players = await getFaceitData(offset);
        if (!players) break;
        offset += 100;
        sanity++;
        playerArray = [...playerArray, ...players];
        if (players.length < 100) break;
    }
    playerArray.forEach((player: FaceitPlayer) => {
        let nickname = player['nickname']
            .toLowerCase()
            .replace(/ /g, '')
            .substring(0, 7);
        mmrlista[nickname] = {
            ...mmrlista[nickname],
            matchesPlayed: Number(player.stats.Matches) || null,
            winRate: Number(player.stats['Win Rate %']) || null,
        };
    });
    // let json = JSON.stringify(mmrlista);
    // fs.writeFileSync('localmmrlist.json', json);
};

// module.exports = { mmrlista, getMmrList, getFaceitPlayers };
export { mmrlista, getMmrList, getFaceitPlayers, Player };