import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Projects from 'meteor/affilihero-lib/collections/projects';

Meteor.methods({
  getProjectCount() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
      search._id = { $in: Meteor.user().projectIds };
    }

    return Projects.find(search).count() || 0
  }
});
