import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import {
  blockchain,
  pubsub,
  transactionMiner,
  transactionPool,
  wallet,
} from './coin';
import Wallet from './coin/wallet';

export type mineBlock = {
  data: any;
};

export type transact = {
  amount: number;
  recipient: string;
};

@Injectable()
export class ApiService {
  pong() {
    return {
      message: 'pong',
    };
  }

  getBlocks() {
    return blockchain.chain;
  }

  mineBlock(body: mineBlock) {
    const { data } = body;

    blockchain.addBlock(data);

    pubsub.broadcastChain();
  }

  transact(res: Response, body: transact) {
    const { amount, recipient } = body;
    let transaction: any = transactionPool.existingTransaction(
      wallet.publicKey,
    );

    try {
      if (transaction) {
        transaction.update({ senderWallet: wallet, recipient, amount });
      } else {
        transaction = wallet.createTransaction({
          recipient,
          amount,
          chain: blockchain.chain,
        });
      }
    } catch (err) {
      return res.status(400).json({ type: 'error', message: err.message });
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    return { type: 'success', transaction };
  }

  transactionPoolMap() {
    return transactionPool.transactionMap;
  }

  mineTransactions() {
    return transactionMiner.mineTransactions();
  }

  walletInfo() {
    const address = wallet.publicKey;

    return {
      address,
      balance: Wallet.calculateBalance(blockchain.chain, address),
    };
  }
}
