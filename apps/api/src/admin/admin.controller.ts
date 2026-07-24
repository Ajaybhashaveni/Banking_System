import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // In a real app we'd add a RolesGuard for 'ADMIN'
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('kyc/:id/approve')
  @ApiOperation({ summary: 'Approve KYC for a user' })
  approveKyc(@Param('id') id: string) {
    return this.adminService.approveKyc(id);
  }

  @Patch('account/:id/freeze')
  @ApiOperation({ summary: 'Freeze an account' })
  freezeAccount(@Param('id') id: string) {
    return this.adminService.freezeAccount(id);
  }
}
