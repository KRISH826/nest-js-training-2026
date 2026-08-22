import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class SendOtpDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email?: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @Length(6, 6)
    otp?: string;
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
export class UserDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    fname?: string

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lname?: string

    @ApiProperty({ example: 'email' })
    @IsString()
    provider?: string
}
