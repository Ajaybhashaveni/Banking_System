import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveKyc(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'APPROVED' },
    });
  }

  async freezeAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');

    return this.prisma.account.update({
      where: { id: accountId },
      data: { status: 'FROZEN' },
    });
  }

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const pendingKyc = await this.prisma.user.count({ where: { kycStatus: 'PENDING' } });
    const totalTransactions = await this.prisma.transaction.count();
    
    return {
      totalUsers,
      pendingKyc,
      totalTransactions,
    };
  }
}
