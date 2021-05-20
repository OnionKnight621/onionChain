const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const Blockchain = require('./blockchain/index');
const PubSub = require('./app/PubSub');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const PORT = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('Syncing chain...', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncChains();
    }
});