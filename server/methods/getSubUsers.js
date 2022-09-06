import { Meteor } from 'meteor/meteor';

Meteor.methods({
  getSubUsers() {

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    const subUsers = Meteor.users.find({ parentUserId: Meteor.userId() }).fetch();
    const user = Meteor.user() || {};

    return {
      subUsers: subUsers || [],
      user: user || {}
    };
  }
});