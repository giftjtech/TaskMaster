import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
    const user = await this.usersService.create(registerDto);
    const { password, ...result } = user;
    return this.generateTokens(result);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });
      const user = await this.usersService.findOne(payload.sub);
      // Check if user exists, is active, and refresh token matches (and is not null)
      if (!user || !user.isActive || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const { password, ...result } = user;
      return this.generateTokens(result);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      notificationPreferences: user.notificationPreferences || {},
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = await this.jwtService.signAsync(
      { email: user.email, sub: user.id, type: 'password-reset' },
      {
        secret: jwtConfig.secret,
        expiresIn: '1h',
      },
    );

    // Set expiration date (1 hour from now)
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    // Save reset token to user
    await this.usersService.updateResetToken(user.id, resetToken, resetTokenExpires);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify the token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConfig.secret,
      });

      // Check if it's a password reset token
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Find user by ID from token (with reset token fields)
      const user = await this.usersService.findByIdWithResetToken(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify the token matches what's stored in database
      if (!user.resetToken || user.resetToken !== token) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      // Check if token has expired (database check)
      if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
        throw new UnauthorizedException('Reset token has expired');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await this.usersRepository.update(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      });

      return {
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}

