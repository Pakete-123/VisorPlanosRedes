import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid: boolean = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }

  async register(email: string, password: string, name: string): Promise<User> {
    const hash: string = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name,
        role: 'USER',
      },
    });
  }
}
