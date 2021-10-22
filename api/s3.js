require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file to s3
function uploadFile(file) {
  if (!file || !file.path) return new Error("Error with file!")
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

// download a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  if (!fileKey) {
    return "";
  }
  return s3.getObject(downloadParams).createReadStream();
}
exports.getFileStream = getFileStream;

const presignedGETURL = (key)=>{
  return s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key, //filename
      // Expires: 120 //time to expire in seconds
  })
}
exports.presignedGETURL = presignedGETURL

// delete file
function deleteImage(imagePath) {
  const deleteParams = {
    Bucket: bucketName,
    Key: imagePath,
  };

  return s3.deleteObject(deleteParams).promise();
}

exports.deleteImage = deleteImage;
