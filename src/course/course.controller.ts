import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleType } from 'src/enums/role.type';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(RoleType.ADMIN)
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.courseService.create(createCourseDto);
    return course;
  }

  @Get()
  async findAll() {
    const courses = await this.courseService.findAll();
    return courses;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    return course;
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleType.ADMIN)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const course = this.courseService.update(id, updateCourseDto);
    return course;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    const course = await this.courseService.remove(id);
    return course;
  }
}
