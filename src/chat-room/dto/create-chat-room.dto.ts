import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateChatRoomDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    maxMembers!: number;
}
