const Block = require('./Block');
const cryptoHash = require('./cryptoHash');
const { GENESIS_DATA } = require('./config');

describe('Block', () => {
    const timestamp = 'someDate';
    const lastHash = 'someLastHash';
    const hash = 'someHash';
    const data = ['blockchain', 'data'];
    const block = new Block({ timestamp, lastHash, hash, data });

    it ('has a timestamp, lastHash, hash, data', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('should return a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('should return genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it('should return a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('should set the "lastHash" to be the "hash" of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('should set the "data"', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('should set a "timestamp"', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('should create a SHA256 hash based on input', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data));
        });
    })
});