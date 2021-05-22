const Transaction = require('./Transaction');
const Wallet = require('./index');
const { verifySignature } = require('../utils/Elliptic');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({ senderWallet, recipient, amount });
    });

    it('should has an "id"', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('should has an "outputMap"', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('should output the amount to recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('should output the remaining balance for the sender wallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {
        it('should has an "input"', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('should has a "timestamp" in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('should set the "amount" of sender wallet balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('should set the "address" to the sender wallet "publicKey"', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('should sign the "input"', () => {
            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data     : transaction.outputMap,
                signature: transaction.input.signature
            })).toBe(true);
        });
    });
});