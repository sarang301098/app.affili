import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Products from 'meteor/affilihero-lib/collections/products';

Meteor.methods({
  removeProducts(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    return Products.remove({ projectId });
  }
});
