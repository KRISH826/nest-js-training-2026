import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SWAGGER_AUTH_NAME } from 'src/common/swagger/swagger.constants';

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user account' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User already exists' }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Authenticate user & issue tokens' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Logged in successfully' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' }),
  );
}

export function ApiRefreshTokens() {
  return applyDecorators(
    ApiOperation({ summary: 'Get fresh access_token via refresh token' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed successfully' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid or expired refresh token' }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_AUTH_NAME),
    ApiOperation({ summary: 'Logout and revoke refresh token' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' }),
  );
}