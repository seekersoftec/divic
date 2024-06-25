import { User } from '@/users/users.model';
import { Optional } from '@nestjs/common';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  user: User;

  @Field({ nullable: true })
  @Optional()
  accessToken?: string;

  @Field({ nullable: true })
  @Optional()
  refreshToken?: string;

  @Field()
  @Optional()
  challenge: string;
}
