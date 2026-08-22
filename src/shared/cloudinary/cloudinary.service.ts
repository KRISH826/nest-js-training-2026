import 'multer';
import { Injectable, BadRequestException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder = 'user_avatars',
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  extractPublicIdFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;

      const pathAfterUpload = parts[1];
      const cleanPath = pathAfterUpload.replace(/^v\d+\//, '');
      const publicId = cleanPath.substring(0, cleanPath.lastIndexOf('.'));
      return publicId;
    } catch {
      return null;
    }
  }
}
