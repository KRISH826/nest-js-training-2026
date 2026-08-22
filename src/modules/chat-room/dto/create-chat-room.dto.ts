import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @ApiProperty({ example: 'NestJS Developers' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'A room for NestJS developers.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50, minimum: 2, type: Number })
  @IsNumber()
  maxMembers!: number;
}
