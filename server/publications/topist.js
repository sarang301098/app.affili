import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Toplist from 'meteor/affilihero-lib/collections/toplist';

Meteor.publish('toplist', function (id) {
  check(id, String);

  const search = { _id: id, userId: this.userId };

  return Toplist.find(search);
});

Meteor.publish('toplists', function (projectId) {
  return Toplist.find({ userId: this.userId, projectId }, { sort: { createdAt: -1 } });
});
