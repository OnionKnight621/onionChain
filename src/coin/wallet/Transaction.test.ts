import Transaction from "./Transaction";
import Wallet from ".";
import { verifySignature } from "../utils/Elliptic";
import { REWARD_INPUT, MINING_REWARD } from "../config";

describe("Transaction", () => {
  let transaction: Transaction,
    senderWallet: Wallet,
    recipient: string,
    amount: number;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recipient-public-key";
    amount = 50;
    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it('should has an "id"', () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it('should has an "outputMap"', () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("should output the amount to recipient", () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it("should output the remaining balance for the sender wallet", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe("input", () => {
    it('should has an "input"', () => {
      expect(transaction).toHaveProperty("input");
    });

    it('should has a "timestamp" in the input', () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });

    it('should set the "amount" of sender wallet balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('should set the "address" to the sender wallet "publicKey"', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('should sign the "input"', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe(true);
    });
  });

  describe("validateTransaction()", () => {
    let errorMock: any;

    beforeEach(() => {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe("when transaction is valid", () => {
      it("should return true", () => {
        expect(Transaction.validateTransaction(transaction)).toBe(true);
      });
    });

    describe("when transaction is invalid", () => {
      describe("and a transaction outputMap is invalid", () => {
        it("should return false", () => {
          transaction.outputMap[senderWallet.publicKey] = 500000;

          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and a transaction signature is invalid", () => {
        it("should return false", () => {
          transaction.input.signature = new Wallet().sign("data");

          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });

  describe("update()", () => {
    let originalSignature: any,
      originalSenderOutput: any,
      nextRecipient: string,
      nextAmount: number;

    describe("and the amount is valid", () => {
      it("should throw an error", () => {
        expect(() => {
          transaction.update({
            senderWallet,
            recipient: "foo",
            amount: 999999,
          });
        }).toThrow("Amount exceeds balance");
      });
    });

    describe("and the amount is valid", () => {
      beforeEach(() => {
        originalSignature = transaction.input.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextRecipient = "next-recipient";
        nextAmount = 50;

        transaction.update({
          senderWallet,
          recipient: nextRecipient,
          amount: nextAmount,
        });
      });

      it("should output the amount to the next recipient", () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
      });

      it("should subtract the amount from the original sender output amount", () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
          originalSenderOutput - nextAmount
        );
      });

      it("should maintain total output that matches the input amount", () => {
        expect(
          Object.values(transaction.outputMap).reduce(
            (total: any, outputAmount) => total + outputAmount
          )
        ).toEqual(transaction.input.amount);
      });

      it("should re-sign the transaction", () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });

      describe("and another update for the same recipient", () => {
        let addedAmount: number;

        beforeEach(() => {
          addedAmount = 80;

          transaction.update({
            senderWallet,
            recipient: nextRecipient,
            amount: addedAmount,
          });
        });

        it("should add the recipient amount", () => {
          expect(transaction.outputMap[nextRecipient]).toEqual(
            nextAmount + addedAmount
          );
        });

        it("should subtract the amount from the original sender output amount", () => {
          expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
            originalSenderOutput - addedAmount - nextAmount
          );
        });
      });
    });
  });

  describe("rewardTransaction()", () => {
    let rewardTransaction: Transaction, minerWallet: Wallet;

    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transaction.rewardTransaction(minerWallet);
    });

    it("should create transaction with reward input", () => {
      expect(rewardTransaction.input).toEqual(REWARD_INPUT);
    });

    it("should create transaction for miner with mining reward", () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(
        MINING_REWARD
      );
    });
  });
});
