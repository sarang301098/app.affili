import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';

import Toplist from 'meteor/affilihero-lib/collections/toplist';

Meteor.methods({
  getToplists(page, pageSize, searchQuery, projectId, productId) {
    check(page, Number);
    check(pageSize, Number);
    check(searchQuery, String);
    check(projectId, String);
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId(), productId };
    const isProject = (Meteor.user().projectIds || []).includes(projectId);

    if (Meteor.user() && Meteor.user().subUser && isProject) {
      search.userId = Meteor.user().parentUserId;
    }

    if (searchQuery) {
      search.name = { $regex: searchQuery, $options: 'i' };
    }

    const toplists = Toplist.find(search, { skip: pageSize * page, limit: pageSize, sort: { createdAt: -1 } }).fetch().map(toplist => ({
      ...toplist
    }));

    const count = Toplist.find(search).count();

    return {
      toplists,
      pages: Math.ceil(count / pageSize),
    };
  },
  getToplistById(toplistId) {
    check(toplistId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const toplist = Toplist.findOne(toplistId);

    return toplist || {};
  },
  getToplistSelectOptions(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId(), productId };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const toplistSelectOptions = Toplist.find(search).fetch().map((toplist) => ({
      value: toplist._id,
      label: toplist.name
    }));

    return toplistSelectOptions || [];
  }
});
