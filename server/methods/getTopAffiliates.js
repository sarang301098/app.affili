import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import digiStore24Config from '../config/digistore24';
import { HTTP } from "meteor/http";

Meteor.methods({
  getTopAffiliates() {
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const res = HTTP.call('GET', 'https://www.digistore24.com/api/call/' + digiStore24Config.apiKey + '/json/statsAffiliateToplist/', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        from: '2019-01',
        to: new Date().toISOString().substr(0, 7)
      }
    });

    return {
      affiliates: res.data.data.top_list.slice(0, 25).map(item => ({ name: item.affiliate_name.substr(0, 1) + '*'.repeat(item.affiliate_name.length - 2) + item.affiliate_name.substr(item.affiliate_name.length - 1), amount: item.brutto_amount }))
    };
  }
});
