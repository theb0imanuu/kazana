import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivitiesService } from './activities.service';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}
  @Get() findAll(@CurrentUser() u: AuthenticatedUser) { return this.service.findAll(u.id); }
  @Get(':id') findOne(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.findOne(u.id, id); }
  @Post() create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateActivityDto) { return this.service.create(u.id, dto); }
  @Patch(':id') update(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateActivityDto) { return this.service.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.remove(u.id, id); }
}
