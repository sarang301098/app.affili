import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const WidgetStatistics = new Mongo.Collection('widgetStatistics');

WidgetStatistics.attachSchema(
  new SimpleSchema({
    widgetId: {
      type: String
    },
    date: {
      type: Date
    },
    visits: {
      type: Number,
      optional: true
    },
    registrations: {
      type: Number,
      optional: true
    },
    completions: {
      type: Number,
      optional: true
    },
    actions: {
      type: Object,
      blackbox: true,
      optional: true
    }
  })
);

export default WidgetStatistics;
