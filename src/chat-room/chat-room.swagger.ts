import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SWAGGER_AUTH_NAME } from 'src/common/swagger/swagger.constants';

export function ApiCreateChatRoom() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({
      summary: 'Create a new chat room',
      description: 'Creates a chat room and sets the logged-in user as the room owner.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Chat room created successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
  );
}

export function ApiFindAllChatRooms() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({
      summary: 'Fetch all chat rooms',
      description: 'Retrieves all available chat rooms (served from Redis cache if available).',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Chat rooms retrieved successfully' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
  );
}

export function ApiFindOneChatRoom() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Get chat room details by ID' }),
    ApiParam({ name: 'id', description: 'Chat Room MongoDB ObjectId' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Room details fetched' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Chat room not found' }),
  );
}

export function ApiJoinChatRoom() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Join a specific chat room' }),
    ApiParam({ name: 'id', description: 'Chat Room ID to join' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Joined room successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Room is full or user already joined' }),
  );
}

export function ApiLeaveChatRoom() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Leave a chat room' }),
    ApiParam({ name: 'id', description: 'Chat Room ID to leave' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Left room successfully' }),
  );
}

export function ApiUpdateChatRoom() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Update chat room details (Owner only)' }),
    ApiParam({ name: 'id', description: 'Chat Room ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Room updated successfully' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only room owner can update' }),
  );
}

export function ApiDeleteChatRoom() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Delete a chat room (Owner only)' }),
    ApiParam({ name: 'id', description: 'Chat Room ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Room deleted successfully' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only room owner can delete' }),
  );
}