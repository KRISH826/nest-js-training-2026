import { IsEmpty, IsMongoId, IsString, MaxLength } from "class-validator";

export class CreateChatDto {
    @IsMongoId()
    chatRoom!: string

    @IsString()
    @IsEmpty({ message: 'message cannot be empty' })
    @MaxLength(1000)
    message!: string
}
