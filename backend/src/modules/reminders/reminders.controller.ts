import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersQueryDto } from './dto/reminders-query.dto';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() query: RemindersQueryDto,
  ) {
    return this.remindersService.findAll(user.id, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remindersService.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user.id, id, dto);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remindersService.complete(user.id, id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remindersService.remove(user.id, id);
  }
}
