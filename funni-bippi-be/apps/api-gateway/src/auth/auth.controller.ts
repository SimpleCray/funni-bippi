import { Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session/init')
  async initSession() {
    return this.authService.createSession();
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
