const Transaction = require('./Transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);

        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    validTransactions() {
        return Object.values(this.transactionMap)
            .filter(transaction => Transaction.validateTransaction(transaction));
    }
}

module.exports = TransactionPool;