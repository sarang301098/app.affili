import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Plans = new Mongo.Collection('plans');

Plans.attachSchema(
  new SimpleSchema({
    name: {
      type: String,
      optional: true
    },
    addon: {
      type: Boolean,
      optional: true
    },
    monthlyCost: {
      type: Number,
      decimal: true,
      optional: true
    },
    yearlyCost: {
      type: Number,
      decimal: true,
      optional: true
    },
    onetimeCost: {
      type: Number,
      decimal: true,
      optional: true
    },
    visible: {
      type: Boolean,
      optional: true
    },
    defaultPlan: {
      type: Boolean,
      optional: true
    },
    maximumWidgets: {
      type: Number,
      optional: true
    },
    templates: {
      type: Boolean,
      optional: true
    },
    digistore24ProductIds: {
      type: [String],
      optional: true
    },
    maximumProjects: {
      type: Number,
      optional: true
    },
    maximumToplists: {
      type: Number,
      optional: true
    },
    maximumSubUsers: {
      type: Number,
      optional: true
    }
  })
);

export default Plans;
