import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Plans from './plans';

const Domains = new Mongo.Collection('domains');

Domains.attachSchema(
  new SimpleSchema({
    userId: {
      type: String
    },
    tld: {
      type: String
    },
    updatedAt: {
      type: Date,
      optional: true
    },
    createdAt: {
      type: Date,
      denyUpdate: true
    }
  })
);

if (Meteor.isServer) {
  Domains.allow({
    insert(userId, doc) {
      const user = Meteor.users.findOne(userId);

      if (!user || !user.plan || !user.plan.active) {
        throw new Meteor.Error(401, 'Kein aktiver Plan vorhanden.');
      }

      let plan;
      if (user.plan && user.plan.id) {
        plan = Object.assign({}, Plans.findOne(user.plan.id), user.plan);
      }

      return (doc.userId === userId && !user.subUser);
    },
    update(userId, doc) {
      const user = Meteor.users.findOne(userId);

      let plan;
      if (user.plan && user.plan.id) {
        plan = Object.assign({}, Plans.findOne(user.plan.id), user.plan);
      }

      return (doc.userId === userId && !user.subUser);
    },
    remove(userId, doc) {
      return doc.userId === userId;
    }
  });
}

export default Domains;
