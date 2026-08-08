import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SWAGGER_TAGS } from 'src/common/swagger/swagger.constants';
import {
  ApiCreateCourse,
  ApiDeleteCourse,
  ApiFindAllCourses,
  ApiFindOneCourse,
  ApiUpdateCourse,
} from './course.swagger';

@ApiTags(SWAGGER_TAGS.COURSE)
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateCourse()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiFindAllCourses()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiFindOneCourse()
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiUpdateCourse()
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiDeleteCourse()
  async remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
