import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActionResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
