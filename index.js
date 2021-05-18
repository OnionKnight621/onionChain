const express = require('express');
const bodyParser = require('body-parser');

const Blockchain = require('./Blockchain');
const PubSub = require('./PubSub');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const PORT = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain()

    res.redirect('/api/blocks');
});

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);
});