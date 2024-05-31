import { Field, ObjectType, ID } from '@nestjs/graphql';
// import { User } from '@/users/users.model';

@ObjectType()
export class Session {
  @Field(() => ID)
  id: string;

  @Field()
  challenge: string;

  //   @Field(() => User)
  //   user: User;

  @Field(() => String, { nullable: true })
  userId: string;

  @Field({ nullable: true })
  expireAt?: Date;
}
