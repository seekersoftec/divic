import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/users.model';
import { AuthRegisterInput } from '../dto/auth-request';
import { Role } from '../enum/role.enum';
import { AuthResponse } from '../dto/auth-response';
import { SessionsService } from './sessions.service';
import {
  generateChallenge,
  getDelayedDate,
  isHex,
  verifySignature,
} from '@/utils/utils';
import { Session } from '../models/sessions.model';

/**
 * AuthService is responsible for user authentication, including registration,
 * standard login, and biometric login.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Compares a plain text password with a hashed password.
   * @param password - The plain text password.
   * @param hashedPassword - The hashed password.
   * @returns A promise that resolves to true if the passwords match, false otherwise.
   */
  private async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error('Error comparing passwords', error.stack);
      throw new InternalServerErrorException('Error comparing passwords');
    }
  }

  /**
   * Generates JWT access and refresh tokens for a user.
   * @param user - The user for whom to generate tokens.
   * @returns An object containing the access token and refresh token.
   */
  public async generateToken(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign({ payload, accessToken });
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Registers a new user with email and password.
   * @param userInput - The user input containing email and password.
   * @returns An object containing the registered user and tokens.
   */
  async register(userInput: AuthRegisterInput): Promise<AuthResponse> {
    const { email, password, withBiometric } = userInput;
    let session: Session;

    try {
      const user = await this.userService.create({
        email,
        password,
        role: Role.USER,
      });

      if (withBiometric) {
        session = await this.initiateBiometricAuth(user.email);
      }

      const tokens = await this.generateToken(user);
      return { user, challenge: session.challenge, ...tokens };
    } catch (error) {
      this.logger.error('Error registering user', error.stack);
      throw error;
    }
  }

  /**
   * Authenticates a user using email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns An object containing the access token.
   */
  async loginWithPassword(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !(await this.comparePasswords(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const tokens = await this.generateToken(user);
      return { user, ...tokens };
    } catch (error) {
      this.logger.error('Error logging in with password', error.stack);
      throw error;
    }
  }

  /**
   * Authenticates a user using biometric key.
   * @param email - The user's email.
   * @param challenge - The challenge.
   * @param signedChallenge - The user's signed challenge.
   * @returns An object containing the access token.
   */
  async biometricLogin(
    email: string,
    challenge: string,
    signedChallenge: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userService.findByEmail(email);
      if (
        !user ||
        !this.verifyBiometricKey(user.biometricKey, challenge, signedChallenge)
      ) {
        throw new UnauthorizedException('Invalid biometric key');
      }

      const tokens = await this.generateToken(user);
      return { user, ...tokens };
    } catch (error) {
      this.logger.error('Error logging in with biometric key', error.stack);
      throw error;
    }
  }

  /**
   * Verifies the provided biometric key.
   * @param biometricKey - The biometric key.
   * @param challenge - The provided challenge.
   * @param signedChallenge - The signed challenge.
   * @returns True if the biometric key is valid, false otherwise.
   */
  async verifyBiometricKey(
    biometricKey: string,
    challenge: string,
    signedChallenge: string,
  ): Promise<boolean> {
    // Simulate biometric key verification logic

    try {
      if (biometricKey.length === 0) {
        throw new BadRequestException('Empty biometric key');
      }

      if (!isHex(biometricKey)) {
        throw new BadRequestException('Invalid biometric key format');
      }

      return verifySignature(signedChallenge, challenge, biometricKey);
    } catch (error) {
      this.logger.error(`Error verifying biometric key: ${error}`);
      throw error;
    }
  }

  /**
   * Initiates the biometric auth process.
   * @param email - The email of the user.
   * @returns Session.
   */
  async initiateBiometricAuth(email: string): Promise<Session> {
    try {
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const challenge = generateChallenge();
      const session = await this.sessionsService.create(
        user.id,
        challenge,
        getDelayedDate(5),
      );

      return session;
    } catch (error) {
      this.logger.error('Error registering with biometrics', error.stack);
      throw error;
    }
  }

  /**
   * Completes the biometric registration process.
   * @param userId - The user ID.
   * @param challenge - The challenge used during registration.
   * @param signedChallenge - The challenge signed by the user.
   * @param biometricKey - The biometric key.
   * @returns True if registration is successful.
   */
  async completeBiometricRegistration(
    userId: string,
    biometricKey: string,
    signedChallenge: string,
  ): Promise<boolean> {
    try {
      const session = await this.sessionsService.findByUserId(userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (Date.now() > session.expireAt.getTime()) {
        throw new BadRequestException('Session has expired');
      }

      if (
        !(await this.verifyBiometricKey(
          biometricKey,
          session.challenge,
          signedChallenge,
        ))
      ) {
        throw new BadRequestException('Invalid biometric key');
      }

      const user = await this.userService.update(userId, { biometricKey });
      if (!user) {
        return false;
      }

      await this.sessionsService.delete(user.id, session.challenge);

      return true;
    } catch (error) {
      this.logger.error(
        'Error completing biometrics registration',
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Aborts the biometric registration process.
   * @param userId - The user ID.
   * @param challenge - The challenge used during registration.
   * @returns True if the deletion is successful.
   */
  async abortBiometricRegistration(
    userId: string,
    challenge: string,
  ): Promise<boolean> {
    return this.sessionsService.delete(userId, challenge);
  }
}
