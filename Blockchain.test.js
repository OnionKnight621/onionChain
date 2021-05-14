const Blockchain = require('./Blockchain');
const Block = require('./Block');

describe('Blockchain', () => {
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
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

    describe('isValidChainChain()', () => {
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
});