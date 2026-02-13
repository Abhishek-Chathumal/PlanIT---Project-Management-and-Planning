import { Controller, Get, Post, Patch, Delete, Param, Body, Inject, Headers } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesProxyController {
  constructor(@Inject('PROJECTS_SERVICE') private readonly projectsClient: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  async create(
    @Body() data: { name: string; description?: string },
    @Headers('authorization') authHeader: string,
  ) {
    return firstValueFrom(this.projectsClient.send('workspaces.create', { ...data, authHeader }));
  }

  @Get()
  @ApiOperation({ summary: 'List workspaces for current user' })
  async findAll(@Headers('authorization') authHeader: string) {
    return firstValueFrom(this.projectsClient.send('workspaces.findAll', { authHeader }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('workspaces.findOne', { id }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace' })
  async update(@Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return firstValueFrom(this.projectsClient.send('workspaces.update', { id, ...data }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workspace' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('workspaces.delete', { id }));
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to workspace' })
  async addMember(@Param('id') id: string, @Body() data: { userId: string; role?: string }) {
    return firstValueFrom(
      this.projectsClient.send('workspaces.addMember', { workspaceId: id, ...data }),
    );
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from workspace' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return firstValueFrom(
      this.projectsClient.send('workspaces.removeMember', { workspaceId: id, userId }),
    );
  }
}
