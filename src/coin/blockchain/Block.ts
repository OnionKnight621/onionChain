// @ts-ignore
import hexToBin from 'hex-to-binary';

import { GENESIS_DATA, MINE_RATE } from '../../config';
import cryptoHash from '../utils/cryptoHash';

export interface IBlock {
  lastHash: string;
  hash: string;
  data: any;
  timestamp: number;
  nonce: number;
  difficulty: number;
}

export default class Block {
  lastHash: string;
  hash: string;
  data: any;
  timestamp: number;
  nonce: number;
  difficulty: number;

  constructor({ lastHash, hash, data, timestamp, nonce, difficulty }: IBlock) {
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock(lastBlock: Block, data: any) {
    const lastHash = lastBlock.hash;
    let hash, timestamp;
    let { difficulty } = lastBlock;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = this.adjustDifficulty(lastBlock, timestamp);
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBin(hash).substring(0, difficulty) !== '0'.repeat(difficulty)
    );

    return new this({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash,
    });
  }

  static adjustDifficulty(originalBlock: Block, timestamp: number) {
    const { difficulty } = originalBlock;
    const difference = timestamp - originalBlock.timestamp;

    if (difficulty < 1) return 1;
    if (difference > MINE_RATE) return difficulty - 1;

    return difficulty + 1;
  }
}

module.exports = Block;
