import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import sumBy from 'lodash/sumBy';
import moment from 'moment/moment';

import Projects from 'meteor/affilihero-lib/collections/projects';
import ProjectStatistics from 'meteor/affilihero-lib/collections/projectStatistics';
import ProductStatistics from 'meteor/affilihero-lib/collections/productStatistics';

Meteor.methods({
  getDashboardProjectStatistics: async function (startDate, endDate, todayStart) {
    check(startDate, Date);
    check(endDate, Date);
    check(todayStart, Date);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
      search._id = { $in: Meteor.user().projectIds };
    }

    const projects = Projects.find(search).fetch();
    const projectIds = projects.map(p => p._id);

    const stats30Days = ProjectStatistics.find({ projectId: { $in: projectIds }, date: { $gte: startDate } }).fetch();

    return {
      hasProjects: projects.length > 0,
      startDate,
      endDate,
      ProjectStatistics: ProjectStatistics.find({ projectId: { $in: projectIds }, date: { $gte: startDate, $lte: endDate } }).fetch(),
      visitsToday: sumBy(ProjectStatistics.find({ projectId: { $in: projectIds }, date: { $gte: todayStart } }).fetch(), 'visits') || 0,
      visitsYesterday: sumBy(ProjectStatistics.find({ projectId: { $in: projectIds }, date: { $gte: moment(todayStart).subtract(1, 'days').toDate(), $lt: todayStart } }).fetch(), 'visits') || 0,
      visits7Days: sumBy(ProjectStatistics.find({ projectId: { $in: projectIds }, date: { $gte: moment().subtract(7, 'days').startOf('day').utc().toDate() } }).fetch(), 'visits') || 0,
      visits30Days: sumBy(stats30Days, 'visits') || 0,
    };
  },
  getDashboardProductStatistics: async function (startDate, endDate, todayStart) {
    check(startDate, Date);
    check(endDate, Date);
    check(todayStart, Date);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Forbidden');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
      search._id = { $in: Meteor.user().projectIds };
    }

    const projects = Projects.find(search).fetch();
    const projectIds = projects.map(p => p._id);

    const stats30Days = ProductStatistics.find({ projectId: { $in: projectIds }, date: { $gte: startDate } }).fetch();

    return {
      hasProjects: projects.length > 0,
      startDate,
      endDate,
      ProductStatistics: ProductStatistics.find({ projectId: { $in: projectIds }, date: { $gte: startDate, $lte: endDate } }).fetch(),
      visitsToday: sumBy(ProductStatistics.find({ projectId: { $in: projectIds }, date: { $gte: todayStart } }).fetch(), 'visits') || 0,
      visitsYesterday: sumBy(ProductStatistics.find({ projectId: { $in: projectIds }, date: { $gte: moment(todayStart).subtract(1, 'days').toDate(), $lt: todayStart } }).fetch(), 'visits') || 0,
      visits7Days: sumBy(ProductStatistics.find({ projectId: { $in: projectIds }, date: { $gte: moment().subtract(7, 'days').startOf('day').utc().toDate() } }).fetch(), 'visits') || 0,
      visits30Days: sumBy(stats30Days, 'visits') || 0,
    };
  }
});
