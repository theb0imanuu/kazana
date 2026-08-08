import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly service: ContactsService) {}
  @Get() findAll(@CurrentUser() u: AuthenticatedUser) { return this.service.findAll(u.id); }
  @Get(':id') findOne(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.findOne(u.id, id); }
  @Post() create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateContactDto) { return this.service.create(u.id, dto); }
  @Patch(':id') update(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateContactDto) { return this.service.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.remove(u.id, id); }
}
