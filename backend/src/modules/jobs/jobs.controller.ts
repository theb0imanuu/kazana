import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsQueryDto } from './dto/jobs-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.create(user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() query: JobsQueryDto,
  ) {
    return this.jobsService.findAll(user.id, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(user.id, id, dto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.jobsService.updateStatus(user.id, id, dto);
  }

  @Patch(':id/priority')
  @HttpCode(HttpStatus.OK)
  async updatePriority(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriorityDto,
  ) {
    return this.jobsService.updatePriority(user.id, id, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.remove(user.id, id);
  }
}
