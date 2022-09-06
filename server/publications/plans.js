import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Plans from 'meteor/affilihero-lib/collections/plans';

Meteor.publish({
  plans() {
    if (this.userId) {
      return Plans.find({}, { reactive: false });
    }
    return [];
  },
  plan(id) {
    check(id, String);

    if (this.userId) {
      return Plans.find({ _id: id }, { reactive: false });
    }
    return [];
  },
  userPlan() {
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user && user.plan) {
      return Plans.find({ _id: { $in: [user.plan.id, ...(user.plan.addonIds || [])] } }, { reactive: false });
    }
    return null;
  }
});
