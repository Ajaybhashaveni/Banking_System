import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cards' })
  getUserCards(@Request() req: any) {
    return this.cardsService.getUserCards(req.user.sub);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply for a new card' })
  applyCard(@Request() req: any, @Body() body: { cardType: string }) {
    return this.cardsService.applyCard(req.user.sub, body.cardType);
  }

  @Patch(':id/freeze')
  @ApiOperation({ summary: 'Toggle freeze/unfreeze card' })
  toggleFreeze(@Request() req: any, @Param('id') id: string) {
    return this.cardsService.toggleFreeze(id, req.user.sub);
  }
}
