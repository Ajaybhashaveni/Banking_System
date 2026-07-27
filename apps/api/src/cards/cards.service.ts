import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async getUserCards(userId: string) {
    return this.prisma.card.findMany({
      where: { account: { userId } },
      include: { account: { select: { accountNumber: true, accountType: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyCard(userId: string, cardType: string) {
    const account = await this.prisma.account.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!account) {
      throw new BadRequestException('No active account found. Please create an account first.');
    }

    const cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
    const cvv = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
    const now = new Date();
    const expiryDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear() + 5).slice(-2)}`;

    return this.prisma.card.create({
      data: {
        cardNumber,
        cardType,
        expiryDate,
        cvv,
        accountId: account.id,
      },
    });
  }

  async toggleFreeze(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { account: true },
    });

    if (!card) throw new NotFoundException('Card not found');
    if (card.account.userId !== userId) throw new BadRequestException('Unauthorized');

    return this.prisma.card.update({
      where: { id: cardId },
      data: { status: card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE' },
    });
  }
}
