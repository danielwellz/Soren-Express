// import { Controller, Get, Param } from '@nestjs/common';
// import { UserService } from './user.service';
// import { User } from './entities/user.entity';

// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Get(':id')
//   async getUserById(@Param('id') id: number): Promise<User> {
//     return this.userService.getUserById(id);
//   }

//   @Get()
//   async getUsers(): Promise<User[]> {
//     return this.userService.getUsers();
//   }
// }
