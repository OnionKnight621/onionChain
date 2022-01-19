import { v1 as uuid } from "uuid";
import Wallet from ".";
import { REWARD_INPUT, MINING_REWARD } from "../config";
import { verifySignature } from "../utils/Elliptic";
import { outputMap } from "./types";

export interface ITransaction {
  senderWallet?: any;
  recipient?: string;
  amount?: number;
  outputMap?: outputMap;
  input?: any;
}

export default class Transaction {
  id: any;
  outputMap: outputMap;
  input: any;

  constructor({
    senderWallet,
    recipient,
    amount,
    outputMap,
    input,
  }: ITransaction) {
    this.id = uuid();
    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input = input || this.createInput(senderWallet, this.outputMap);
  }

  createOutputMap({ senderWallet, recipient, amount }: outputMap) {
    const outputMap: outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput(senderWallet: Wallet, outputMap: outputMap) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  update({ senderWallet, recipient, amount }: outputMap) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds balance");
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] -= amount;

    this.input = this.createInput(senderWallet, this.outputMap);
  }

  static validateTransaction(transaction: Transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total: any, outputAmount) => total + outputAmount
    );

    if (amount !== outputTotal) {
      console.error(`Invalid transaction amount from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid transaction signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction(minerWallet: Wallet) {
    return new this({
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
      input: REWARD_INPUT,
    });
  }
}
