import { Meteor } from 'meteor/meteor';

import Updates from 'meteor/affilihero-lib/collections/updates';

Meteor.methods({
  getUnreadUpdatesCount: () => {
    if (Meteor.user()) {
      if (Meteor.user() && Meteor.user().readUpdateIds && Meteor.user() && Meteor.user().readUpdateIds.length) {
        return Updates.find({ createdAt: { $gte: Meteor.user().createdAt }, _id: { $nin: Meteor.user() && Meteor.user().readUpdateIds } }).count();
      }
      return Updates.find({ createdAt: { $gte: Meteor.user().createdAt } }).count();
    }
    return 0;
  },
  markUpdatesAsRead: () => {
    if (Meteor.user()) {
      return Meteor.users.update(Meteor.userId(), { $set: { readUpdateIds: Updates.find().fetch().map(update => update._id) } });
    }
    return true;
  },
  markUpdatesAsUnread: () => {
    if (Meteor.user()) {
      return Meteor.users.update(Meteor.userId(), { $unset: { readUpdateIds: 1 } });
    }
    return true;
  }
});
