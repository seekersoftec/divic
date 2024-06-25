import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './services/auth.service';
import { AuthRegisterInput } from './dto/auth-request';
import { AuthResponse } from './dto/auth-response';
import { User } from '@/users/users.model';

/**
 * AuthResolver handles the GraphQL mutations for user authentication.
 */
@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('authRegisterInput') authRegisterInput: AuthRegisterInput,
  ): Promise<AuthResponse> {
    const { user, accessToken, refreshToken, challenge } =
      await this.authService.register(authRegisterInput);
    return { user, accessToken, refreshToken, challenge };
  }

  @Mutation(() => AuthResponse)
  async registerBiometrics(
    @Args('email') email: string,
    @Args('biometricKey') biometricKey: string,
    @Args('signedChallenge') signedChallenge: string,
  ): Promise<{ message: boolean }> {
    const isComplete = await this.authService.completeBiometricRegistration(
      email,
      biometricKey,
      signedChallenge,
    );
    return { message: isComplete };
  }

  @Mutation(() => AuthResponse)
  async loginWithPassword(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
    return this.authService.loginWithPassword(email, password);
  }

  @Mutation(() => AuthResponse)
  async biometricLogin(
    @Args('email') email: string,
    @Args('challenge') challenge: string,
    @Args('signedChallenge') signedChallenge: string,
  ): Promise<AuthResponse> {
    return this.authService.biometricLogin(email, challenge, signedChallenge);
  }

  @Mutation(() => AuthResponse)
  async generateChallenge(
    @Args('email') email: string,
  ): Promise<{ challenge: string }> {
    const session = await this.authService.initiateBiometricAuth(email);
    return { challenge: session.challenge };
  }
}
