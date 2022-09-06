import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';

import Products from 'meteor/affilihero-lib/collections/products';

Meteor.methods({
  getProducts(projectId, page, pageSize, searchQuery) {
    check(projectId, String);
    check(page, Number);
    check(pageSize, Number);
    check(searchQuery, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId(), projectId };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    if (searchQuery) {
      search.name = { $regex: searchQuery, $options: 'i' };
    }

    const products = Products.find(search, { skip: pageSize * page, limit: pageSize, sort: { createdAt: -1 } }).fetch().map(product => ({
      ...product
    }));

    const mainPage = Products.findOne({ userId: Meteor.userId() });
    const count = Products.find(search).count();

    return {
      products: products || [],
      pages: Math.ceil(count / pageSize)
    };
  },
  getProductById(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const search = { userId: Meteor.userId(), _id: productId };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const product = Products.findOne(search);

    return product || {};
  },
  getProductName(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { _id: productId };

    const productName = (Products.findOne(search) || {}).name || '';

    return productName || '';
  },
  getProductSelectOptions() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const productSelectOptions = Products.find(search).fetch().map((product) => ({
      value: product._id,
      label: product.name
    }));

    return productSelectOptions || [];
  },
  getProductMarketplaceSettings(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId(), _id: productId };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const product = Products.findOne(search) || {};

    return {
      marketPlaceSettings: product.marketPlaceSettings || {},
      name: product.name || '',
      domainId: product.domainId || '',
      marketPlace: product.marketPlace || false
    };
  }
});
