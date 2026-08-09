import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.activitiesService.findAll(user.id);
  }

  @Post('notes')
  async createNote(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNoteDto,
  ) {
    return this.activitiesService.createNote(user.id, dto);
  }
}
