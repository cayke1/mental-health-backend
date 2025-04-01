import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { raw } from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use("/stripe-webhook", raw({type: "application/json"}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
