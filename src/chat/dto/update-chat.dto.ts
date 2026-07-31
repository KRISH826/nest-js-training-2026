import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';
import { IsEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateChatDto extends PartialType(CreateChatDto) {
    @IsString()
    @IsEmpty({ message: 'message cannot be empty' })
    @MaxLength(1000)
    message!: string
}
