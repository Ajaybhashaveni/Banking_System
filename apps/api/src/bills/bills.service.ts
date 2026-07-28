import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  getProviders() {
    return {
      ELECTRICITY: ['TATA Power', 'Adani Electricity', 'BESCOM', 'MSEDCL'],
      WATER: ['Municipal Water Board', 'Delhi Jal Board', 'BWSSB'],
      GAS: ['Indraprastha Gas', 'Mahanagar Gas', 'Gujarat Gas'],
      INTERNET: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL'],
      DTH: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'Sun Direct'],
      BROADBAND: ['BSNL Broadband', 'Airtel Broadband', 'Jio Fiber'],
    };
  }

  async payBill(userId: string, category: string, provider: string, consumerNumber: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });
    if (!user?.accounts?.[0]) throw new BadRequestException('No account found');
    if (user.accounts[0].balance < amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: user.accounts[0].id }, data: { balance: { decrement: amount } } });
      const bill = await tx.billPayment.create({ data: { category, provider, consumerNumber, amount, userId } });
      await tx.transaction.create({ data: { referenceId: `BILL${Date.now()}${Math.floor(Math.random() * 1000)}`, amount, type: 'BILL', status: 'COMPLETED', description: `${category} bill - ${provider}`, category: 'BILL', fromAccountId: user.accounts[0].id } });
      const points = Math.floor(amount / 10);
      if (points > 0) {
        await tx.user.update({ where: { id: userId }, data: { rewardPoints: { increment: points } } });
        await tx.reward.create({ data: { points, type: 'EARNED', description: `Bill payment: ${provider}`, userId } });
      }
      return bill;
    });
  }

  async getHistory(userId: string) {
    return this.prisma.billPayment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }
}
