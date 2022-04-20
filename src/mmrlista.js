const axios = require('axios');
const fs = require('fs');
let range = 'Vastauksista 1!B:D';
let mmrlista = {};
const localMmrLista = require('../localmmrlist.json');

const getMmrList = async () => {
    try {
        mmrlista = {};
        const response = await axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/1iRYAQcRYoaovfTVYzpMNasQmd00r9542sMsJBdllLt0/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`
        );
        response.data.values.shift();
        response.data.values.forEach((e, i) => {
            if (e[0] !== undefined) {
                mmrlista[e[0].toLowerCase().replace(/ /g, '').substring(0, 7)] =
                    [Number(e[1]), e[2]?.replace(/[^\d]/g, '')];
            }
            let json = JSON.stringify(mmrlista);
            fs.writeFileSync('localmmrlist.json', json);
        });
        console.log('MMR-lista updated');
    } catch (error) {
        console.log(error);
    }
};

module.exports = { mmrlista, getMmrList };
