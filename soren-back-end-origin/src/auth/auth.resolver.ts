import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CartService } from 'src/cart/cart.service';
import { CurrentUser } from './current-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';
import { User } from 'src/entities';
import { AuthService } from './auth.service';
import { LoginInput, RefreshInput, RegisterInput } from './auth.inputs';
import { AuthPayload } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
  ) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: any,
  ): Promise<AuthPayload> {
    const tracker = context?.req?.ip || 'unknown';
    return this.authService.register(input, tracker);
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: any,
  ): Promise<AuthPayload> {
    const tracker = context?.req?.ip || 'unknown';
    const result = await this.authService.login(input, tracker);

    if (input.sessionId) {
      await this.cartService.mergeGuestCartToUser(
        { sessionId: input.sessionId },
        result.user,
      );
    }

    return result;
  }

  @Mutation(() => AuthPayload)
  async refresh(@Args('input') input: RefreshInput): Promise<AuthPayload> {
    return this.authService.refresh(input.refreshToken);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.authService.me(user.id);
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('email') email: string): Promise<boolean> {
    return this.authService.forgotPassword(email);
  }
}
