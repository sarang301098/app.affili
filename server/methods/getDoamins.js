import { Meteor } from 'meteor/meteor';

import Domains from 'meteor/affilihero-lib/collections/domains';

Meteor.methods({
  getDomain() {
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const domains = Domains.find({ userId: Meteor.userId() }, { reactive: false }).fetch();

    return domains || [];
  },
  getDomainById(domainId) {
    check(domainId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const domain = Domains.findOne(domainId);

    return domain || {};
  },
  getPaginateDomains(page, pageSize) {
    check(page, Number);
    check(pageSize, Number);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const search = { userId: Meteor.userId() };

    const domains = Domains.find(search, { skip: pageSize * page, limit: pageSize, sort: { createdAt: -1 } }).fetch().map(domain => ({
      ...domain
    }));

    const count = Domains.find(search).count();

    return {
      domains: (domains || []),
      pages: Math.ceil(count / pageSize)
    };
  },
  getDomainSelectOptions() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const domainSelectOptions = Domains.find(search).fetch().map((domain) => ({
      value: domain._id,
      label: domain.tld
    }));

    return domainSelectOptions || [];
  }
});
