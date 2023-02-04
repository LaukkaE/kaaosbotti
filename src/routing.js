const axios = require('axios');
require('dotenv').config();

const hubURL =
    'https://open.faceit.com/data/v4/hubs/dfa16147-e981-4f97-8781-fe2cb0d6f765';
const matchURL = 'https://open.faceit.com/data/v4/matches';
const config = {
    headers: { Authorization: `Bearer ${process.env.FACEIT_API_CLIENT_TOKEN}` },
};

const webHookGetMatchInfo = async (gameID, sanity = 0) => {
    if (sanity > 6) return null;
    if (!gameID) return null;
    try {
        const response = await axios.get(`${matchURL}/${gameID}`, config);
        // if (response.data?.items[0]?.status === 'CANCELLED') {
        //     console.log('cancel');
        //     return null;
        // }
        if (response.data?.teams.faction1.roster.length > 0) {
            console.log('senddata');
            return response.data;
        } else {
            console.log('wait');
            //match_object_createdin mukana tiimitietoja ei tule, ne tulee vasta kun kaikki ovat hyväksyneet pelin, eikä siitä ole webhookkia
            setTimeout(async () => {
                return await getMatchInfo(gameID, sanity + 1);
            }, 5000);
        }
    } catch (error) {
        if (error?.response.status === 404) {
            console.log('404error');
            return null;
        }
        console.log(error);
        return null;
    }
};

// Hakee pelin ID:n perusteella
const getMatchInfo = async (gameID) => {
    if (!gameID) return null;
    try {
        const response = await axios.get(`${matchURL}/${gameID}`, config);
        return response.data;
    } catch (error) {
        if (error?.response.status === 404) {
            console.log('404error');
            return null;
        }
        console.log(error);
        return null;
    }
};
// Hakee viimeiseksi alkaneen matsin, jos matsi on cancelled, kutsuu itsensä uudelleen.
const getLatestMatch = async (offset = 0) => {
    if (offset > 5) return null; //sanity
    try {
        const response = await axios.get(
            `${hubURL}/matches?type=all&offset=${offset}&limit=1`,
            config
        );
        if (response.data.items[0].status === 'CANCELLED') {
            // TESTAAMATON
            return getLatestMatch(offset + 1);
        }
        return response.data.items[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

// Hakee pelihistorian
const getMatchHistory = async (games = 100, startPosition = 0) => {
    try {
        const response = await axios.get(
            `${hubURL}/matches?type=past&offset=${startPosition}&limit=${games}`,
            config
        );
        return response.data?.items;
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = {
    getMatchInfo,
    getMatchHistory,
    getLatestMatch,
    webHookGetMatchInfo,
};
