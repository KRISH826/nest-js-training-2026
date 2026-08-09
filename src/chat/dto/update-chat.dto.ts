import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateChatDto } from './create-chat.dto';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatDto extends PartialType(CreateChatDto) {
    @ApiPropertyOptional({ example: 'Updated message' })
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'message cannot be empty' })
    @MaxLength(1000)
    message?: string
}
