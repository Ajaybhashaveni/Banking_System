import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(async (cb) => {
              return cb({
                account: {
                  findUnique: jest.fn().mockImplementation(async ({ where }) => {
                    if (where.id === 'acc1') return { id: 'acc1', status: 'ACTIVE', balance: 1000 };
                    if (where.accountNumber === 'DEST123') return { id: 'acc2', status: 'ACTIVE', balance: 500 };
                    return null;
                  }),
                  update: jest.fn().mockResolvedValue({}),
                },
                transaction: {
                  create: jest.fn().mockResolvedValue({ id: 'txn1', amount: 100 }),
                },
              });
            }),
            transaction: {
              findMany: jest.fn().mockResolvedValue([]),
            }
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should transfer funds successfully', async () => {
    const result = await service.transfer('acc1', 'DEST123', 100, 'IMPS');
    expect(result.id).toBe('txn1');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should throw BadRequestException if amount is negative', async () => {
    await expect(service.transfer('acc1', 'DEST123', -100, 'IMPS')).rejects.toThrow(BadRequestException);
  });
});
