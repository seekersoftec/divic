import { Role } from '@/auth/enum/role.enum';
import { Field, InputType } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @MinLength(8) // Enforce minimum password length of 8
  @Field()
  password: string;

  @Field(() => String, { nullable: true })
  biometricKey?: string;

  @Field(() => Role, { defaultValue: Role.USER })
  role: Role;
}
