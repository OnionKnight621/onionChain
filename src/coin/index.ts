import Blockchain from './blockchain';
import PubSub from './app/PubSub';
import TransactionPool from './wallet/TransactionPool';
import Wallet from './wallet';
import TransactionMiner from './app/TransactionMiner';

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();
export const pubsub = new PubSub({ blockchain, transactionPool });
export const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
});