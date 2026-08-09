import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.companiesService.findAll(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companiesService.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(user.id, id, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companiesService.remove(user.id, id);
  }
}
