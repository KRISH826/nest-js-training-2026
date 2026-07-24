import { RoleType } from "src/enums/role.type";

export class RegisterDto {
    fname?: string;
    lname?: string;
    email?: string;
    password?: string;
    role?: RoleType;
}