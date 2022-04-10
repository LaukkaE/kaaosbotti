const axios = require('axios');

let range = 'Vastauksista 1!B:C';
let mmrlista = {};

const getMmrList = () => {
    axios
        .get(
            `https://sheets.googleapis.com/v4/spreadsheets/1iRYAQcRYoaovfTVYzpMNasQmd00r9542sMsJBdllLt0/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`
        )
        .then((response) => response.data)
        .then((data) => {
            data.values.shift(); // poistetaan Faceit-nimi:MMR
            data.values.forEach((e, i) => {
                if (e[0] !== undefined) {
                    mmrlista[e[0].toLowerCase()] = Number(e[1]);
                }
            });
            // console.log(mmrlista);
        })
        .catch((error) => {
            console.log(error);
        });
};

module.exports = { mmrlista, getMmrList };
