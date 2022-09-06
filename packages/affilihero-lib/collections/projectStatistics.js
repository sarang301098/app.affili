import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const ProjectStatistics = new Mongo.Collection('projectStatistics');

ProjectStatistics.attachSchema(
  new SimpleSchema({
    projectId: {
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

export default ProjectStatistics;
