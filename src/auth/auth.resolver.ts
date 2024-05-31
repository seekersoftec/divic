import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthWithPasswordInput } from './dto/auth-request';
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
    @Args('authWithPasswordInput') authWithPasswordInput: AuthWithPasswordInput,
  ): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } = await this.authService.register(
      authWithPasswordInput,
    );
    return { user, accessToken, refreshToken };
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
    @Args('biometricKey') biometricKey: string,
  ): Promise<AuthResponse> {
    return this.authService.biometricLogin(email, biometricKey);
  }
}
