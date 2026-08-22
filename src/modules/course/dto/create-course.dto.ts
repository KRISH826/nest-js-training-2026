import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Fundamentals' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Learn NestJS from the ground up.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Beginner' })
  @IsString()
  level!: string;

  @ApiProperty({ example: 49.99, type: Number })
  @IsNumber()
  price!: number;
}
