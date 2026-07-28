import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get('providers')
  getProviders() {
    return this.billsService.getProviders();
  }

  @Post('pay')
  async payBill(@Request() req: any, @Body() body: { category: string; provider: string; consumerNumber: string; amount: number }) {
    return this.billsService.payBill(req.user.sub, body.category, body.provider, body.consumerNumber, body.amount);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.billsService.getHistory(req.user.sub);
  }
}
