import { RoleType } from "src/enums/role.type";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    fname?: string;
    @IsString()
    lname?: string;
    @IsEmail()
    email?: string;
    @IsString()
    password?: string;
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
}

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    fname?: string
    
    @IsOptional()
    @IsString()
    lname?: string
}