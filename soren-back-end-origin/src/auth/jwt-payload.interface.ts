import { UserRole } from 'src/common/enums';

export interface JwtPayload {
  sub: number;
  role: UserRole;
  email: string;
}
