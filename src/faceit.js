const axios = require('axios');
require('dotenv').config();

const baseURL =
    'https://open.faceit.com/data/v4/hubs/dfa16147-e981-4f97-8781-fe2cb0d6f765';

const config = {
    headers: { Authorization: `Bearer ${process.env.FACEIT_API_CLIENT_TOKEN}` },
};

const calcWinrate = async (games = 40) => {
    try {
        const response = await axios.get(
            `${baseURL}/matches?type=past&offset=0&limit=${games}`,
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

module.exports = { calcWinrate };
