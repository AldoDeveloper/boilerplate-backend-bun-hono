import type { PublicUser } from "../user/user.model";

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}
