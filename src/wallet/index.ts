import Transaction from "./Transaction";
import cryptoHash from "../utils/cryptoHash";
import { ec } from "../utils/Elliptic";
import { STARTING_BALANCE } from "../config";
import { createTransactionInput } from "./types";

export default class Wallet {
  balance: number;
  keyPair: any;
  publicKey: string;

  constructor() {
    this.balance = STARTING_BALANCE;

    this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data: any) {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({ recipient, amount, chain }: createTransactionInput) {
    if (chain) {
      this.balance = Wallet.calculateBalance(chain, this.publicKey);
    }

    if (amount > this.balance) {
      throw new Error("Amount exceeds balance");
    }

    return new Transaction({
      senderWallet: this,
      recipient,
      amount,
    });
  }

  static calculateBalance(chain: any, address: string) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal += addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }
}
