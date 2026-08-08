import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly service: RemindersService) {}
  @Get() findAll(@CurrentUser() u: AuthenticatedUser) { return this.service.findAll(u.id); }
  @Get(':id') findOne(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.findOne(u.id, id); }
  @Post() create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateReminderDto) { return this.service.create(u.id, dto); }
  @Patch(':id') update(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateReminderDto) { return this.service.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.remove(u.id, id); }
}
