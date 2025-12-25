import { errorHandler } from './utils';

const axios = require('axios');
require('dotenv').config();

// const hubURL =
//   'https://open.faceit.com/data/v4/club/94fa6b32-b311-4596-bf03-01d947fb1a92';
const hubURL =
  'https://open.faceit.com/data/v4/hubs/94fa6b32-b311-4596-bf03-01d947fb1a92';
const KLIIGAhubURL =
  'https://open.faceit.com/data/v4/hubs/dfa16147-e981-4f97-8781-fe2cb0d6f765';
const hyytyyURL =
  'https://open.faceit.com/data/v4/hubs/c2fb8ebd-c86b-4e9d-9d9d-a3b70f6c4002';
const matchURL = 'https://open.faceit.com/data/v4/matches';
const config = {
  headers: { Authorization: `Bearer ${process.env.FACEIT_API_CLIENT_TOKEN}` },
};

const webHookGetMatchInfo = async (gameID: string, sanity = 0) => {
  if (sanity > 6) return null;
  if (!gameID) return null;
  try {
    const response = await axios.get(`${matchURL}/${gameID}`, config);
    if (response.data?.status === 'CANCELLED') {
      //Game on cancelled
      return null;
    }
    if (
      response.data?.teams?.faction1?.roster?.length > 1 //:D
    ) {
      return response.data;
    } else {
      //match_object_createdin mukana tiimitietoja ei tule, ne tulee vasta kun kaikki ovat hyväksyneet pelin, eikä siitä ole webhookkia
      return new Promise((resolve) => {
        setTimeout(async () => {
          resolve(await webHookGetMatchInfo(gameID, sanity + 1));
        }, 5000);
      });
    }
  } catch (error) {
    return errorHandler(error);
  }
};

// Hakee pelin ID:n perusteella
const getMatchInfo = async (gameID: string) => {
  if (!gameID) return null;
  try {
    const response = await axios.get(`${matchURL}/${gameID}`, config);
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};
// Hakee viimeiseksi alkaneen matsin, jos matsi on cancelled, kutsuu itsensä uudelleen.
const getLatestMatch = async (offset = 0): Promise<any> => {
  if (offset > 5) return null; //sanity
  try {
    const response = await axios.get(
      `${KLIIGAhubURL}/matches?type=all&offset=${offset}&limit=1`,
      config
    );
    if (response.data.items[0].status === 'CANCELLED') {
      return getLatestMatch(offset + 1);
    }
    return response.data.items[0];
  } catch (error) {
    return errorHandler(error);
  }
};

// Hakee pelihistorian
const getMatchHistory = async (games = 100, startPosition = 0) => {
  try {
    const response = await axios.get(
      `${KLIIGAhubURL}/matches?type=past&offset=${startPosition}&limit=${games}`,
      config
    );
    return response.data?.items;
  } catch (error) {
    console.log(error?.response?.status, 'getMatchHistoryError');
    return null;
  }
};

//hakee pelaajalistan faceitistä
const getFaceitData = async (offset = 0, numberOfPlayers = 100) => {
  try {
    const response = await axios.get(
      `${KLIIGAhubURL}/stats?type=past&offset=${offset}&limit=${numberOfPlayers}`,
      config
    );
    return response.data?.players;
  } catch (error) {
    console.log(error?.response?.status, 'getFaceitDataerror');
    return null;
  }
};

export {
  getMatchInfo,
  getMatchHistory,
  getLatestMatch,
  webHookGetMatchInfo,
  getFaceitData,
};
