import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UpiService } from './upi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('upi')
export class UpiController {
  constructor(private readonly upiService: UpiService) {}

  @Post('pay')
  async pay(@Request() req: any, @Body() body: { receiverUpiId: string; amount: number; note?: string }) {
    return this.upiService.payByUpi(req.user.sub, body.receiverUpiId, body.amount, body.note);
  }

  @Post('request')
  async requestMoney(@Request() req: any, @Body() body: { receiverUpiId: string; amount: number; note?: string }) {
    return this.upiService.requestMoney(req.user.sub, body.receiverUpiId, body.amount, body.note);
  }

  @Get('requests')
  async getRequests(@Request() req: any) {
    return this.upiService.getRequests(req.user.sub);
  }

  @Patch('requests/:id')
  async respondToRequest(@Request() req: any, @Param('id') id: string, @Body() body: { action: 'PAID' | 'DECLINED' }) {
    return this.upiService.respondToRequest(id, req.user.sub, body.action);
  }
}
