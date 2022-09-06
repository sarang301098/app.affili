import { Meteor } from 'meteor/meteor';

Meteor.publish({
  userData() {
    let search = this.userId;
    if (Meteor.user() && Meteor.user().subUser) {
      search = { _id: { $in: [this.userId, Meteor.user().parentUserId] } };
    }

    return Meteor.users.find(search, { fields: { profile: 1, marketPlaceProfile: 1, marketPlace: 1, billing: 1, plan: 1, role: 1, createdAt: 1, reachedLimits: 1, dataProcessingAgreedAt: 1, subUser: 1, parentUserId: 1 } });
  },
  subUsers() {
    return Meteor.users.find({ parentUserId: this.userId });
  }
});
