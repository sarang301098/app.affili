import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';

import Reviews from 'meteor/affilihero-lib/collections/affiliateReview';
import Projects from 'meteor/affilihero-lib/collections/projects';
import Products from 'meteor/affilihero-lib/collections/products';

Meteor.methods({
  async removeUserReview(reviewId) {
    check(reviewId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    await Reviews.remove(reviewId);

    const reviews = Reviews.find({ affiliateManagerUserId: Meteor.userId(), isVerified: true }).fetch();

    let averageRating = 0;
    if (reviews) {
      averageRating = _.meanBy(reviews, 'rating');
    }

    if (averageRating) {
      Meteor.users.update({ _id: Meteor.userId() }, { $set: { averageRating, updatedAt: new Date() } });
    } else {
      Meteor.users.update({ _id: Meteor.userId() }, { $set: { averageRating: 0, updatedAt: new Date() } });
    }
  },
  async removeReview(reviewId, productId) {
    check(reviewId, String);
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    await Reviews.remove(reviewId);

    if (productId) {
      const reviews = Reviews.find({ productId, isVerified: true }).fetch() || [];

      let averageRating = 0;
      if (reviews) {
        averageRating = _.meanBy(reviews, 'rating');
      }

      if (averageRating) {
        Products.update({ _id: productId }, { $set: { averageRating, updatedAt: new Date() } });
      } else {
        Products.update({ _id: productId }, { $set: { averageRating: 0, updatedAt: new Date() } });
      }
    }
  }
});
