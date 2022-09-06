import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import Plans from './plans';

const Toplist = new Mongo.Collection('toplist');

Toplist.attachSchema(
  new SimpleSchema({
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    projectId: {
      type: String,
      optional: true
    },
    productId: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    },
    status: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    salesNumber: {
      type: Number,
      optional: true
    },
    externalProviderId: {
      type: String,
      optional: true
    },
    salesPoints: {
      type: Number,
      optional: true
    },
    images: {
      type: [String],
      optional: true
    },
    image: {
      type: String,
      optional: true
    },
    name: {
      type: String,
      optional: true
    },
    digistore24ProductId: {
      type: String,
      optional: true
    },
    affiliconProductId: {
      type: String,
      optional: true
    },
    notificationEmail: {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Email
    },
    createdAt: {
      type: Date,
      denyUpdate: true
    },
    updatedAt: {
      type: Date,
      optional: true
    },
    externalProviderId: {
      type: String,
      optional: true
    },
    createdBySubUser: {
      type: Boolean,
      optional: true
    },
    startDate: {
      type: Date,
      optional: true
    },
    endDate: {
      type: Date,
      optional: true
    },
    rankingPrizes: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    prizes: {
      type: [Object],
      optional: true,
      blackbox: true
    },
  })
);

if (Meteor.isServer) {
  Toplist.allow({
    insert(userId, doc) {
      const user = Meteor.user().subUser ? Meteor.users.findOne(Meteor.user().parentUserId) : Meteor.users.findOne(userId);

      if (!user || !user.plan || !user.plan.active) {
        throw new Meteor.Error(401, 'Kein aktiver Plan vorhanden.');
      }

      const isProject = Meteor.user().subUser ? (Meteor.user().projectIds || []).includes(doc.projectId || '') : false;
      let maximumToplists = 1;
      if (user.plan && user.plan.id) {
        const plan = Plans.findOne(user.plan.id);
        if (plan && typeof plan.maximumToplists === 'number') {
          maximumToplists = plan.maximumToplists;
        }
      }

      if (user.role !== 'admin' && Toplist.find({ userId: Meteor.user().subUser ? Meteor.user().parentUserId : userId }).count() >= maximumToplists && maximumToplists >= 0) {
        throw new Meteor.Error('maxToplist', 'Du kannst nur maximal ' + maximumToplists + ' Toplist' + (maximumToplists === 1 ? '' : 's') + ' erstellen.');
      }

      return user.role === 'admin' || doc.userId === userId || (doc.userId === Meteor.user().parentUserId && isProject);
    },
    update(userId, doc) {
      const user = Meteor.users.findOne(userId);
      if (!user || !user.plan || !user.plan.active) {
        throw new Meteor.Error(401, 'Kein aktiver Plan vorhanden.');
      }

      const isProject = Meteor.user().subUser ? (Meteor.user().projectIds || []).includes(doc.projectId || '') : false;
      return user.role === 'admin' || doc.userId === userId || (doc.userId === Meteor.user().parentUserId && isProject);
    },
    remove(userId, doc) {
      const user = Meteor.users.findOne(userId);
      const isProject = Meteor.user().subUser ? (Meteor.user().projectIds || []).includes(doc.projectId || '') : false;

      return user.role === 'admin' || doc.userId === userId || (doc.userId === Meteor.user().parentUserId && isProject);
    }
  });
}

export default Toplist;
