import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { HTTP } from "meteor/http";

import Toplist from 'meteor/affilihero-lib/collections/toplist';
import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';

Meteor.methods({
  getAffiliateToplist(toplistId) {
    check(toplistId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    let toplist;
    let providerId;

    toplist = Toplist.findOne(toplistId);

    let affiliates;
    if (toplist && toplist.externalProviderId) {
      providerId = ExternalProviders.findOne(toplist.externalProviderId);
    }

    const pointsDataAvailable = toplist && (toplist.salesNumber && toplist.salesPoints) ? true : false;

    if (providerId && providerId.apiKey) {
      const digiRes = HTTP.call('GET', 'https://www.digistore24.com/api/call/' + providerId.apiKey + '/json/statsAffiliateToplist/', {
        headers: {
          Accept: 'application/json'
        },
        params: {
          from: '2019-01',
          to: new Date().toISOString().substr(0, 7)
        }
      });

      if (digiRes && digiRes.data && digiRes.data.data && digiRes.data.data.top_list) {
        if (pointsDataAvailable) {
          const { salesNumber, salesPoints } = toplist;
          affiliates = (digiRes.data.data.top_list || []).map((item, i) => ({
            affiliateId: item.affiliate_id || '',
            name: item.affiliate_name || '',
            amount: parseFloat(item.brutto_amount),
            points: parseInt(((parseFloat(item.brutto_amount) * salesNumber) / salesPoints), 10),
          })).sort((a, b) => b.amount - a.amount)
        } else {
          affiliates = (digiRes.data.data.top_list || []).map((item, i) => ({
            affiliateId: item.affiliate_id || '',
            name: item.affiliate_name || '',
            amount: parseFloat(item.brutto_amount) || 0,
            points: parseFloat(item.brutto_amount) || 0,
          })).sort((a, b) => b.amount - a.amount)
        }
      }
    }


    if (affiliates && affiliates.length) {
      affiliates = (affiliates || []).map((prod, i) => {
        prod.index = i + 1;
        return (prod);
      })
    }

    return {
      toplist: toplist || {},
      affiliates: affiliates || []
    }
  }
});
