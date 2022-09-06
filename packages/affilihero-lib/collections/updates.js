import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';

const Updates = new Mongo.Collection('updates');

Updates.attachSchema(
  new SimpleSchema({
    title: {
      type: String
    },
    content: {
      type: String
    },
    category: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    },
    imageUrl: {
      type: String,
      optional: true
    },
    createdAt: {
      type: Date,
      denyUpdate: true,
      defaultValue: new Date
    }
  })
);

if (Meteor.isServer) {
  Updates.allow({
    insert(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user && user.role === 'admin';
    },
    update(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user && user.role === 'admin';
    },
    remove(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user && user.role === 'admin';
    }
  });
}

export default Updates;
