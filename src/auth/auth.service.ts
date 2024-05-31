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
import { AuthWithPasswordInput } from './dto/auth-request';
import { Role } from './enum/role.enum';
import { BiometricAuthService } from './services/biometric-auth.service';
import {
  CredentialCreationOptionsJSON,
  CredentialRequestOptionsJSON,
} from '@github/webauthn-json';
import { AuthResponse } from './dto/auth-response';

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
    private readonly biometricAuthService: BiometricAuthService,
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
  async register(userInput: AuthWithPasswordInput): Promise<AuthResponse> {
    const { email, password } = userInput;
    try {
      const user = await this.userService.create({
        email,
        password,
        role: Role.USER,
      });
      const tokens = await this.generateToken(user);
      return { user, ...tokens };
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
   * @param biometricKey - The user's biometric key.
   * @returns An object containing the access token.
   */
  async biometricLogin(
    email: string,
    biometricKey: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !this.verifyBiometricKey(user.biometricKey, biometricKey)) {
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
   * Initiates the biometric registration process.
   * @param email - The email of the user.
   * @returns The credential creation options JSON.
   */
  async initiateBiometricRegistration(
    email: string,
  ): Promise<CredentialCreationOptionsJSON> {
    try {
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.biometricAuthService.initiateRegistration(user);
    } catch (error) {
      this.logger.error('Error registering with biometrics', error.stack);
      throw error;
    }
  }

  /**
   * Initiates the biometric login process.
   * @param email - The email of the user (optional).
   * @returns The credential request options JSON.
   */
  async initiateBiometricLogin(
    email?: string,
  ): Promise<CredentialRequestOptionsJSON> {
    return this.biometricAuthService.initiateLogin(email);
  }

  /**
   * Completes the biometric registration process.
   * @param challenge - The challenge used during registration.
   * @param type - The type of the key.
   * @param keyId - The key ID.
   * @returns True if registration is successful.
   */
  async completeBiometricRegistration(
    challenge: string,
    type: string,
    keyId: string,
  ): Promise<boolean> {
    return this.biometricAuthService.completeRegistration(
      challenge,
      type,
      keyId,
    );
  }

  /**
   * Completes the biometric login process.
   * @param challenge - The challenge used during login.
   * @param keyId - The key ID.
   * @param userId - The user ID.
   * @returns The login response containing the user ID.
   */
  async completeBiometricLogin(
    challenge: string,
    keyId: string,
    userId: string,
  ): Promise<AuthResponse> {
    return this.biometricAuthService.completeLogin(challenge, keyId, userId);
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
    return this.biometricAuthService.abortRegistration(userId, challenge);
  }
}
