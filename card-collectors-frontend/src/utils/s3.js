import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

export async function getPresignedUploadUrl(fileName, fileType) {
  const command = new PutObjectCommand({
    Bucket: process.env.REACT_APP_AWS_BUCKET,
    Key: `uploads/${fileName}`,
    ContentType: fileType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
      url: signedUrl,
      key: `uploads/${fileName}`,
    };
  } catch (err) {
    console.error('Error getting signed URL:', err);
    throw err;
  }
}

export function getPublicUrl(key) {
  return `https://${process.env.REACT_APP_AWS_BUCKET}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${key}`;
}

export async function listImages() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.REACT_APP_AWS_BUCKET,
    Prefix: 'uploads/',
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .filter(item => item.Size > 0) // Filter out folders
      .map(item => ({
        key: item.Key,
        url: getPublicUrl(item.Key),
        lastModified: item.LastModified,
        size: item.Size,
        // TODO: Fetch metadata from Firestore using the key
        name: item.Key.split('/').pop().split('-').slice(1).join('-'), // Remove timestamp prefix
      }));
  } catch (err) {
    console.error('Error listing images:', err);
    throw err;
  }
} 