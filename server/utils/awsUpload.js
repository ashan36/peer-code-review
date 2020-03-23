const aws = require("aws-sdk");
const md5 = require("md5");
const config = require("../config/config");

awsCreds = new aws.Credentials(config.aws.accessKeyId, config.aws.secretKey);
aws.config.credentials = awsCreds;

const s3 = new aws.S3();

const startUpload = async data => {
  try {
    const upload = await s3.upload(data).promise();
    return upload;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const deleteFile = async key => {
  const params = {
    Bucket: config.aws.bucketName,
    Key: key
  };
  try {
    const response = await s3.deleteObject(params).promise();
    return response;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const uploadPicture = async (userId, buffer, type) => {
  //TODO figure out what format the picture is going to come in from the client and pass it in
  const hash = md5(buffer);
  const params = {
    Bucket: config.aws.bucketName,
    Body: buffer,
    ACL: "public-read",
    Key: `${userId}/${hash}`,
    ContentType: type
  };

  return await startUpload(params);
};

module.exports = { uploadPicture, deleteFile };
