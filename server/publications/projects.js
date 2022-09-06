import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Projects from 'meteor/affilihero-lib/collections/projects';

Meteor.publish('project', function (id) {
  check(id, String);

  const search = { _id: id, userId: this.userId };

  return Projects.find(search);
});

Meteor.publish('projects', function () {
  return Projects.find({ userId: this.userId }, { sort: { createdAt: -1 } });
});
