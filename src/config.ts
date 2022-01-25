export const INITIAL_DIFFICULTY = 3;
export const MINE_RATE = 1000; // 1 sec

export const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '---',
  hash: 'origin-hash',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

export const STARTING_BALANCE = 1000;

export const REWARD_INPUT = {
  address: '*authorized-reward*',
  timestamp: 1642883079466,
  amount: 1,
  signature: 'sign',
};

export const MINING_REWARD = 50;

export const HOST = process.env.HOST || 'http://localhost';
export const DEFAULT_PORT = Number(process.env.PORT) || 3000;
export const PORT =
  process.env.GENERATE_PEER_PORT === 'true'
    ? DEFAULT_PORT + Math.ceil(Math.random() * 1000)
    : DEFAULT_PORT;
export const ROOT_NODE_ADDRESS = `${HOST}:${DEFAULT_PORT}`;
