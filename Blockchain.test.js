const Blockchain = require('./Blockchain');
const Block = require('./Block');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

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

            describe('and chain contains a block with invalid field', () => {
                it('should return false', () => {
                    blockchain.chain[2].data = 'brokenData'

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
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
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
});