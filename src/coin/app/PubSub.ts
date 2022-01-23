// @ts-ignore
import redis from 'redis';
import Blockchain from '../blockchain';

import { CHANNELS } from '../constants';
import Transaction from '../wallet/Transaction';
import TransactionPool from '../wallet/TransactionPool';

export type publish = {
  channel: string;
  message: string;
};

export interface IPubSub {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
}

export default class PubSub {
  publisher: any;
  subscriber: any;
  blockchain: Blockchain;
  transactionPool: TransactionPool;

  constructor({ blockchain, transactionPool }: IPubSub) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannels();
    this.subscriber.on('message', (channel: string, message: string) =>
      this.handleMessage(channel, message),
    );
  }

  handleMessage(channel: string, message: string) {
    console.log(`Message received, msg: ${message}, channel: ${channel}`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions(parsedMessage);
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }: publish) {
    this.subscriber.unsubscribe(channel, () => {
      // do not log messages from subscriber to itself
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction: Transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}
