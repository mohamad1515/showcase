import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), "public"));
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`);
  console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
  console.log(`GraphiQL: http://localhost:${port}/graphiql`);
}

bootstrap();
