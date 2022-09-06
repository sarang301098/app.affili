import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Reviews = new Mongo.Collection('reviews');

Reviews.attachSchema(
  new SimpleSchema({
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    marketPlaceUserId: {
      type: String,
      optional: true
    },
    rating: {
      type: Number,
      optional: true
    },
    comment: {
      type: String,
      optional: true
    },
    createdAt: {
      type: Date,
      denyUpdate: true
    },
    updatedAt: {
      type: Date,
      optional: true
    },
    productId: {
      type: String,
      optional: true
    },
    isVerified: {
      type: Boolean,
      optional: true
    },
    verifiedUserId: {
      type: String,
      optional: true
    },
    projectId: {
      type: String,
      optional: true
    },
    affiliateManagerUserId: {
      type: String,
      optional: true
    }
  })
);

if (Meteor.isServer) {
  Reviews.allow({
    insert(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user.role === 'admin' || doc.marketPlaceUserId === userId || doc.userId === userId || doc.verifiedUserId === userId;
    },
    update(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user.role === 'admin' || doc.marketPlaceUserId === userId || doc.userId === userId || doc.verifiedUserId === userId;
    },
    remove(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user.role === 'admin' || doc.marketPlaceUserId === userId || doc.userId === userId || doc.verifiedUserId === userId;
    }
  });
}

export default Reviews;
