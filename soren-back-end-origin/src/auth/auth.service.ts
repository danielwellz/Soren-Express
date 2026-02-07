import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { JwtPayload } from './jwt-payload.interface';
import { LoginInput, RegisterInput } from './auth.inputs';
import { AuthPayload } from './auth.types';

@Injectable()
export class AuthService {
  private readonly attempts = new Map<string, { count: number; windowStart: number }>();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput, tracker: string): Promise<AuthPayload> {
    this.checkRateLimit(`${tracker}:register`);

    const existing = await this.usersRepository.findOne({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
      }),
    );

    return this.createAuthPayload(user);
  }

  async login(input: LoginInput, tracker: string): Promise<AuthPayload> {
    this.checkRateLimit(`${tracker}:login`);

    const user = await this.usersRepository.findOne({ where: { email: input.email.toLowerCase() } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthPayload(user);
  }

  async refresh(refreshToken: string): Promise<AuthPayload> {
    const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    });

    const user = await this.usersRepository.findOne(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.createAuthPayload(user);
  }

  async me(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
    // Mock flow: always true to avoid account enumeration.
    if (!user) {
      return true;
    }
    return true;
  }

  private async createAuthPayload(user: User): Promise<AuthPayload> {
    const tokens = await this.generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepository.save(user);

    return {
      user,
      tokens,
    };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  private checkRateLimit(key: string): void {
    const now = Date.now();
    const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 60000);
    const maxAttempts = Number(process.env.AUTH_RATE_LIMIT_MAX || 8);

    const previous = this.attempts.get(key);
    if (!previous || now - previous.windowStart > windowMs) {
      this.attempts.set(key, { count: 1, windowStart: now });
      return;
    }

    if (previous.count >= maxAttempts) {
      throw new UnauthorizedException('Too many auth attempts, please try again later');
    }

    previous.count += 1;
    this.attempts.set(key, previous);
  }
}
