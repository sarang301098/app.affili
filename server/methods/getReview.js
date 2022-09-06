import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Reviews from 'meteor/affilihero-lib/collections/affiliateReview';

Meteor.methods({
  getProductReviews(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const allReviews = Reviews.find({ productId }).fetch().map(review => ({
      ...review,
      userProfile: (Meteor.users.findOne(review.userId) || {}).profile || {}
    }));

    return allReviews || [];
  },
  getAllUserReviews() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const allReviews = Reviews.find({ affiliateManagerUserId: Meteor.userId() }).fetch().map(review => ({
      ...review,
      userProfile: (Meteor.users.findOne(review.userId) || {}).profile || {}
    }));;

    return allReviews || [];
  }
});
