
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function uploadFile(buffer: Buffer, fileName: string, isPublic: boolean = true): Promise<string> {
  // If fileName already includes a path (e.g., "upscaled-logos/file.png"), use it directly
  // Otherwise, add the default uploads path structure
  const key = fileName.includes('/') 
    ? `${folderPrefix}${fileName}` 
    : `${folderPrefix}${isPublic ? 'public/' : ''}uploads/${Date.now()}-${fileName}`;
  
  const uploadParams: any = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'image/png'
  };
  
  // Set ACL to public-read if isPublic is true
  if (isPublic) {
    uploadParams.ACL = 'public-read';
  }
  
  await s3Client.send(new PutObjectCommand(uploadParams));
  
  return key;
}

export async function downloadFile(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    })
  );
}

export async function renameFile(oldKey: string, newKey: string): Promise<void> {
  // S3 doesn't support rename, so we'd need to copy and delete
  // For now, just return
  return;
}
