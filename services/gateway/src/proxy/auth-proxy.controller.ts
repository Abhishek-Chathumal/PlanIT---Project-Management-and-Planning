import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthProxyController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: { email: string; password: string; displayName: string }) {
    return firstValueFrom(this.authClient.send('auth.register', dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: { email: string; password: string }) {
    return firstValueFrom(this.authClient.send('auth.login', dto));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: { refreshToken: string }) {
    return firstValueFrom(this.authClient.send('auth.refresh', dto));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }
    return firstValueFrom(this.authClient.send('auth.me', { authHeader }));
  }
}
