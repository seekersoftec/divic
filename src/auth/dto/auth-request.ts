import { InputType, Field } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class AuthRegisterInput {
  @Field()
  email: string;

  @MinLength(8) // Enforce minimum password length of 8
  @Field()
  password: string;

  @Field()
  withBiometric: boolean;
}

@InputType()
export class AuthWithPasswordInput {
  @Field()
  email: string;

  @MinLength(8) // Enforce minimum password length of 8
  @Field()
  password: string;
}

@InputType()
export class AuthWithBiometricInput {
  @Field()
  email: string;

  @Field()
  biometricKey: string;
}
