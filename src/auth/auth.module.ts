import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BiometricAuthService } from './services/biometric-auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersService } from '@/users/users.service';
import { DatabaseService } from '@/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    BiometricAuthService,
    AuthResolver,
    UsersService,
    DatabaseService,
    JwtStrategy,
  ],
})
export class AuthModule {}
