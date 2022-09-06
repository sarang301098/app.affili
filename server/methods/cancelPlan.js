import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

import digiStore24Config from '../config/digistore24';

Meteor.methods({
  cancelPlan() {
    const user = Meteor.users.findOne(Meteor.userId());
    if ((Meteor.isDevelopment || user.billing && user.billing.digistore24OrderId) && user.plan && user.plan.active) {
      try {
        let cancellationSuccess = false;
        if (user.billing && user.billing.digistore24OrderId) {
          const apiRes = HTTP.call('POST', 'https://www.digistore24.com/api/call/' + digiStore24Config.apiKey + '/json/stopRebilling/', {
            headers: {
              Accept: 'application/json'
            },
            params: {
              purchase_id: user.billing.digistore24OrderId
            }
          });

          cancellationSuccess = apiRes.data && apiRes.data.result === 'success'
        } else {
          cancellationSuccess = true;
        }

        if (cancellationSuccess) {
          return true;
        }
      } catch (err) {
        throw new Meteor.Error('error', err.message);
      }
    } else {
      throw new Meteor.Error('error', 'There is nothing to cancel!');
    }
    return false;
  }
});
