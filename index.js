const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');

const Blockchain = require('./blockchain/index');
const PubSub = require('./app/PubSub');
const TransactionPool = require('./wallet/TransactionPool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/TransactionMiner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3001;
const PORT = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());
app.use(cors());

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
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
        }
    } catch (err) {
        return res.status(400).json({ type: "error", message: err.message });
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.status(200).json({ type: "success", transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.status(200).json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;

    res.status(200).json({
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    });
});

const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('Syncing chain...', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('Syncing transactions pool map...', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

const wallet1 = new Wallet();
const wallet2 = new Wallet();

const genWalletTransavtion = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
        recipient, amount, chain: blockchain.chain
    })

    transactionPool.setTransaction(transaction);
}

const walletaction = () => genWalletTransavtion({ wallet, recipient: wallet1.publicKey, amount: 5 })
const walletaction1 = () => genWalletTransavtion({ wallet: wallet1, recipient: wallet2.publicKey, amount: 15 })
const walletaction2 = () => genWalletTransavtion({ wallet: wallet2, recipient: wallet.publicKey, amount: 25 })

for (let i = 0; i < 10; i++) {
    if (i%3 === 0) {
        walletaction()
        walletaction1()
    } else if (i%3 === 1) {
        walletaction()
        walletaction2()
    } else {
        walletaction1()
        walletaction2()
    }

    transactionMiner.mineTransactions()
}

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});