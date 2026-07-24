import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async transfer(fromAccountId: string, toAccountNumber: string, amount: number, type: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.prisma.$transaction(async (tx) => {
      const fromAccount = await tx.account.findUnique({ where: { id: fromAccountId } });
      if (!fromAccount) throw new NotFoundException('Source account not found');
      if (fromAccount.status !== 'ACTIVE') throw new BadRequestException('Source account is not active');
      if (fromAccount.balance < amount) throw new BadRequestException('Insufficient funds');

      const toAccount = await tx.account.findUnique({ where: { accountNumber: toAccountNumber } });
      if (!toAccount) throw new NotFoundException('Destination account not found');
      if (toAccount.status !== 'ACTIVE') throw new BadRequestException('Destination account is not active');

      await tx.account.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: amount } },
      });

      await tx.account.update({
        where: { id: toAccount.id },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          referenceId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          amount,
          type, // NEFT, RTGS, IMPS
          status: 'COMPLETED',
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          description: `Transfer to ${toAccountNumber}`,
        }
      });

      return transaction;
    });
  }

  async getAccountTransactions(accountId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
