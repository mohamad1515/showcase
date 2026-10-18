import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from 'dotenv';
import { join } from 'path';
import { getBackendPublicUrl } from './common/public-url';

async function bootstrap() {
  config({ path: join(__dirname, '..', '.env') });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/api' });
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  const backendPublic = getBackendPublicUrl(port);

  console.log(`Backend is running on ${backendPublic}`);
  console.log(`GraphQL endpoint: ${backendPublic}/graphql`);
}

bootstrap();
