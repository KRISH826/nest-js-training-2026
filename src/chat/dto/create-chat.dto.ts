import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
    @ApiProperty({ example: '665f1b2c8f1a2b3c4d5e6f70' })
    @IsMongoId()
    chatRoom!: string

    @ApiProperty({ example: 'Hello everyone!' })
    @IsString()
    @IsNotEmpty({ message: 'message cannot be empty' })
    @MaxLength(1000)
    message!: string
}
