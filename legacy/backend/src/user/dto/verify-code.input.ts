import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
