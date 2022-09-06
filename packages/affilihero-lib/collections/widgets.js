import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import Plans from './plans';

const Widgets = new Mongo.Collection('widgets');

Widgets.attachSchema(
  new SimpleSchema({
    name: {
      type: String
    },
    userId: {
      type: String
    },
    title: {
      type: String,
      optional: true
    },
    description: {
      type: String,
      optional: true
    },
    domainId: {
      type: String,
      optional: true
    },
    slug: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    },
    niche: {
      type: String,
      optional: true
    },
    goal: {
      type: String,
      optional: true
    },
    digistore24ApiRequestToken: {
      type: String,
      optional: true
    },
    digistore24ApiKey: {
      type: String,
      optional: true
    },
    shareTitle: {
      type: String,
      optional: true
    },
    shareDescription: {
      type: String,
      optional: true
    },
    shareImageUrl: {
      type: String,
      optional: true
    },
    imageUrl: {
      type: String,
      optional: true
    },
    coverUrl: {
      type: String,
      optional: true
    },
    headline: {
      type: String,
      optional: true
    },
    subline: {
      type: String,
      optional: true
    },
    logoUrl: {
      type: String,
      optional: true
    },
    template: {
      type: String,
      optional: true
    },
    footerText: {
      type: String,
      optional: true
    },
    footerName: {
      type: String,
      optional: true
    },
    backgroundColor: {
      type: String,
      optional: true
    },
    backgroundImageUrl: {
      type: String,
      optional: true
    },
    backgroundRepeat: {
      type: Boolean,
      optional: true
    },
    emailProviderId: {
      type: String,
      optional: true
    },
    emailProviderListId: {
      type: String,
      optional: true
    },
    emailProviderTagId: {
      type: String,
      optional: true
    },
    actions: {
      type: [Object],
      optional: true
    },
    'actions.$.id': {
      type: String,
      optional: true
    },
    'actions.$.title': {
      type: String,
      optional: true
    },
    'actions.$.type': {
      type: String,
      optional: true
    },
    'actions.$.username': {
      type: String,
      optional: true
    },
    'actions.$.url': {
      type: String,
      optional: true
    },
    'actions.$.code': {
      type: String,
      optional: true
    },
    'actions.$.entries': {
      type: Number,
      optional: true
    },
    'actions.$.totalEntries': {
      type: Number,
      optional: true
    },
    'actions.$.confirmEmail': {
      type: Boolean,
      optional: true
    },
    'actions.$.confirmConversion': {
      type: Boolean,
      optional: true
    },
    'actions.$.conversionUrl': {
      type: String,
      optional: true
    },
    'actions.$.customUrl': {
      type: String,
      optional: true
    },
    'actions.$.conversionText': {
      type: String,
      optional: true
    },
    'actions.$.conversionButtonText': {
      type: String,
      optional: true
    },
    'actions.$.videoEmbedCode': {
      type: String,
      optional: true
    },
    viewPixelIds: {
      type: [String],
      optional: true
    },
    resultPixelIds: {
      type: [String],
      optional: true
    },
    resultEnabled: {
      type: Boolean,
      optional: true
    },
    resultEntries: {
      type: Number,
      optional: true
    },
    resultContent: {
      type: String,
      optional: true
    },
    resultRedirectEnabled: {
      type: Boolean,
      optional: true
    },
    resultRedirects: {
      type: [Object],
      optional: true
    },
    'resultRedirects.$.points': {
      type: Number
    },
    'resultRedirects.$.url': {
      type: String
    },
    voluntaryEnabled: {
      type: Boolean,
      optional: true
    },
    voluntaryButtonText: {
      type: String,
      optional: true
    },
    voluntaryButtonColor: {
      type: String,
      optional: true
    },
    voluntaryButtonBackgroundColor: {
      type: String,
      optional: true
    },
    participateWithoutRegistration: {
      type: Boolean,
      optional: true
    },
    toplistEnabled: {
      type: Boolean,
      optional: true
    },
    brandingHidden: {
      type: Boolean,
      optional: true
    },
    cookieNoticeEnabled: {
      type: Boolean,
      optional: true
    },
    authDisabled: {
      type: Boolean,
      optional: true
    },
    facebookAuthDisabled: {
      type: Boolean,
      optional: true
    },
    cookieNoticeText: {
      type: String,
      optional: true
    },
    imprintUrl: {
      type: String,
      optional: true
    },
    privacyUrl: {
      type: String,
      optional: true
    },
    countdownEnabled: {
      type: Boolean,
      optional: true
    },
    countdownColor: {
      type: String,
      optional: true
    },
    countdownLabelColor: {
      type: String,
      optional: true
    },
    countdownBackgroundColor: {
      type: String,
      optional: true
    },
    endedRedirectUrl: {
      type: String,
      optional: true
    },
    endedContent: {
      type: String,
      optional: true
    },
    endsAt: {
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
  Widgets.allow({
    insert(userId, doc) {
      const user = Meteor.users.findOne(userId);

      let maximumWidgets = 1;
      if (user.plan && user.plan.id) {
        const plan = Plans.findOne(user.plan.id);
        if (plan && typeof plan.maximumWidgets === 'number') {
          maximumWidgets = plan.maximumWidgets;
          if (maximumWidgets > 0 && user.plan.addonIds) {
            user.plan.addonIds.forEach((addonId) => {
              const addon = Plans.findOne(addonId);
              if (addon && typeof addon.maximumWidgets === 'number') {
                maximumWidgets += addon.maximumWidgets;
              }
            });
          }
        }
      }
      if (user.role !== 'admin' && Widgets.find({ userId, previewMode: { $ne: true } }).count() >= maximumWidgets && maximumWidgets >= 0) {
        throw new Meteor.Error('maxWidgets', 'Du kannst nur maximal ' + maximumWidgets + ' Kampagne' + (maximumWidgets === 1 ? '' : 's') + ' erstellen.');
      }

      return doc.userId === userId;
    },
    update(userId, docExisting, _, update) {
      const user = Meteor.users.findOne(userId);

      return docExisting.userId === userId;
    },
    remove(userId, doc) {
      return doc.userId === userId;
    }
  });
}

export default Widgets;
