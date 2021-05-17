const hexToBin = require('hex-to-binary');

const Block = require('./Block');
const cryptoHash = require('./cryptoHash');
const { GENESIS_DATA, MINE_RATE } = require('./config');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'someLastHash';
    const hash = 'someHash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty });

    it ('has all data', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
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
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    lastBlock.hash,
                    data
                )
            );
        });

        it('should set a "hash" that matches the difficulty', () => {
            expect(hexToBin(minedBlock.hash).substring(0, minedBlock.difficulty))
                .toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
            
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('should raise difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({ 
                originalBlock: block,
                timestamp    : block.timestamp + MINE_RATE - 100 //less than
            })).toEqual(block.difficulty + 1);
        });

        it('should lower difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({ 
                originalBlock: block,
                timestamp    : block.timestamp + MINE_RATE + 100 // more than
            })).toEqual(block.difficulty - 1);
        });

        it('should has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
        })
    });
});