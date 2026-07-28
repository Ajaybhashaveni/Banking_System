import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RechargeService {
  constructor(private prisma: PrismaService) {}

  getOperators() {
    return ['JIO', 'AIRTEL', 'VI', 'BSNL'];
  }

  getPlans(operator: string) {
    const plans: Record<string, any[]> = {
      JIO: [
        { name: 'Unlimited', amount: 239, validity: '28 days', data: '1.5GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Popular', amount: 479, validity: '56 days', data: '1.5GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Annual', amount: 2999, validity: '365 days', data: '2.5GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Data Pack', amount: 61, validity: '30 days', data: '6GB Total', details: 'Data only pack' },
      ],
      AIRTEL: [
        { name: 'Smart Pack', amount: 265, validity: '28 days', data: '1GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Super Value', amount: 455, validity: '56 days', data: '1.5GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Yearly', amount: 2999, validity: '365 days', data: '2GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Data Booster', amount: 48, validity: '28 days', data: '3GB Total', details: 'Data only' },
      ],
      VI: [
        { name: 'Hero Unlimited', amount: 249, validity: '28 days', data: '1GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Double Data', amount: 475, validity: '56 days', data: '2GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Max', amount: 2899, validity: '365 days', data: '1.5GB/day', details: 'Unlimited calls + 100 SMS/day' },
      ],
      BSNL: [
        { name: 'Plan Voucher', amount: 197, validity: '30 days', data: '2GB/day', details: 'Unlimited calls + 100 SMS/day' },
        { name: 'Annual', amount: 2399, validity: '365 days', data: '2GB/day', details: 'Unlimited calls + 100 SMS/day' },
      ],
    };
    return plans[operator] || [];
  }

  async recharge(userId: string, mobileNumber: string, operator: string, planType: string, amount: number, planDetails?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });
    if (!user?.accounts?.[0]) throw new BadRequestException('No account found');
    if (user.accounts[0].balance < amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: user.accounts[0].id }, data: { balance: { decrement: amount } } });
      const recharge = await tx.recharge.create({ data: { mobileNumber, operator, planType, amount, planDetails, userId } });
      await tx.transaction.create({ data: { referenceId: `RCH${Date.now()}${Math.floor(Math.random() * 1000)}`, amount, type: 'RECHARGE', status: 'COMPLETED', description: `${operator} recharge - ${mobileNumber}`, category: 'RECHARGE', fromAccountId: user.accounts[0].id } });
      const points = Math.floor(amount / 10);
      if (points > 0) {
        await tx.user.update({ where: { id: userId }, data: { rewardPoints: { increment: points } } });
        await tx.reward.create({ data: { points, type: 'EARNED', description: `Recharge: ${operator}`, userId } });
      }
      return recharge;
    });
  }

  async getHistory(userId: string) {
    return this.prisma.recharge.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }
}
