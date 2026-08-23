import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AvatarDto {
  @ApiPropertyOptional({ example: 'chat_rooms/public_id_123' })
  @IsOptional()
  @IsString()
  public_id?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  @IsOptional()
  @IsString()
  url?: string;
}

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

  @ApiPropertyOptional({ type: () => AvatarDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarDto)
  avatar?: AvatarDto;
}
