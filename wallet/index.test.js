const Wallet = require('./index');
const { verifySignature } = require('../utils/Elliptic');
const Transaction = require('./Transaction');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('should has a "balance"', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('should has a "publicKey"', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'someData';

        it('should verify signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('should not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('createTransaction()', () => {
        describe('and the amount exceeds the balance', () => {
            it('should throw an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' })).toThrow('Amount exceeds balance');
            });
        });

        describe('and amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            });

            it('should create an instance of "Transaction"', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('should match the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('should output the amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });
    });
});