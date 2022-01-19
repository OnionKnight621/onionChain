export const INITIAL_DIFFICULTY = 3;
export const MINE_RATE = 1000; // 1 sec

export const GENESIS_DATA = {
    timestamp : 1,
    lastHash  : '---',
    hash      : 'origin-hash',
    difficulty: INITIAL_DIFFICULTY,
    nonce     : 0,
    data      : []
};

export const STARTING_BALANCE = 1000;

export const REWARD_INPUT = {
    address: '*authorized-reward*'
};

export const MINING_REWARD = 50;

// module.exports = {
//     GENESIS_DATA,
//     MINE_RATE,
//     STARTING_BALANCE,
//     REWARD_INPUT,
//     MINING_REWARD,
// };
