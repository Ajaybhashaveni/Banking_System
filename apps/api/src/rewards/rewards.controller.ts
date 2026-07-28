import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.rewardsService.getBalance(req.user.sub);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.rewardsService.getHistory(req.user.sub);
  }

  @Post('redeem')
  async redeem(@Request() req: any, @Body() body: { points: number }) {
    return this.rewardsService.redeem(req.user.sub, body.points);
  }

  @Post('scratch-card')
  async scratchCard(@Request() req: any) {
    return this.rewardsService.scratchCard(req.user.sub);
  }
}
