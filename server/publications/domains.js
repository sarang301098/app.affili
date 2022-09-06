import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Domains from 'meteor/affilihero-lib/collections/domains';

Meteor.publish('domains', function () {
  const search = { userId: this.userId };

  return Domains.find(search);
});

Meteor.publish('domain', function (id) {
  check(id, String);

  const search = { _id: id, userId: this.userId };

  return Domains.find(search);
});
