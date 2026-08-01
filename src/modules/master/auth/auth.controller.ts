import { Body, Controller, Post, Get, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import { ApiLogin, ApiLogout, ApiProfile } from './decorators/auth-swagger.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  //===================================== ENDPOINT LOGIN ====================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Success Login")
  @ApiLogin()
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }
  //=========================================================================================

  //===================================== ENDPOINT LOGOUT ====================================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Logout')
  @ApiLogout()
  logout() {
    return this.authService.logout();
  }

  //=========================================================================================

  //===================================== GET PROFILE =======================================
  @Get('profile')
  @ResponseMessage("Success Get Profile")
  @UseGuards(JwtAuthGuard)
  @ApiProfile()
  profile(@Req() request: Request) {
    const user = request.user as any;
    return this.authService.profile(user.userId);
  }

  //========================================================================================

}