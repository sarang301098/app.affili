import { Meteor } from 'meteor/meteor';

import Products from 'meteor/affilihero-lib/collections/products';
import Toplist from 'meteor/affilihero-lib/collections/toplist';

Meteor.methods({
  getProductCount() {
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    return Products.find({ userId: Meteor.userId() }).count() || 0;
  },
  getToplistCount() {
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
      search.projectId = { $in: Meteor.user().projectIds };
    }

    return Toplist.find(search).count() || 0;
  },
});
