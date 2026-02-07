import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/entities';

@ObjectType()
export class AuthTokens {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

@ObjectType()
export class AuthPayload {
  @Field(() => User)
  user: User;

  @Field(() => AuthTokens)
  tokens: AuthTokens;
}
