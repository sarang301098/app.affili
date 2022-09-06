import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

Meteor.methods({
  getApiCredentials() {
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    let apiKey = Meteor.user().apiKey;
    if (!apiKey) {
      apiKey = Random.id(32);
      Meteor.users.update(Meteor.userId(), { $set: { apiKey } });
    }

    return {
      apiKey
    };
  }
});
