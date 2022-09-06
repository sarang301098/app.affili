import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Products from 'meteor/affilihero-lib/collections/products';

Meteor.publish('product', function (id) {
  check(id, String);

  const search = { _id: id, userId: this.userId };

  return Products.find(search);
});

Meteor.publish('products', function () {
  return Products.find({ userId: this.userId }, { sort: { createdAt: -1 } });
});
