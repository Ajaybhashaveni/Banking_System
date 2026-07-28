import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  getFunds() {
    return [
      { name: 'SBI Bluechip Fund', type: 'EQUITY', nav: 78.45, returns1Y: 15.2, returns3Y: 12.8, risk: 'High' },
      { name: 'HDFC Mid-Cap Fund', type: 'EQUITY', nav: 112.30, returns1Y: 22.1, returns3Y: 18.5, risk: 'High' },
      { name: 'ICICI Prudential Bond Fund', type: 'DEBT', nav: 34.20, returns1Y: 7.8, returns3Y: 8.2, risk: 'Low' },
      { name: 'Axis Hybrid Fund', type: 'HYBRID', nav: 56.78, returns1Y: 11.5, returns3Y: 10.2, risk: 'Medium' },
      { name: 'Kotak Small Cap Fund', type: 'EQUITY', nav: 198.90, returns1Y: 28.5, returns3Y: 22.1, risk: 'Very High' },
      { name: 'Nippon Liquid Fund', type: 'DEBT', nav: 25.10, returns1Y: 6.2, returns3Y: 6.5, risk: 'Low' },
    ];
  }

  getGoldPrice() {
    return { pricePerGram: 72.50, change24h: 0.85 };
  }

  async buyFund(userId: string, fundName: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });
    if (!user?.accounts?.[0]) throw new BadRequestException('No account found');
    if (user.accounts[0].balance < amount) throw new BadRequestException('Insufficient balance');
    const fund = this.getFunds().find(f => f.name === fundName);
    if (!fund) throw new BadRequestException('Fund not found');
    const units = amount / fund.nav;

    return this.prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: user.accounts[0].id }, data: { balance: { decrement: amount } } });
      const investment = await tx.investment.create({ data: { fundName, fundType: fund.type, amount, units, navPrice: fund.nav, userId } });
      await tx.transaction.create({ data: { referenceId: `INV${Date.now()}${Math.floor(Math.random() * 1000)}`, amount, type: 'INVESTMENT', status: 'COMPLETED', description: `Investment in ${fundName}`, category: 'INVESTMENT', fromAccountId: user.accounts[0].id } });
      return investment;
    });
  }

  async buyGold(userId: string, grams: number) {
    const goldPrice = this.getGoldPrice();
    const amount = grams * goldPrice.pricePerGram;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });
    if (!user?.accounts?.[0]) throw new BadRequestException('No account found');
    if (user.accounts[0].balance < amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: user.accounts[0].id }, data: { balance: { decrement: amount } } });
      const holding = await tx.goldHolding.create({ data: { grams, purchasePrice: goldPrice.pricePerGram, userId } });
      await tx.transaction.create({ data: { referenceId: `GOLD${Date.now()}${Math.floor(Math.random() * 1000)}`, amount, type: 'INVESTMENT', status: 'COMPLETED', description: `Gold purchase: ${grams}g`, category: 'GOLD', fromAccountId: user.accounts[0].id } });
      return holding;
    });
  }

  async sellGold(userId: string, holdingId: string) {
    const holding = await this.prisma.goldHolding.findUnique({ where: { id: holdingId } });
    if (!holding || holding.userId !== userId) throw new BadRequestException('Invalid holding');
    const goldPrice = this.getGoldPrice();
    const amount = holding.grams * goldPrice.pricePerGram;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });

    return this.prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: user!.accounts[0].id }, data: { balance: { increment: amount } } });
      await tx.goldHolding.delete({ where: { id: holdingId } });
      await tx.transaction.create({ data: { referenceId: `GSELL${Date.now()}${Math.floor(Math.random() * 1000)}`, amount, type: 'INVESTMENT', status: 'COMPLETED', description: `Gold sold: ${holding.grams}g`, category: 'GOLD', toAccountId: user!.accounts[0].id } });
      return { message: 'Gold sold', amount };
    });
  }

  async getPortfolio(userId: string) {
    const investments = await this.prisma.investment.findMany({ where: { userId, status: 'ACTIVE' } });
    const goldHoldings = await this.prisma.goldHolding.findMany({ where: { userId } });
    return { investments, goldHoldings, goldPrice: this.getGoldPrice() };
  }
}
