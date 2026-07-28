import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UpiService {
  constructor(private prisma: PrismaService) {}

  async payByUpi(senderUserId: string, receiverUpiId: string, amount: number, note?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const receiver = await this.prisma.user.findUnique({ where: { upiId: receiverUpiId }, include: { accounts: true } });
    if (!receiver) throw new NotFoundException('UPI ID not found');
    const sender = await this.prisma.user.findFirst({ where: { id: senderUserId }, include: { accounts: true } });
    if (!sender?.accounts?.[0]) throw new BadRequestException('No account found');
    if (sender.accounts[0].balance < amount) throw new BadRequestException('Insufficient balance');
    if (!receiver.accounts?.[0]) throw new BadRequestException('Receiver has no account');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: sender.accounts[0].id }, data: { balance: { decrement: amount } } });
      await tx.account.update({ where: { id: receiver.accounts[0].id }, data: { balance: { increment: amount } } });
      const transaction = await tx.transaction.create({
        data: { referenceId: `UPI${Date.now()}${Math.floor(Math.random() * 1000)}`, amount, type: 'UPI', status: 'COMPLETED', description: note || `UPI payment to ${receiverUpiId}`, category: 'TRANSFER', fromAccountId: sender.accounts[0].id, toAccountId: receiver.accounts[0].id }
      });
      await tx.notification.create({ data: { userId: receiver.id, title: 'Money Received', message: `${sender.firstName} sent you $${amount} via UPI`, type: 'PUSH' } });
      // Award reward points
      const points = Math.floor(amount / 10);
      if (points > 0) {
        await tx.user.update({ where: { id: senderUserId }, data: { rewardPoints: { increment: points } } });
        await tx.reward.create({ data: { points, type: 'EARNED', description: `UPI payment of $${amount}`, userId: senderUserId } });
      }
      return transaction;
    });
  }

  async requestMoney(senderUserId: string, receiverUpiId: string, amount: number, note?: string) {
    const receiver = await this.prisma.user.findUnique({ where: { upiId: receiverUpiId } });
    if (!receiver) throw new NotFoundException('UPI ID not found');
    return this.prisma.paymentRequest.create({
      data: { amount, note, senderId: senderUserId, receiverId: receiver.id }
    });
  }

  async getRequests(userId: string) {
    return this.prisma.paymentRequest.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: { sender: { select: { firstName: true, lastName: true, upiId: true } }, receiver: { select: { firstName: true, lastName: true, upiId: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async respondToRequest(requestId: string, userId: string, action: 'PAID' | 'DECLINED') {
    const request = await this.prisma.paymentRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== userId) throw new BadRequestException('Invalid request');
    if (request.status !== 'PENDING') throw new BadRequestException('Request already processed');
    if (action === 'PAID') {
      await this.payByUpi(userId, (await this.prisma.user.findUnique({ where: { id: request.senderId } }))!.upiId!, request.amount, 'Payment for request');
    }
    return this.prisma.paymentRequest.update({ where: { id: requestId }, data: { status: action } });
  }
}
