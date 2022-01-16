const Blockchain = require('./index');
const Block = require('./Block');
const cryptoHash = require('../utils/cryptoHash');
const Wallet = require('../wallet');
const Transaction = require('../wallet/Transaction');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        errorMock = jest.fn();

        global.console.error = errorMock;
        originalChain = blockchain.chain;
    });

    it('should contain a "chain" Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('should starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('should add a new block to a chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('should return false', () => {
                blockchain.chain[0] = { data: 'fake-genesis' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'pepe' });
                blockchain.addBlock({ data: 'popo' });
                blockchain.addBlock({ data: 'pepo' });
            });

            describe('and lastHash reference has changed', () => {
                it('should return false', () => {
                    blockchain.chain[2].lastHash = 'brokenHash'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with invalid field', () => {
                it('should return false', () => {
                    blockchain.chain[2].data = 'brokenData'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with jumped difficulty', () => {
                it('should return false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock = new Block({ timestamp, lastHash, difficulty, nonce, data, hash });
                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and chain does not contain any invalid blocks', () => {
                it('should return true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' };
                blockchain.replaceChain(newChain.chain);
            });

            it('should not replace the cahin', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'pepe' });
                newChain.addBlock({ data: 'popo' });
                newChain.addBlock({ data: 'pepo' });
            });

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'fakeHash';
                    blockchain.replaceChain(newChain.chain);
                });

                it('should not replace the cahin', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('should replace the cahin', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs a chain replaccement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'foob', amount: 65 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('and transaction data is valid', () => {
            it('should return true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and transaction data has multiple rewards', () => {
            it('should return false and log an error', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and transaction data has malformed outputMap', () => {
            describe('and transaction is not a reward transaction', () => {
                it('should return false and log an error', () => {
                    transaction.outputMap[wallet.publicKey] = 99999;

                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and transaction is a reward transaction', () => {
                it('should return false and log an error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 99999;

                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and transaction data has malformed input', () => {
            it('should return false and log an error', () => {
                wallet.balance = 9000;

                const evilOutputMap = {
                    [wallet.publicKey]: 9000 - 100,
                    fooRecipient: 100,
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap,
                };

                newChain.addBlock({ data: [evilTransaction, rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and transaction data has multiple identical transactions', () => {
            it('should return false and log an error', () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction]
                });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});

// transactions validation rules
// 1: Each transaction must be correctly formatted
// 2: Only one mining reward per block
// 3: Valid input amouns according balance in blockchain history
// 4: Block must not have identical transactions