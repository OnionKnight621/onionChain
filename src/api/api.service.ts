import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import {
  blockchain,
  pubsub,
  transactionMiner,
  transactionPool,
  wallet,
} from '../coin';
import Wallet from '../coin/wallet';

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

  generateSomeData() {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();

    const genWalletTransaction = ({ wallet, recipient, amount }) => {
      const transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain,
      });

      transactionPool.setTransaction(transaction);
    };

    const walletAction = () =>
      genWalletTransaction({ wallet, recipient: wallet1.publicKey, amount: 5 });
    const walletAction1 = () =>
      genWalletTransaction({
        wallet: wallet1,
        recipient: wallet2.publicKey,
        amount: 15,
      });
    const walletAction2 = () =>
      genWalletTransaction({
        wallet: wallet2,
        recipient: wallet.publicKey,
        amount: 25,
      });

    for (let i = 0; i < 10; i++) {
      if (i % 3 === 0) {
        walletAction();
        walletAction1();
      } else if (i % 3 === 1) {
        walletAction();
        walletAction2();
      } else {
        walletAction1();
        walletAction2();
      }

      transactionMiner.mineTransactions();
    }

    return { message: 'Some data generated' };
  }
}
