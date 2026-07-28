import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        loans: true,
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, twoFactorSecret, ...result } = user as any;
    return result;
  }

  async findByUpiId(upiId: string) {
    const user = await this.prisma.user.findUnique({
      where: { upiId },
      select: { id: true, firstName: true, lastName: true, upiId: true },
    });
    return user;
  }
}
