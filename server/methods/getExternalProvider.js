import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';

Meteor.methods({
  getExternalProviders() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    const externalProviders = ExternalProviders.find({ userId: Meteor.userId() }).fetch();

    return externalProviders || [];
  }
});
