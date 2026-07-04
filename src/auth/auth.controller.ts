import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  //===================================== ENDPOINT LOGIN ====================================
  @Post('login')
  @ApiOperation({
    summary: 'Login',
  })
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }
  //=========================================================================================

  //===================================== GET PROFILE =======================================
  @Get('profile')
  @ApiOperation({
    summary: 'Get Profile',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  profile(@Req() request: Request) {
    const user = request.user as any;
    return this.authService.profile(user.userId);
  }

  //========================================================================================

}
