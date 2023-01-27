const axios = require('axios');
const fs = require('fs');
let range = 'Vastauksista 1!B:E';
let mmrlista = {};
// const localMmrLista = require('../localmmrlist.json');

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
        console.log('MMR-lista updated');
    } catch (error) {
        console.log(error);
    }
};

module.exports = { mmrlista, getMmrList };
