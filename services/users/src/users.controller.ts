import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.findAll')
  async findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('users.findOne')
  async findOne(@Payload() data: { id: string }) {
    return this.usersService.findOne(data.id);
  }

  @MessagePattern('users.update')
  async update(@Payload() data: { id: string; displayName?: string; avatarUrl?: string }) {
    const { id, ...updateData } = data;
    return this.usersService.update(id, updateData);
  }
}
