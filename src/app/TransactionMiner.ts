import Transaction from "../wallet/Transaction";

export interface ITransactionMiner {
  blockchain: any;
  transactionPool: any;
  wallet: any;
  pubsub: any;
}

export default class TransactionMiner implements ITransactionMiner {
  blockchain: any;
  transactionPool: any;
  wallet: any;
  pubsub: any;

  constructor({
    blockchain,
    transactionPool,
    wallet,
    pubsub,
  }: ITransactionMiner) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions() {
    // get the transactions pools valid transaction
    const validTransactions = this.transactionPool.validTransactions();

    // generate miners reward
    validTransactions.push(Transaction.rewardTransaction(this.wallet));

    // add a block consisting of these transactions to the blockchain
    this.blockchain.addBlock(validTransactions);

    // broadcast the updated blockchain
    this, this.pubsub.broadcastChain();

    // clear the pool
    this.transactionPool.clear();
  }
}
