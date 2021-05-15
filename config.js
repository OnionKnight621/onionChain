const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
    timestamp : 1,
    lastHash  : '---',
    hash      : 'origin-hash',
    difficulty: INITIAL_DIFFICULTY,
    nonce     : 0,
    data      : []
};

module.exports = {
    GENESIS_DATA
}