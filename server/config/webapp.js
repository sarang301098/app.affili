import { WebApp } from 'meteor/webapp';
import { urlencoded, json } from 'body-parser';
import cookieParser from 'cookie-parser';

WebApp.connectHandlers
  .use(urlencoded({ extended: true }))
  .use(json({
    verify(req, res, buf, encoding) {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    }
  }))
  .use(cookieParser());
