import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds between accounts' })
  transfer(@Body() body: { fromAccountId: string; toAccountNumber: string; amount: number; type: string }) {
    return this.transactionsService.transfer(body.fromAccountId, body.toAccountNumber, body.amount, body.type);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get transactions for an account' })
  getAccountTransactions(@Param('accountId') accountId: string) {
    return this.transactionsService.getAccountTransactions(accountId);
  }
}
