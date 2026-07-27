import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  private readonly INTEREST_RATES: Record<string, number> = {
    HOME: 8.5,
    CAR: 9.5,
    PERSONAL: 12.0,
  };

  async getUserLoans(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyLoan(userId: string, loanType: string, amount: number, tenureMonths: number) {
    const interestRate = this.INTEREST_RATES[loanType] || 12.0;
    const monthlyRate = interestRate / 12 / 100;
    const emiAmount =
      monthlyRate === 0
        ? amount / tenureMonths
        : (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
          (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    return this.prisma.loan.create({
      data: {
        loanType,
        amount,
        interestRate,
        tenureMonths,
        emiAmount: Math.round(emiAmount * 100) / 100,
        userId,
      },
    });
  }
}
