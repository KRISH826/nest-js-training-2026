import { IsEmpty, IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateChatDto {
    @IsMongoId()
    chatRoom!: string

    @IsString()
    @IsNotEmpty({ message: 'message cannot be empty' })
    @MaxLength(1000)
    message!: string
}
