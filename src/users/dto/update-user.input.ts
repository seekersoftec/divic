import { Field, InputType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { PartialType } from '@nestjs/mapped-types';
import { Role } from '@/auth/enum/role.enum';
import { MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field({ nullable: true })
  email?: string;

  @MinLength(8) // Enforce minimum password length of 8
  @Field({ nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  biometricKey?: string;

  @Field(() => Role, { nullable: true })
  role?: Role;
}
