import { RoleType } from "src/enums/role.type";
import { IsEmail, IsEnum, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    fname?: string;
    @IsString()
    lname?: string;
    @IsEmail()
    email?: string;
    @IsString()
    password?: string;
    @IsEnum(RoleType)
    role?: RoleType;
}

export class loginDto {
    @IsEmail()
    email?: string;
    @IsString()
    password?: string;
}

export class UserDto {
    @IsString()
    fname?: string;
    @IsString()
    lname?: string;
    @IsEmail()
    email?: string;
    @IsEnum(RoleType)
    role?: RoleType;
}