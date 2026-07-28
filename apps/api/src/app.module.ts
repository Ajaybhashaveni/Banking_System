import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CardsModule } from './cards/cards.module';
import { LoansModule } from './loans/loans.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UpiModule } from './upi/upi.module';
import { BillsModule } from './bills/bills.module';
import { RechargeModule } from './recharge/recharge.module';
import { InvestmentsModule } from './investments/investments.module';
import { RewardsModule } from './rewards/rewards.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AdminModule,
    TransactionsModule,
    CardsModule,
    LoansModule,
    NotificationsModule,
    UpiModule,
    BillsModule,
    RechargeModule,
    InvestmentsModule,
    RewardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
