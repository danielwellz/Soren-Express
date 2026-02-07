import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as https from 'https';
import { VerificationResult } from 'src/common/common-types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserByPhone(phone: string): Promise<User> {
    return this.userRepository.findOne({ phone });
  }

  async createUser(phone: string, verificationCode: string): Promise<User> {
    const newUser = new User();
    newUser.phone = phone;
    newUser.verificationCode = verificationCode;

    return this.userRepository.save(newUser);
  }

  public async sendVerificationCode(
    phone: string,
    code: string,
  ): Promise<string> {
    const data = JSON.stringify({
      from: '50004001334703',
      to: phone,
      text: `Verification code: ${code}`,
    });

    const options = {
      hostname: 'console.melipayamak.com',
      port: 443,
      path: '/api/send/simple/2891dd14234f449181428ddf295ad74a',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length.toString(),
      },
    };

    return new Promise<string>(async (resolve, reject) => {
      const req = https.request(options, async (res) => {
        console.log('statusCode:', res.statusCode);

        res.on('data', (d) => {
          process.stdout.write(d);
        });

        // Update the verification code for the user in the database
        const user = await this.getUserByPhone(phone);
        if (user) {
          user.verificationCode = code;
          await this.userRepository.save(user);
        }

        resolve(code); // Resolve with the verification code
      });

      req.on('error', (error) => {
        console.error(error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async verifyCode(phone: string, code: string): Promise<VerificationResult> {
    const user = await this.getUserByPhone(phone);

    if (user) {
      if (user.verificationCode === code) {
        return {
          success: true,
          message: 'Verification successful',
          user: user,
        };
      } else {
        throw new Error('Invalid verification code');
      }
    } else {
      // User doesn't exist, create a new user with the provided phone number
      const newUser = await this.createUser(phone, code);

      return {
        success: true,
        message: 'User created and verified successfully',
        user: newUser,
      };
    }
  }

  public generateVerificationCode(): string {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async updateUser(input: UpdateUserInput): Promise<User> {
    const userToUpdate = await this.userRepository.findOne(input.id);
    if (!userToUpdate) {
      throw new Error('User not found');
    }

    if (input.phone) {
      userToUpdate.phone = input.phone;
    }
    if (input.fullName) {
      userToUpdate.fullName = input.fullName;
    }
    if (input.email) {
      userToUpdate.email = input.email;
    }

    await this.userRepository.save(userToUpdate);
    return userToUpdate;
  }

  async deleteUser(id: number): Promise<boolean> {
    const deleteResult = await this.userRepository.delete(id);
    return deleteResult.affected > 0;
  }
}
