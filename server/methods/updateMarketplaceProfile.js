import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  updateMarketplaceProfile(update) {
    check(update, Object);

    if (!Meteor.userId()) {
      return;
    }

    const user = Meteor.users.findOne(Meteor.userId());
    if (!user.marketPlace) {
      return;
    }

    return Meteor.users.update(Meteor.userId(), { $set: { marketPlaceProfile: update } });
  }
});
