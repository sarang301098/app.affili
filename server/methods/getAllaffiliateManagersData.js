import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';

import Reviews from 'meteor/affilihero-lib/collections/affiliateReview';

Meteor.methods({
  getAllaffiliateManagers(page, pageSize, searchQuery, category, ratings) {
    check(page, Number);
    check(pageSize, Number);
    check(searchQuery, String);
    check(category, String);
    check(ratings, String);

    const search = { marketPlace: true };
    let filter = { skip: pageSize * page, limit: pageSize };
    const sort = {};

    if (searchQuery) {
      search['marketPlaceProfile.name'] = { $regex: searchQuery, $options: 'i' };
    }
    if (category && category != 'all') {
      search['marketPlaceProfile.category'] = category;
    }
    if (ratings && ratings != 'all') {
      if (ratings === 'decending') {
        sort.averageRating = -1;
      } else if (ratings === 'accending') {
        sort.averageRating = 1;
      } else if (ratings === 'latest') {
        sort.createdAt = -1;
      } else if (ratings === 'oldest') {
        sort.createdAt = 1;
      }
    }

    if (sort && Object.keys(sort) && Object.keys(sort).length > 0) {
      filter = Object.assign({}, filter, { sort });
    }

    const allUsers = Meteor.users.find(search, filter).fetch().map(user => ({
      ...user
    }));

    const count = Meteor.users.find(search).count();

    return {
      isEmpty: !allUsers.length,
      allUsers,
      pages: Math.ceil(count / pageSize),
    };
  },
  getUserMarketPlaceProfile(userId) {
    check(userId, String);

    const user = Meteor.users.findOne(userId);

    if (user && user.marketPlace && user.marketPlaceProfile) {
      return user.marketPlaceProfile || {};
    }
    return undefined;
  },
  getUserReviews(affiliateManagerUserId) {
    check(affiliateManagerUserId, String);

    const review = Reviews.findOne({ userId: Meteor.userId(), affiliateManagerUserId });

    const allReviews = Reviews.find({ affiliateManagerUserId, isVerified: true }).fetch().map(reviewData => ({
      ...reviewData,
      userProfile: (Meteor.users.findOne(reviewData.userId) || {}).profile || {}
    }));

    return {
      review,
      allReviews
    };
  },
  updateAffiliateManagersRatings(affiliateManagerUserId, rating, comment) {
    check(affiliateManagerUserId, String);
    check(rating, Number);
    check(comment, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const review = Reviews.findOne({ userId: Meteor.userId(), affiliateManagerUserId });

    let id;
    if (review) {
      id = Reviews.update({ userId: Meteor.userId(), affiliateManagerUserId }, { $set: { rating, comment, isVerified: false, verifiedUserId: affiliateManagerUserId, updatedAt: new Date() } });
    } else {
      id = Reviews.insert({ userId: Meteor.userId(), affiliateManagerUserId, rating, comment, isVerified: false, verifiedUserId: affiliateManagerUserId, createdAt: new Date(), updatedAt: new Date() });
    }

    if (id) {
      const reviews = Reviews.find({ affiliateManagerUserId, isVerified: true }).fetch();
      let averageRating = 0;
      if (reviews) {
        averageRating = _.meanBy(reviews, 'rating');
      }

      if (averageRating) {
        Meteor.users.update(affiliateManagerUserId, { $set: { averageRating } });
      } else {
        Meteor.users.update(affiliateManagerUserId, { $set: { averageRating: 0 } });
      }
    }

    if (id) {
      return true;
    }
    return false;
  },
  async removeAffiliateManagersReview(reviewId, affiliateManagerUserId) {
    check(reviewId, String);
    check(affiliateManagerUserId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    await Reviews.remove(reviewId);

    const reviews = Reviews.find({ affiliateManagerUserId, isVerified: true }).fetch();

    let averageRating = 0;
    if (reviews) {
      averageRating = _.meanBy(reviews, 'rating');
    }

    if (averageRating) {
      Meteor.users.update({ _id: affiliateManagerUserId }, { $set: { averageRating, updatedAt: new Date() } });
    } else {
      Meteor.users.update({ _id: affiliateManagerUserId }, { $set: { averageRating: 0, updatedAt: new Date() } });
    }
  },
});
