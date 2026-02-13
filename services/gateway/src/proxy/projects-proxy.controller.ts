import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Inject } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsProxyController {
  constructor(@Inject('PROJECTS_SERVICE') private readonly projectsClient: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(
    @Body() data: { name: string; description?: string; color?: string; workspaceId: string },
  ) {
    return firstValueFrom(this.projectsClient.send('projects.create', data));
  }

  @Get()
  @ApiOperation({ summary: 'List projects in a workspace' })
  async findAll(@Query('workspaceId') workspaceId: string) {
    return firstValueFrom(this.projectsClient.send('projects.findAll', { workspaceId }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project with boards and buckets' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('projects.findOne', { id }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; color?: string },
  ) {
    return firstValueFrom(this.projectsClient.send('projects.update', { id, ...data }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('projects.delete', { id }));
  }

  @Post(':id/boards')
  @ApiOperation({ summary: 'Create a board in project' })
  async createBoard(@Param('id') id: string, @Body() data: { name: string }) {
    return firstValueFrom(this.projectsClient.send('boards.create', { projectId: id, ...data }));
  }

  @Post('boards/:boardId/buckets')
  @ApiOperation({ summary: 'Create a bucket in board' })
  async createBucket(
    @Param('boardId') boardId: string,
    @Body() data: { name: string; color?: string },
  ) {
    return firstValueFrom(this.projectsClient.send('buckets.create', { boardId, ...data }));
  }

  @Patch('buckets/:id')
  @ApiOperation({ summary: 'Update bucket' })
  async updateBucket(
    @Param('id') id: string,
    @Body() data: { name?: string; color?: string; position?: number },
  ) {
    return firstValueFrom(this.projectsClient.send('buckets.update', { id, ...data }));
  }

  @Delete('buckets/:id')
  @ApiOperation({ summary: 'Delete bucket' })
  async deleteBucket(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('buckets.delete', { id }));
  }
}
