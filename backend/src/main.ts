import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Validate JWT configuration on startup
try {
  require('./config/jwt.config');
} catch (error) {
  console.error('\n' + '='.repeat(60));
  console.error('🚨 CRITICAL SECURITY ERROR');
  console.error('='.repeat(60));
  console.error(error.message);
  console.error('\nThe application cannot start with insecure JWT secrets.');
  console.error('Please update your .env file with strong, random secrets.');
  console.error('='.repeat(60) + '\n');
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  
  app.setGlobalPrefix('api');
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  app.enableCors({
    origin: isProduction
      ? process.env.CORS_ORIGIN?.split(',') || []
      : process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('TaskMaster API')
      .setDescription('Task Management Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  if (!isProduction) {
    console.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
  }
}

bootstrap();

