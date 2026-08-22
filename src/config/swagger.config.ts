import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  SWAGGER_AUTH_NAME,
  SWAGGER_TAGS,
} from 'src/common/swagger/swagger.constants';

/**
 * Production-grade Swagger configuration setup
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Real-Time Chat & User API')
    .setDescription(
      'Production-grade REST & WebSocket Chat Backend API Documentation',
    )
    .setVersion('1.0.0')
    // Define module tags matching your project structure
    .addTag(SWAGGER_TAGS.AUTH, 'Authentication & Token Management')
    .addTag(SWAGGER_TAGS.USER, 'User Profile & Cloudinary Avatar Management')
    .addTag(SWAGGER_TAGS.CHAT_ROOM, 'Chat Room CRUD & Membership Management')
    .addTag(SWAGGER_TAGS.CHAT, 'Chat Messages History & Persistence')
    .addTag(SWAGGER_TAGS.COURSE, 'Course Training Management')
    // Global Bearer Token Authentication setup
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your short-lived access_token here',
        in: 'header',
      },
      SWAGGER_AUTH_NAME, // 'Bearer' - Matches @ApiBearerAuth('Bearer')
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps Bearer Token saved when refreshing browser page
    },
    customSiteTitle: 'API Documentation | Chat Backend',
  });
}
