import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: { email: string; password: string; displayName: string }) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() data: { refreshToken: string }) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @MessagePattern('auth.me')
  async me(@Payload() data: { authHeader: string }) {
    return this.authService.getMe(data.authHeader);
  }
}
