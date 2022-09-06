import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';

Meteor.methods({
  getDigistore24Products(id) {
    check(id, String);

    if (!Meteor.user()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const search = { _id: id, userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const provider = ExternalProviders.findOne(search);
    if (!provider) {
      return [];
    }

    try {
      if (provider.type === 'digistore24' && provider.apiKey) {
        const res = HTTP.call('POST', 'https://www.digistore24.com/api/call/' + provider.apiKey + '/json/listProducts/', {
          headers: {
            Accept: 'application/json'
          },
          params: {}
        });

        if (res.data && res.data.data && res.data.data.products && res.data.data.products.length) {
          return res.data.data.products || [];
        }
      }
    } catch (err) {
      throw new Meteor.Error('failed', err.message);
    }
  },
  getDigistore24ProductPaymentPlans(productId, externalProviderId) {
    check(productId, String);
    check(externalProviderId, String);

    if (!Meteor.user()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const provider = ExternalProviders.findOne({ _id: externalProviderId, userId: Meteor.userId() });
    if (!provider) {
      return [];
    }

    try {
      if (provider.type === 'digistore24' && provider.apiKey) {
        const res = HTTP.call('POST', 'https://www.digistore24.com/api/call/' + provider.apiKey + '/json/getProduct/', {
          headers: {
            Accept: 'application/json'
          },
          params: {
            product_id: parseInt(productId, 10)
          }
        });

        if (res.data && res.data.data && res.data.data.paymentplans && res.data.data.paymentplans.length) {
          return res.data.data.paymentplans;
        }
      }
    } catch (err) {
      throw new Meteor.Error('failed', err.message);
    }
  },
  checkDigistore24apiKey(type, apiKey) {
    check(type, String);
    check(apiKey, String);

    if (!Meteor.user()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    try {
      if (type === 'digistore24' && apiKey) {
        const res = HTTP.call('POST', 'https://www.digistore24.com/api/call/' + apiKey + '/json/listProducts/', {
          headers: {
            Accept: 'application/json'
          },
          params: {}
        });

        if (res.data && res.data.data && res.data.data.products && res.data.data.products.length) {
          return true;
        } else {
          return false;
        }
      }
    } catch (err) {
      throw new Meteor.Error('failed', err.message);
    }
  }
});
