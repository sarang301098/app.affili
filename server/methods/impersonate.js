import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  impersonate(userId) {
    check(userId, String);

    if (Meteor.user().role !== 'admin') {
      throw new Meteor.Error(403, 'Permission denied');
    }
    if (!Meteor.users.findOne(userId)) {
      throw new Meteor.Error(404, 'User not found');
    }

    this.setUserId(userId);
  }
});
