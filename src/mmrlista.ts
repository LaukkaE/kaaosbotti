import axios from 'axios';
// const fs = require('fs');
const { getFaceitData } = require('./routing');
// import getFaceitData from './routing'
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
//Helpperi testaamiseen
const clearMmrList = () => {
  mmrlista = {};
};

const fuzerlist = '13SN6YVmH1iIXXOJklZy1KCCEGA6Yf3_NfhaOH43dkPQ';
const kLiigaList = '1vp8cBQVfhStgFPwuSGP_O--jta0Y2LrQJ3YgPuzeCNo';

const getMmrList = async () => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${fuzerlist}/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`
    );
    // console.log(response.data);
    response.data.values.shift(); //poista legend
    response.data.values.forEach((e: any) => {
      if (e[0] !== undefined) {
        let nickname = e[0] || null;
        let player: string = e[1]
          .toLowerCase()
          .replace(/ /g, '')
          .substring(0, 7);
        let roles = e[3]?.replace(/[^\d]/g, '');
        if (roles === '' || !roles) roles = null;
        let mmr = Number(e[2]) || null;
        // let alias = e[3] || null;
        let alias = null; // disabled
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
    console.log(error?.response?.status, 'mmrlistaupdate-error');
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
export { mmrlista, getMmrList, getFaceitPlayers, clearMmrList, Player };
