import { Role } from "../../../generated/prisma/enums";

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}