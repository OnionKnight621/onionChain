import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'request';

import { AppModule } from './app.module';
import { blockchain, transactionPool } from './coin';
import { DEFAULT_PORT, PORT, ROOT_NODE_ADDRESS } from './config';

const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('Syncing chain...', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);

        console.log('Syncing transactions pool map...', rootTransactionPoolMap);
        transactionPool.setMap(rootTransactionPoolMap);
      }
    },
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    cors: true
  });
  await app.listen(PORT, () => {
    Logger.log(`Running on: ${PORT}`);
    if (PORT !== DEFAULT_PORT) {
      syncWithRootState();
    }
  });
}
bootstrap();
