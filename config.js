const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000; // 1 sec

const GENESIS_DATA = {
    timestamp : 1,
    lastHash  : '---',
    hash      : 'origin-hash',
    difficulty: INITIAL_DIFFICULTY,
    nonce     : 0,
    data      : []
};

const STARTING_BALANCE = 1000;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE
};
