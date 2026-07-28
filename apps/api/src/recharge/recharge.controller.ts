import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RechargeService } from './recharge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recharge')
export class RechargeController {
  constructor(private readonly rechargeService: RechargeService) {}

  @Get('operators')
  getOperators() {
    return this.rechargeService.getOperators();
  }

  @Get('plans/:operator')
  getPlans(@Param('operator') operator: string) {
    return this.rechargeService.getPlans(operator);
  }

  @Post('pay')
  async recharge(@Request() req: any, @Body() body: { mobileNumber: string; operator: string; planType: string; amount: number; planDetails?: string }) {
    return this.rechargeService.recharge(req.user.sub, body.mobileNumber, body.operator, body.planType, body.amount, body.planDetails);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.rechargeService.getHistory(req.user.sub);
  }
}
