import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
// import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserResolver, UserRepository],
  // controllers: [UserController],
})
export class UserModule {}
