import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Reviews from 'meteor/affilihero-lib/collections/affiliateReview';

Meteor.publish('review', function (marketPlaceUserId) {
  check(marketPlaceUserId, String);

  if (!Meteor.userId()) {
    throw new Meteor.Error(401, 'forbidden');
  }

  const search = { userId: Meteor.userId(), marketPlaceUserId };

  return Reviews.find(search);
});

Meteor.publish('allReviews', function (marketPlaceUserId) {
  check(marketPlaceUserId, String);
  
  return Reviews.find({ marketPlaceUserId }, {fields: { marketPlaceUserId: 1, userId: 1, rating: 1, comment: 1, createdAt: 1, updatedAt: 1 }});
});