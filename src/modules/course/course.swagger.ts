import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SWAGGER_AUTH_NAME } from 'src/common/swagger/swagger.constants';

const courseId = ApiParam({
  name: 'id',
  description: 'Course MongoDB ObjectId',
  example: '665f1b2c8f1a2b3c4d5e6f70',
});

export function ApiCreateCourse() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Create a course' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Course created successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid course data',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Authentication required',
    }),
  );
}

export function ApiFindAllCourses() {
  return applyDecorators(
    ApiOperation({ summary: 'List all courses' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Courses retrieved successfully',
    }),
  );
}

export function ApiFindOneCourse() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Get a course by ID' }),
    courseId,
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Course retrieved successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Course not found',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Authentication required',
    }),
  );
}

export function ApiUpdateCourse() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Update a course' }),
    courseId,
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Course updated successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Course not found',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Authentication required',
    }),
  );
}

export function ApiDeleteCourse() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Delete a course' }),
    courseId,
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Course deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Course not found',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Authentication required',
    }),
  );
}
