import { IsEmpty, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsString()
    level!: string;

    @IsEmpty()
    @IsString()
    price!: number;
}
