import Blockchain from "../blockchain";
import Wallet from "../wallet";
import Transaction from "../wallet/Transaction";
import TransactionPool from "../wallet/TransactionPool";
import PubSub from "./PubSub";

export interface ITransactionMiner {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  pubsub: PubSub;
}

export default class TransactionMiner implements ITransactionMiner {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  pubsub: PubSub;

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
