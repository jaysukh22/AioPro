import AWS from 'aws-sdk'
import dotenv from "dotenv";
dotenv.config()

export const fileUploader = async(file) => {
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  })

  const s3 = new AWS.S3();

  // Binary data base64
  const fileContent = Buffer.from(file, 'binary');

  // Setting up S3 upload parameters
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: file, // File name you want to save as in S3
    Body: fileContent
  };

  // Uploading files to the bucket
  const data = await s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    } else {
      console.log(`File uploaded successfully. ${data.Location}`);
    }
  }).promise();

  const { Location } = data
  return Location
};

