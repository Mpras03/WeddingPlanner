import { Body, Controller, Post, Get, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiLogin,
  ApiLogout,
  ApiProfile,
  ApiVerifyOtp,
  ApiResendOtp,
  ApiForgotPassword,
  ApiChangePassword,
} from './decorators/auth-swagger.decorator';

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

  //===================================== ENDPOINT VERIFY OTP ================================
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Verify OTP')
  @ApiVerifyOtp()
  verifyOtp(
    @Body()
    dto: VerifyOtpDto,
  ) {
    return this.authService.verifyOtp(dto);
  }
  //=========================================================================================

  //===================================== ENDPOINT RESEND OTP ================================
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Resend OTP')
  @ApiResendOtp()
  resendOtp(
    @Body()
    dto: ResendOtpDto,
  ) {
    return this.authService.resendOtp(dto);
  }
  //=========================================================================================

  //===================================== ENDPOINT FORGOT PASSWORD ===========================
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Forgot Password')
  @ApiForgotPassword()
  forgotPassword(
    @Body()
    dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto);
  }
  //=========================================================================================

  //===================================== ENDPOINT CHANGE PASSWORD ===========================
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Change Password')
  @ApiChangePassword()
  changePassword(
    @Body()
    dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(dto);
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