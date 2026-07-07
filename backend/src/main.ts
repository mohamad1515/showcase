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

  // Public backend URL (include protocol and host). If not provided, construct from port.
  const backendPublic =
    process.env.BACKEND_PUBLIC_URL ?? `http://localhost:${port}`;

  console.log(`Backend is running on ${backendPublic}`);
  console.log(`GraphQL endpoint: ${backendPublic}/graphql`);
  console.log(`GraphiQL: ${backendPublic}/graphiql`);
}

bootstrap();
