import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Videos = new Mongo.Collection('videos');

Videos.attachSchema(
  new SimpleSchema({
    name: {
      type: String,
      optional: true
    },
    url: {
      type: String,
      optional: true
    },
    embedUrl: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    }
  })
);

export default Videos;
