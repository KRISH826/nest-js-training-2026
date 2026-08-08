import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SWAGGER_AUTH_NAME } from 'src/common/swagger/swagger.constants';

export function ApiCreateChat() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Save a new chat message' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Message saved successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User is not a member of this chat room' }),
  );
}

export function ApiGetChatHistory() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Get all message history for a specific chat room' }),
    ApiParam({ name: 'roomId', description: 'Chat Room MongoDB ObjectId' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Chat messages history retrieved' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Chat room not found or not a member' }),
  );
}