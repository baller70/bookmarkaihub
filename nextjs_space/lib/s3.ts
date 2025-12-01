
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix, region } = getBucketConfig();

export async function uploadFile(buffer: Buffer, fileName: string, isPublic: boolean = true): Promise<string> {
  // If fileName already includes a path (e.g., "upscaled-logos/file.png"), use it directly
  // Otherwise, add the default uploads path structure
  const key = fileName.includes('/') 
    ? `${folderPrefix}${fileName}` 
    : `${folderPrefix}${isPublic ? 'public/' : ''}uploads/${Date.now()}-${fileName}`;
  
  // NOTE: ACL is NOT set here because the bucket has ACLs disabled.
  // Public access is controlled by the bucket policy, which should allow
  // public read access to objects with the "public/" prefix in their key.
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'image/png'
  };
  
  await s3Client.send(new PutObjectCommand(uploadParams));
  
  // Return public URL if isPublic, otherwise return the key
  if (isPublic) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
  
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
