import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';

Meteor.publish('externalProviders', function () {

  const search = { userId: Meteor.userId() };

  if (Meteor.user() && Meteor.user().subUser) {
    search.userId = Meteor.user().parentUserId;
  }

  return ExternalProviders.find(search);
});

Meteor.publish('externalProvider', function (id) {
  check(id, String);

  const search = { _id: id, userId: Meteor.userId() };

  if (Meteor.user() && Meteor.user().subUser) {
    search.userId = Meteor.user().parentUserId;
  }

  return ExternalProviders.find(search);
});
