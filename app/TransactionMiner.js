class TransactionMiner {
    constructor({ blockChain, transactionPool, wallet, pubSub }) {
        this.blockChain = blockChain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubSub = pubSub;
    }

    mineTransactions() {
        // get the transactions pools valid transaction

        // generate miners reward

        // add a block consisting of these transactions to the blockchain

        // broadcast the updated blockchain

        // clear the pool
    }
}

module.exports = TransactionMiner;
