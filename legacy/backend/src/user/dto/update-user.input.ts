import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field()
  id: number;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  email?: string;
}
