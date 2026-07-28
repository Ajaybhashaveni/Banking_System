import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get('funds')
  getFunds() {
    return this.investmentsService.getFunds();
  }

  @Get('gold-price')
  getGoldPrice() {
    return this.investmentsService.getGoldPrice();
  }

  @Post('buy-fund')
  async buyFund(@Request() req: any, @Body() body: { fundName: string; amount: number }) {
    return this.investmentsService.buyFund(req.user.sub, body.fundName, body.amount);
  }

  @Post('buy-gold')
  async buyGold(@Request() req: any, @Body() body: { grams: number }) {
    return this.investmentsService.buyGold(req.user.sub, body.grams);
  }

  @Post('sell-gold')
  async sellGold(@Request() req: any, @Body() body: { holdingId: string }) {
    return this.investmentsService.sellGold(req.user.sub, body.holdingId);
  }

  @Get('portfolio')
  async getPortfolio(@Request() req: any) {
    return this.investmentsService.getPortfolio(req.user.sub);
  }
}
