const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const Blockchain = require('./blockchain/index');
const PubSub = require('./app/PubSub');
const TransactionPool = require('./wallet/TransactionPool');
const Wallet = require('./wallet');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const DEFAULT_PORT = 3000;
const PORT = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.status(200).json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;

    const transaction = wallet.createTransaction({ recipient, amount });

    transactionPool.setTransaction(transaction);

    console.log('transactionPool', transactionPool);

    res.status(200).json({ transaction });
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