
import { S3Client } from '@aws-sdk/client-s3';

export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || '',
    region: process.env.AWS_REGION || 'us-west-2'
  };
}

export function createS3Client() {
  const region = process.env.AWS_REGION || 'us-west-2';
  
  // In Abacus.AI hosted environment, use IAM role credentials (no explicit credentials needed)
  return new S3Client({
    region: region,
  });
}
