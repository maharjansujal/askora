import "server-only";

import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadedFile = {
  fileUrl: string;
  publicId: string;
  resourceType: string;
  format: string | null;
  size: number;
  originalFilename: string | null;
  width: number | null;
  height: number | null;
};

export const uploadFile = async (
  file: File,
  options?: { folder?: string; publicId?: string },
) => {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: options?.folder,
        public_id: options?.publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });

  return {
    fileUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type as UploadedFile["resourceType"],
    format: result.format ?? null,
    size: result.bytes,
    originalFilename: file.name ?? null,
    width: result.width ?? null,
    height: result.height ?? null,
  };
};

export const uploadRemoteFile = async (
  url: string,
  options?: { folder?: string; publicId?: string },
) => {
  const result = await cloudinary.uploader.upload(url, {
    resource_type: "image",
    folder: options?.folder,
    public_id: options?.publicId,
  });

  return {
    fileUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format ?? null,
    size: result.bytes,
    width: result.width ?? null,
    height: result.height ?? null,
  };
};
