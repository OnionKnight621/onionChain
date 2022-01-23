const Blocchain = require("../blockchain/index");

const blockchain = new Blocchain();

blockchain.addBlock("init");

console.log("fb", blockchain.chain[blockchain.chain.length - 1]);

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

  blockchain.addBlock(`block-${i}`);
  nextBlock = blockchain.chain[blockchain.chain.length - 1];

  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = times.reduce((total, num) => total + num) / times.length;
  console.log(
    `Added 'block-${i}'. TTM: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Avg: ${average}ms`
  );
}
