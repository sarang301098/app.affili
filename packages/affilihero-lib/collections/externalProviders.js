import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const ExternalProviders = new Mongo.Collection('externalProviders');

ExternalProviders.attachSchema(
  new SimpleSchema({
    userId: {
      type: String,
      index: 1
    },
    type: {
      type: String
    },
    name: {
      type: String
    },
    username: {
      type: String,
      optional: true
    },
    password: {
      type: String,
      optional: true
    },
    apiKey: {
      type: String,
      optional: true
    },
    apiBaseUrl: {
      type: String,
      optional: true
    },
    accessToken: {
      type: String,
      optional: true
    },
    updatedAt: {
      type: Date,
      optional: true
    },
    createdAt: {
      type: Date,
      denyUpdate: true
    },
    digistore24ApiKey: {
      type: String,
      optional: true
    }
  })
);

if (Meteor.isServer) {
  ExternalProviders.allow({
    insert(userId, doc) {
      const user = Meteor.users.findOne(userId);
      if (!user || !user.plan || !user.plan.active) {
        throw new Meteor.Error(401, 'Kein aktiver Plan vorhanden.');
      }

      return (doc.userId === userId && !user.subUser);
    },
    update(userId, doc) {
      const user = Meteor.users.findOne(userId);
      if (!user || !user.plan || !user.plan.active) {
        throw new Meteor.Error(401, 'Kein aktiver Plan vorhanden.');
      }

      return (doc.userId === userId && !user.subUser);
    },
    remove(userId, doc) {
      return doc.userId === userId;
    }
  });
}

export default ExternalProviders;
