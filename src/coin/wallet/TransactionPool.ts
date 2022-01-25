import Block from "../blockchain/Block";
import Transaction from "./Transaction";

export default class TransactionPool {
  transactionMap: any;

  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction: Transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionMap: any) {
    this.transactionMap = transactionMap;
  }

  existingTransaction(inputAddress: string) {
    const transactions = Object.values(this.transactionMap);

    return transactions.find(
      (transaction: any): boolean => transaction.input.address === inputAddress
    );
  }

  validTransactions() {
    return Object.values(this.transactionMap).filter((transaction: any) =>
      Transaction.validateTransaction(transaction)
    );
  }

  clear() {
    this.transactionMap = {};
  }

  clearBlockchainTransactions(chain: Block[]) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}
