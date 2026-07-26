import { IsEmpty, IsNumber, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsString()
    level!: string;

    @IsNumber()
    price!: number;
}
