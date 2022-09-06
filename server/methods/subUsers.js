import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

Meteor.methods({
  addSubUser(email) {
    check(email, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (!emailRegex.test(email)) {
      throw new Meteor.Error('invalid-email', 'E-Mail ist ungültig');
    }

    let newUser = false;
    let user = Meteor.users.findOne({ 'emails.address': { $regex: email, $options: 'i' } });
    if (!user) {
      newUser = true;
      const userId = Accounts.createUser({
        email,
        subUser: true,
        parentUserId: Meteor.userId()
      });
      user = Meteor.users.findOne(userId);
    } else {
      throw new Meteor.Error('existing', 'Es existiert bereits ein Nutzer mit dieser Email');
    }

    if (newUser) {
      Accounts.generateResetToken(user._id, email, 'enrollAccount');
    }

    return {
      user: { _id: user._id, profile: { name: user.profile.name } },
      newUser
    };
  },
  updateSubUsersProjectIds(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Meteor.users.update({ _id: Meteor.userId() }, { $addToSet: { projectIds: projectId } });
  },
  removeProjectIdFromSubUser(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (Meteor.user().subUser) {
      Meteor.users.update({ _id: Meteor.userId() }, { $pull: { projectIds: projectId } });
    } else {
      Meteor.users.update({ subUser: true }, { $pull: { projectIds: projectId } }, { multi: true });
    }
  }
});
