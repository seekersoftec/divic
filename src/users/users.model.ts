import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  biometricKey?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
