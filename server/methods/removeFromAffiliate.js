import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  removeProjectIdFromAffiliateUser(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    return Meteor.users.update({ "project.id": projectId }, { $pull: { "project": { "id": projectId } } }, { multi: true });
  },
  removeProductIdFromAffiliateUser(productId) {
    check(productId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    return Meteor.users.update({ "product.id": productId }, { $pull: { "product": { "id": productId } } }, { multi: true });
  },
  removeProductsByProjectIdFromAffiliateUser(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'forbidden');
    }

    return Meteor.users.update({ "product.projectId": projectId }, { $pull: { "product": { "projectId": projectId } } }, { multi: true });
  },
});
