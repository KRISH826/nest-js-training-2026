import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './schema/course.schema';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) { }
  async create(createCourseDto: CreateCourseDto) {
    try {
      const existCourse = await this.courseModel.findOne({ name: createCourseDto.name });
      if (existCourse) {
        throw new Error('Course already exists');
      }
      if(!createCourseDto.name || !createCourseDto.description || !createCourseDto.level || !createCourseDto.price) throw new Error('All fields are required');
      const course = await this.courseModel.create(createCourseDto);
      return course;
    } catch (error) {
      throw error;
    }

  }

  async findAll() {
    try {
      const courses = await this.courseModel.find();
      return courses;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.courseModel.findOne({_id: id});
      if(!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.courseModel.findOneAndUpdate({_id: id}, updateCourseDto, { returnDocument: 'after' });
      if(!course) throw new Error('User not found');
      return course;
    } catch (error) {
      throw error
    }
  }

  async remove(id: string) {
    try {
      const user = await this.courseModel.findOneAndDelete({_id: id});
      if(!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw error
    }
  }
}
