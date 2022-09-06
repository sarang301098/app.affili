import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Projects from 'meteor/affilihero-lib/collections/projects';
import Products from 'meteor/affilihero-lib/collections/products';

Meteor.methods({
  getAffiliateUserCount() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
      search.projectId = { $in: Meteor.user().projectIds };
    }

    const products = Products.find(search).fetch() || [];
    const productIds = products.map(p => p._id);

    return Meteor.users.find({ affiliate: true, product: { $all: [{ "$elemMatch": { id: { $in: productIds || [] } } }] } }).count();
  },
  getAffiliateUserList(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    // isVerified: false
    const data = Meteor.users.find({ affiliate: true, product: { $all: [{ "$elemMatch": { id: productId } }] } }).fetch().map(user => ({
      userId: user._id,
      profile: user.profile || {},
      product: ((user.product || []).find(product => product.id === productId))
    }));

    return data || [];
  },
  verifyAffiliateUserProduct(userId, product) {
    check(userId, String);
    check(product, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    if (product && product.id) {
      const productData = Products.findOne(product.id);
      let { emailOptIn } = productData || {};

      let newEmailOptin = {
        'userId': userId,
        'isOptIn': false,
        'isUserRejected': false
      }

      if (emailOptIn && (emailOptIn || []).length) {
        var existingIds = emailOptIn.map((obj) => obj.userId);
        if (!existingIds.includes(newEmailOptin.userId)) {
          emailOptIn.push(newEmailOptin);
        } else {
          (emailOptIn || []).forEach((element, index) => {
            if (element.userId === newEmailOptin.userId) {
              emailOptIn[index] = newEmailOptin;
            };
          });
        };
      } else {
        emailOptIn = [];
        emailOptIn.push(newEmailOptin);
      }
      Products.update({ _id: product.id }, { $set: { emailOptIn } });
    }

    return Meteor.users.update({ _id: userId, "product.id": product.id }, { $set: { "product.$.isVerified": true, "product.$.isRejected": false } });
  },
  rejectAffiliateUserProduct(userId, product) {
    check(userId, String);
    check(product, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    return Meteor.users.update({ _id: userId, "product.id": product.id }, { $set: { "product.$.isVerified": false, "product.$.isRejected": true } });
  }
});
