import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import Minio from 'minio';

const TOTAL_FILE_LIMIT = 5e+9; // 5GB

Meteor.methods({
  getSignedUploadUrl(bucket, type) {
    check(bucket, String);
    check(type, String);

    if (!Meteor.userId()) {
      return;
    }

    const types = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      avi: 'video/x-msvideo,video/avi',
      mov: 'video/quicktime',
      ogg: 'video/ogg',
      flv: 'video/x-flv',
      mkv: 'video/x-matroska',
      '3gp': 'video/3gpp',
      ttf: 'font/ttf,font/truetype',
      otf: 'font/opentype,font/otf',
      woff: 'font/woff,application/font-woff',
      woff2: 'font/woff2,application/font-woff2',
      eot: 'application/vnd.ms-fontobject',
      mp3: 'audio/mpeg,audio/mp3',
      wav: 'audio/x-wav',
    };

    if (!Meteor.userId()) {
      throw new Meteor.Error(400, 'Please log in.');
    }

    const extension = Object.keys(types).find((mimeType) => {
      return types[mimeType].split(',').indexOf(type) > -1;
    });
    if (!extension) {
      throw new Meteor.Error('unsupported-mime-type', 'Dateityp wird nicht unterstützt! (' + type + ')');
    }

    const fileName = Random.hexString(32) + '.' + extension;

    const minioClient = new Minio.Client({
      endPoint: 'storage01.funnelcockpit.com',
      port: 443,
      useSSL: true,
      accessKey: 'DkqyPaaZDw7pGCGpQZCx',
      secretKey: 'KUA9PY4z7mfHUvbHTD8rpmyEqSsQzZ2QXg5j5KGx'
    });

    const presignedUrlSync = Meteor.wrapAsync(minioClient.presignedUrl, minioClient);

    if (extension === 'mp3' || extension === 'wav') {
      return {
        signedUrl: presignedUrlSync('PUT', bucket, Meteor.userId() + '/' + fileName, 60 * 60),
        fileUrl: 'https://storage01.funnelcockpit.com/' + bucket + '/' + Meteor.userId() + '/' + fileName,
        extension
      };
    } else {
      return {
        signedUrl: presignedUrlSync('PUT', bucket, Meteor.userId() + '/unprocessed/' + fileName, 60 * 60),
        fileUrl: 'https://storage01.funnelcockpit.com/' + bucket + '/' + Meteor.userId() + '/unprocessed/' + fileName,
        extension
      };
    }
  }
});
