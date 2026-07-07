import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller("upload")
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./public/uploads",

        filename: (_, file, callback) => {
          const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);

          callback(null, uniqueName);
        },
      }),
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    // Use BACKEND_PUBLIC_URL if provided (should include protocol), otherwise construct from PORT
    const backendPublicUrl =
      process.env.BACKEND_PUBLIC_URL ??
      `http://localhost:${process.env.PORT ?? 4000}`;

    return {
      success: true,
      url: `${backendPublicUrl.replace(/\/$/, "")}/uploads/${file.filename}`,
    };
  }
}
