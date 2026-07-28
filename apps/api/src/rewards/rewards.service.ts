import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { rewardPoints: true } });
    return { points: user?.rewardPoints || 0, cashValue: (user?.rewardPoints || 0) * 0.1 };
  }

  async getHistory(userId: string) {
    return this.prisma.reward.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async redeem(userId: string, points: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });
    if (!user || user.rewardPoints < points) throw new BadRequestException('Insufficient points');
    if (points < 100) throw new BadRequestException('Minimum 100 points to redeem');
    const cashValue = points * 0.1;

    return this.prisma.$transaction(async (tx: any) => {
      await tx.user.update({ where: { id: userId }, data: { rewardPoints: { decrement: points } } });
      if (user.accounts[0]) {
        await tx.account.update({ where: { id: user.accounts[0].id }, data: { balance: { increment: cashValue } } });
      }
      await tx.reward.create({ data: { points: -points, type: 'REDEEMED', description: `Redeemed ${points} points for $${cashValue}`, userId } });
      return { message: `Redeemed ${points} points for $${cashValue}`, cashValue };
    });
  }

  async scratchCard(userId: string) {
    const prizes = [0, 5, 10, 15, 20, 25, 50, 100];
    const points = prizes[Math.floor(Math.random() * prizes.length)];
    if (points > 0) {
      await this.prisma.user.update({ where: { id: userId }, data: { rewardPoints: { increment: points } } });
      await this.prisma.reward.create({ data: { points, type: 'SCRATCH_CARD', description: `Won ${points} points from scratch card!`, userId } });
    }
    return { points, message: points > 0 ? `Congratulations! You won ${points} points!` : 'Better luck next time!' };
  }
}
