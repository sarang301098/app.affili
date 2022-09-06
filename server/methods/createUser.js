import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import tagActiveCampaign from '../utils/tagActiveCampaign';

Meteor.methods({
  createUserFromClient(options) {
    check(options, Object);

    if (Meteor.userId()) {
      throw Meteor.Error(401);
    }

    Accounts.createUser(options);

    const user = Meteor.users.findOne({ 'emails.address': options.email });

    if (user) {
      Accounts.sendEnrollmentEmail(user._id);
    }

    /*
    try {
      tagActiveCampaign(options.email, 'register');
    } catch (err) {
      console.error(err);
    }
    */
  }
});
