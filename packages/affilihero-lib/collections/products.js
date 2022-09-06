import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import Plans from './plans';

const Products = new Mongo.Collection('products');

Products.attachSchema(
  new SimpleSchema({
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    name: {
      type: String,
      optional: true
    },
    projectId: {
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
    externalProviderId: {
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
    publicVisible: {
      type: Boolean,
      optional: true
    },
    marketPlace: {
      type: Boolean,
      optional: true
    },
    marketPlaceSettings: {
      type: Object,
      optional: true,
      blackbox: true
    },
    averageRating: {
      type: Number,
      decimal: true,
      optional: true
    },
    redirectUrl: {
      type: String,
      optional: true
    },
    productType: {
      type: String,
      optional: true
    },
    emailTemplates: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    affiliateId: {
      type: String,
      optional: true
    },
    productIds: {
      type: [String],
      optional: true
    },
    banners: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    links: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    shareFacebook: {
      type: Boolean,
      optional: true
    },
    shareWhatsapp: {
      type: Boolean,
      optional: true
    },
    shareTwitter: {
      type: Boolean,
      optional: true
    },
    shareInstagram: {
      type: Boolean,
      optional: true
    },
    imprintUrl: {
      type: String,
      optional: true
    },
    privacyPolicyUrl: {
      type: String,
      optional: true
    },
    headerColor: {
      type: String,
      optional: true
    },
    buttonColor: {
      type: String,
      optional: true
    },
    textColorOne: {
      type: String,
      optional: true
    },
    textColorTwo: {
      type: String,
      optional: true
    },
    backgroundColorOne: {
      type: String,
      optional: true
    },
    backgroundColorTwo: {
      type: String,
      optional: true
    },
    footerColor: {
      type: String,
      optional: true
    },
    templateColor: {
      type: String,
      optional: true
    },
    productImage: {
      type: String,
      optional: true
    },
    productDescription: {
      type: String,
      optional: true
    },
    toplistId: {
      type: String,
      optional: true
    },
    paymentPlanId: {
      type: String,
      optional: true
    },
    prizes: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    createdBySubUser: {
      type: Boolean,
      optional: true
    },
    digistore24ProductIds: {
      type: [String],
      optional: true
    },
    affiliateLinkHeader: {
      type: String,
      optional: true
    },
    affiliateLinkInfo: {
      type: String,
      optional: true
    },
    digistore24IdInfo: {
      type: String,
      optional: true
    },
    imprint: {
      type: String,
      optional: true
    },
    privacyPolicy: {
      type: String,
      optional: true
    },
    bannersHeading: {
      type: String,
      optional: true
    },
    bannersInfo: {
      type: String,
      optional: true
    },
    emailTemplatesHeading: {
      type: String,
      optional: true
    },
    emailTemplatesInfo: {
      type: String,
      optional: true
    },
    affiliateToplistHeading: {
      type: String,
      optional: true
    },
    affiliateToplistInfo: {
      type: String,
      optional: true
    },
    redirectToDigistoreText: {
      type: String,
      optional: true
    },
    digistoreLinkText: {
      type: String,
      optional: true
    },
    emailOptIn: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    optinCode: {
      type: String,
      optional: true
    },
    welcomeVideo: {
      type: Object,
      optional: true,
      blackbox: true
    },
    showEventLink: {
      type: Boolean,
      optional: true
    },
    trainingLink: {
      type: String,
      optional: true
    },
    trainingText: {
      type: String,
      optional: true
    },
    domainId: {
      type: String,
      optional: true
    },
    domaintld: {
      type: String,
      optional: true
    },
  })
);

if (Meteor.isServer) {
  Products.allow({
    insert(userId, doc) {
      const user = Meteor.user().subUser ? Meteor.users.findOne(Meteor.user().parentUserId) : Meteor.users.findOne(userId);
      if (!user || !user.plan || !user.plan.active) {
        throw new Meteor.Error(401, 'Kein aktiver Plan vorhanden.');
      }

      let maximumProducts = 1;
      if (user.plan && user.plan.id) {
        const plan = Plans.findOne(user.plan.id);
        if (plan && typeof plan.maximumProducts === 'number') {
          maximumProducts = plan.maximumProducts;
        }
      }

      if (user.role !== 'admin' && Products.find({ userId: Meteor.user().subUser ? Meteor.user().parentUserId : userId }).count() >= maximumProducts && maximumProducts >= 0) {
        throw new Meteor.Error('maxProducts', 'Du kannst nur maximal ' + maximumProducts + ' Products' + (maximumProducts === 1 ? '' : 's') + ' erstellen.');
      }

      return user.role === 'admin' || doc.userId === userId || (doc.userId === Meteor.user().parentUserId);
    },
    update(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user.role === 'admin' || doc.userId === userId || (doc.userId === Meteor.user().parentUserId);
    },
    remove(userId, doc) {
      const user = Meteor.users.findOne(userId);
      return user.role === 'admin' || doc.userId === userId;
    }
  });
}

export default Products;
