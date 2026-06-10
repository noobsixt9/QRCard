const { S3Client } = require('@aws-sdk/client-s3')

const isProduction = process.env.NODE_ENV === 'production'

const s3 = new S3Client(
  isProduction
    ? {
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      }
    : {
        region: 'us-east-1',
        endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
          secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        },
        forcePathStyle: true,
      }
)

const BUCKET = isProduction
  ? process.env.R2_BUCKET_NAME
  : process.env.MINIO_BUCKET_NAME || 'qrcard-uploads'

const PUBLIC_URL = isProduction
  ? process.env.R2_PUBLIC_URL
  : `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${BUCKET}`

module.exports = { s3, BUCKET, PUBLIC_URL, isProduction }
