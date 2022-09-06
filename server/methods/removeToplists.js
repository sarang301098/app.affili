import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Toplist from 'meteor/affilihero-lib/collections/toplist';

Meteor.methods({
  removeToplists(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    return Toplist.remove({ projectId });
  }
});
