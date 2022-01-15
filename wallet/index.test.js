const Wallet = require('./index');
const { verifySignature } = require('../utils/Elliptic');
const Transaction = require('./Transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

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

        describe('and a chain is passed', () => {
            it('should call calculateBalance()', () => {
                const calculateBalanceMock = jest.fn();
                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({ recipient: 'foo', amount: 10, chain: new Blockchain().chain });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => {
            it('should return initial balance', () => {
                expect(
                    Wallet.calculateBalance({ 
                        chain: blockchain.chain, 
                        address: wallet.publicKey 
                    })
                ).toEqual(STARTING_BALANCE);
            });
        });

        describe('and there are outputs for the wallet', () => {
            let transaction1, transaction2;

            beforeEach(() => {
                transaction1 = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });

                transaction2 = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 10
                });

                blockchain.addBlock({ data: [transaction1, transaction2] });
            });

            it('should return the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({ 
                        chain: blockchain.chain, 
                        address: wallet.publicKey 
                    })
                ).toEqual(
                    STARTING_BALANCE + 
                    transaction1.outputMap[wallet.publicKey] + 
                    transaction2.outputMap[wallet.publicKey]
                );
            });
        });
    });
});