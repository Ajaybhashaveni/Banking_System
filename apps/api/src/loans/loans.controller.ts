import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @ApiOperation({ summary: 'Get user loans' })
  getUserLoans(@Request() req: any) {
    return this.loansService.getUserLoans(req.user.sub);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply for a loan' })
  applyLoan(@Request() req: any, @Body() body: { loanType: string; amount: number; tenureMonths: number }) {
    return this.loansService.applyLoan(req.user.sub, body.loanType, body.amount, body.tenureMonths);
  }
}
