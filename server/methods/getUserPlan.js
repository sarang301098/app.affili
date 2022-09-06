import { Meteor } from 'meteor/meteor';

import Plans from 'meteor/affilihero-lib/collections/plans';

Meteor.methods({
  getUserPlan() {

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    const userPlan = Meteor.user() && Meteor.user().plan && (Meteor.user().plan || {}).active ? Plans.findOne(Meteor.user().plan.id) || {} : { defaultPlan: false }

    return userPlan || {};
  }
});