// const { webHookWaitPool } = require('./webhookfunctions');

// const webHookRouter = require('express').Router();
// // const { sendPayload } = require('./index');

// webHookRouter.post('/', async (req, res) => {
//     try {
//         let body = req.body;
//         if (body.event === 'match_object_created') {
//             // sendPayload(`matchcreate id ${body.payload.id}`);
//             webHookWaitPool(body.payload.id);
//         } else if (body.event === 'match_status_configuring') {
//             sendPayload(`matchready id ${body.payload.id}`);
//         }
//         res.status(200).end(); // Responding is important
//     } catch (e) {
//         console.log(e, 'webhookerror'); //ei pitäs tapahtuu
//     }
// });
// module.exports = webHookRouter;
