import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { raw } from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/stripe-webhook', raw({ type: 'application/json' }));

  const config = new DocumentBuilder()
    .setTitle('Mental Health API')
    .setDescription('API para gerenciamento de profissionais e pacientes')
    .setVersion('1.0')
    .addBearerAuth() // Adiciona autenticação JWT no Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
