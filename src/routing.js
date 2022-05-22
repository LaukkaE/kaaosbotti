const axios = require('axios');
require('dotenv').config();

const hubURL =
    'https://open.faceit.com/data/v4/hubs/dfa16147-e981-4f97-8781-fe2cb0d6f765';
const matchURL = 'https://open.faceit.com/data/v4/matches';
const config = {
    headers: { Authorization: `Bearer ${process.env.FACEIT_API_CLIENT_TOKEN}` },
};

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

const getLatestMatch = async () => {
    try {
        const response = await axios.get(
            `${hubURL}/matches?type=past&offset=0&limit=1`,
            config
        );
        // console.log(response.data.items);
        return response.data.items[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

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

module.exports = { getMatchInfo, getMatchHistory, getLatestMatch };
