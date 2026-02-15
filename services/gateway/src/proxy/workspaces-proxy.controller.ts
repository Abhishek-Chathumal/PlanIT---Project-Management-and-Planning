import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesProxyController {
  constructor(
    @Inject('PROJECTS_SERVICE') private readonly projectsClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  private getUserId(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new UnauthorizedException('Invalid authorization header format');
    }
    const token = parts[1];

    try {
      const decoded = this.jwtService.decode(token) as { sub: string } | null;
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }
      return decoded.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  async create(
    @Body() data: { name: string; description?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    const userId = this.getUserId(authHeader);
    return firstValueFrom(
      this.projectsClient.send('workspaces.create', { ...data, ownerId: userId }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List workspaces for current user' })
  async findAll(@Headers('authorization') authHeader?: string) {
    const userId = this.getUserId(authHeader);
    return firstValueFrom(this.projectsClient.send('workspaces.findAll', { userId }));
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

  @Post(':id/projects')
  @ApiOperation({ summary: 'Create a project in workspace' })
  async createProject(
    @Param('id') workspaceId: string,
    @Body() data: { name: string; description?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.getUserId(authHeader); // Validate user is authenticated
    return firstValueFrom(this.projectsClient.send('projects.create', { ...data, workspaceId }));
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'List projects in workspace' })
  async getProjects(@Param('id') workspaceId: string) {
    return firstValueFrom(this.projectsClient.send('projects.findAll', { workspaceId }));
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
