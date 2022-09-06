import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const ProductStatistics = new Mongo.Collection('productStatistics');

ProductStatistics.attachSchema(
  new SimpleSchema({
    productId: {
      type: String
    },
    projectId: {
      type: String
    },
    date: {
      type: Date
    },
    visits: {
      type: Number,
      optional: true
    }
  })
);

export default ProductStatistics;
