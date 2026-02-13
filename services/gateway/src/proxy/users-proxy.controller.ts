import { Controller, Get, Patch, Param, Body, Inject } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersProxyController {
  constructor(@Inject('USERS_SERVICE') private readonly usersClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return firstValueFrom(this.usersClient.send('users.findAll', {}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.usersClient.send('users.findOne', { id }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async update(
    @Param('id') id: string,
    @Body() data: { displayName?: string; avatarUrl?: string },
  ) {
    return firstValueFrom(this.usersClient.send('users.update', { id, ...data }));
  }
}
