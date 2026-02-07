import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import {
  VerificationResponse,
  VerificationResult,
} from 'src/common/common-types';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async getUser(@Args('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Mutation(() => User)
  async createUser(
    @Args('phone') phone: string,
    @Args('verificationCode') verificationCode: string,
  ): Promise<User> {
    return this.userService.createUser(phone, verificationCode);
  }

  @Mutation(() => VerificationResponse)
  async sendVerificationCode(
    @Args('phone') phone: string,
  ): Promise<VerificationResponse> {
    const code = this.userService.generateVerificationCode();
    await this.userService.sendVerificationCode(phone, code);

    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  }

  @Mutation(() => VerificationResult)
  async verifyCode(
    @Args('phone') phone: string,
    @Args('code') code: string,
  ): Promise<VerificationResult> {
    try {
      const result = await this.userService.verifyCode(phone, code);
      return {
        success: true,
        message: result.message, // Assign the 'message' property of 'VerificationResult'
        user: result.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => User)
  async updateUser(@Args('input') input: UpdateUserInput): Promise<User> {
    return this.userService.updateUser(input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: number): Promise<boolean> {
    return this.userService.deleteUser(id);
  }
}
