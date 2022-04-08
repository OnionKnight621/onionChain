import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiService } from './api.service';

@Controller('/api')
export class ApiController {
  constructor(private readonly appService: ApiService) {}

  @Get('/ping')
  ping(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.appService.pong());
  }

  @Get('/blocks')
  @HttpCode(HttpStatus.OK)
  blocks(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.appService.getBlocks());
  }

  @Post('/mine')
  mine(@Res() res: Response, @Body() body) {
    this.appService.mineBlock(body);

    return res.status(HttpStatus.OK).redirect('blocks');
  }

  @Post('/transact')
  transact(@Res() res: Response, @Body() body) {
    return res.status(HttpStatus.OK).json(this.appService.transact(res, body));
  }

  @Get('/transaction-pool-map')
  transactionPoolMap(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.appService.transactionPoolMap());
  }

  @Get('/mine-transactions')
  mineTransactions(@Res() res: Response) {
    this.appService.mineTransactions();

    return res.status(HttpStatus.OK).redirect('blocks');
  }

  @Get('/wallet-info')
  walletInfo(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.appService.walletInfo());
  }

  @Get('/generate-some-data')
  generateSomeData(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.appService.generateSomeData());
  }
}
