import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { getBackendPublicUrl } from "../common/public-url";

@Controller("api/upload")
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
    const backendPublicUrl = getBackendPublicUrl(
      Number(process.env.PORT ?? 4000),
    );

    return {
      success: true,
      url: `${backendPublicUrl}/uploads/${file.filename}`,
    };
  }
}
