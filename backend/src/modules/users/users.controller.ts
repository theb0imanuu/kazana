import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get('me') getMe(@CurrentUser() user: AuthenticatedUser) { return this.service.findOne(user.id); }
  @Patch('me') updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserDto) { return this.service.update(user.id, dto); }
}
