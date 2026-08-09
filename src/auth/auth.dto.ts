import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    fname?: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lname?: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'StrongPassword123!' })
    @IsString()
    password?: string;
}

export class loginDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'StrongPassword123!' })
    @IsString()
    password?: string;
}

export class UserDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    fname?: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lname?: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email?: string;
}

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'John' })
    @IsOptional()
    @IsString()
    fname?: string

    @ApiPropertyOptional({ example: 'Doe' })
    @IsOptional()
    @IsString()
    lname?: string
}
