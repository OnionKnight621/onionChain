import { Module } from '@nestjs/common';

import { ApiController } from './app.controller';
import { ApiService } from './app.service';

@Module({
  imports: [],
  controllers: [ApiController],
  providers: [ApiService],
})
export class AppModule {}
