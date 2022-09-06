import { Meteor } from 'meteor/meteor';
import _ from 'lodash';

import Products from 'meteor/affilihero-lib/collections/products';

Meteor.methods({
  getMarketplaceProductsSlots() {

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const assignedSlotCounts = Products.find({ 'marketPlaceSettings.purchaseAt': { $exists: true } }).count() || 0;
    const marketPlaceSlotsData = (Products.find({ 'marketPlaceSettings.purchaseAt': { $exists: true } }).fetch() || []).map(productData => ({
      _id: productData._id,
      marketPlaceSettings: productData.marketPlaceSettings,
    }));

    // const assignedSlots = _.map(marketPlaceSlotsData, 'slot') || [];
    // const availableSlots = _.difference([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (assignedSlots || [])) || [];
    // const selectedSlot = availableSlots && availableSlots.length ? availableSlots[0] : null;

    return {
      assignedSlotCounts,
      marketPlaceSlotsData: marketPlaceSlotsData || [],
      // assignedSlots,
      // availableSlots
    }
  }
});
