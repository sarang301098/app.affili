import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import * as AWS from 'aws-sdk';

Meteor.methods({
  uploadImage(collection, type, data) {
    check(type, String);
    check(type, String);
    check(data, String);

    const fileBuffer = new Buffer(data, 'base64');

    const s3 = new AWS.S3({ region: 'eu-central-1' });
    let extension = 'jpg';
    if (type === 'image/gif') {
      extension = 'gif';
    } else if (type === 'image/png') {
      extension = 'png';
    }
    const fileName = Random.id() + '.' + extension;

    const upload = Meteor.wrapAsync(s3.putObject, s3);
    const key = (collection || 'app') + '/image/' + fileName;
    try {
      upload({ Bucket: 'static.affilihero.io', Key: key, Body: fileBuffer, ContentType: type, ACL: 'public-read', ContentDisposition: 'attachment' });
      return { iconUrl: 'https://static.affilihero.io/' + key, iconFile: fileName };
    } catch (e) {
      throw new Meteor.Error(e.code, e.message);
    }
  }
});

const uploadRule = {
  userId(userId) {
    const user = Meteor.users.findOne(userId);
    return user && user.role !== 'admin';
  },
  type: 'method',
  name: 'uploadPageImage'
};

// 16 messages every 2 minutes
DDPRateLimiter.addRule(uploadRule, 16, 60000 * 2);
