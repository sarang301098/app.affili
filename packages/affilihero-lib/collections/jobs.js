import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Jobs = new JobCollection('jobs');

if (Meteor.isServer) {
  Jobs.allow({
    admin(userId, method, params) {
      return params[0].data.user === userId;
    }
  });

  Jobs.events.on('error', (msg) => {
    console.error(msg.error);
  });

  Meteor.startup(function () {
    return Jobs.startJobServer();
  });
}

export default Jobs;
