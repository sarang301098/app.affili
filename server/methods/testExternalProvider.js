import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import Mailchimp from 'mailchimp-api-v3';

import klickTipp from 'meteor/affilihero-lib/utils/klickTipp';

Meteor.methods({
  testExternalProvider(data) {
    check(data, Object);

    const user = Meteor.users.findOne({ _id: Meteor.userId() });
    if (!user || !user.emails.length || !user.emails[0].address) {
      throw new Meteor.Error(404, 'Forbidden');
    }

    try {
      if (data.type === 'funnelcockpit' && data.apiKey) {
        const res = HTTP.get('https://api.funnelcockpit.com/email/tags', {
          headers: {
            Authorization: data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'klicktipp' && data.username && data.password) {
        return !!klickTipp.login(data.username, data.password);

      } else if (data.type === 'activecampaign' && data.username && data.apiKey) {
        const res = HTTP.get('https://' + data.username + '.api-us1.com/api/3/campaigns?limit=1', {
          headers: {
            'Api-Token': data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'getresponse' && data.apiKey) {
        const res = HTTP.get('https://api.getresponse.com/v3/accounts', {
          headers: {
            'X-Auth-Token': 'api-key ' + data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'hubspot' && data.apiKey) {
        const url = 'https://api.hubapi.com/properties/v1/companies/properties';
        const res = HTTP.get(url, {
          params: {
            hapikey: data.apiKey
          },
          headers: {
            'User-Agent': 'FunnelCockpit'
          }
        });
        return !!res;

      } else if (data.type === 'quentn' && data.apiKey && data.apiBaseUrl) {
        const url = data.apiBaseUrl + 'terms?offset=0&limit=1';
        const res = HTTP.get(url, {
          headers: {
            Authorization: 'Bearer ' + data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'mailgun' && data.apiKey) {
        const res = HTTP.get('https://api.mailgun.net/v3/domains', {
          auth: 'api:' + data.apiKey
        });
        return !!res;

      } else if (data.type === 'sendgrid' && data.apiKey) {
        const res = HTTP.get('https://api.sendgrid.com/v3/api_keys', {
          headers: {
            Authorization: 'Bearer ' + data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'sparkpost' && data.apiKey) {
        const res = HTTP.get('https://api.sparkpost.com/api/v1/sending-domains?ownership_verified=true', {
          headers: {
            Authorization: data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'cleverclose') {
        return true;

      } else if (data.type === 'cleverpush' && data.apiKey) {
        const res = HTTP.get('https://api.cleverpush.com/channels', {
          headers: {
            Authorization: data.apiKey
          }
        });
        return !!res;

      } else if (data.type === 'mailchimp' && data.apiKey) {
        const mailchimp = new Mailchimp(data.apiKey);

        const mailchimpSync = Meteor.wrapAsync(mailchimp.get, mailchimp);
        const res = mailchimpSync({ path: 'lists' });
        return !!res;
      }

    } catch (err) {
      console.log(err);
      throw new Meteor.Error('failed', 'Daten ungültig: ' + err.message);
    }

    return false;
  }
});
