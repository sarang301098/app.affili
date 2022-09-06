import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import md5 from '../../imports/utils/md5';

Meteor.methods({
  changeEmail(newEmail) {
    check(newEmail, String);

    const user = Meteor.users.findOne(Meteor.userId());

    let emailsRemoved = false;
    if (user.emails && user.emails.some(email => !email.verified)) {
      user.emails.forEach((email) => {
        Accounts.removeEmail(user._id, email.address);
      });
      emailsRemoved = true;
    }

    Accounts.addEmail(user._id, newEmail);
    Accounts.sendVerificationEmail(user._id);

    if (!emailsRemoved) {
      user.emails.forEach((email) => {
        Accounts.removeEmail(user._id, email.address);
      });
    }

    Meteor.users.update(user._id, { $set: { 'profile.picture': 'https://www.gravatar.com/avatar/' + md5(newEmail) + '/picture/?type=large' } });
  }
});
