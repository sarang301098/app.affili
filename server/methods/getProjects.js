import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Projects from 'meteor/affilihero-lib/collections/projects';

Meteor.methods({
  getProjects(page, pageSize, searchQuery) {
    check(page, Number);
    check(pageSize, Number);
    check(searchQuery, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId() };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
      search._id = { $in: Meteor.user().projectIds };
    }

    if (searchQuery) {
      search.name = { $regex: searchQuery, $options: 'i' };
    }

    const projects = Projects.find(search, { skip: pageSize * page, limit: pageSize, sort: { createdAt: -1 } }).fetch().map(project => ({
      ...project
    }));

    const count = Projects.find(search).count();

    return {
      isEmpty: !projects.length,
      projects,
      pages: Math.ceil(count / pageSize)
    };
  },
  getProjectById(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId(), _id: projectId };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const project = Projects.findOne(search);

    return project || {};
  },
  getProjectName(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { _id: projectId };

    const projectName = (Projects.findOne(search) || {}).name || '';

    return projectName || '';
  },
  getUsersProjects() {
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const UserProjects = Projects.find({ userId: Meteor.userId() }).fetch() || [];

    const projectOptions = (UserProjects || []).map(option => ({
      value: option._id,
      label: option.name
    }));

    const pushSubscriptionLimits = {};
    (UserProjects || []).forEach((project) => {
      pushSubscriptionLimits[project._id] = project.pushSubscriptionLimit || 0;
    });

    return {
      projectOptions: projectOptions || [],
      pushSubscriptionLimits: pushSubscriptionLimits || {}
    };
  },
  getProjectMarketplaceSettings(projectId) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'No User Found');
    }

    const search = { userId: Meteor.userId(), _id: projectId };

    if (Meteor.user() && Meteor.user().subUser) {
      search.userId = Meteor.user().parentUserId;
    }

    const project = Projects.findOne(search);

    return {
      marketPlaceSettings: project.marketPlaceSettings || {},
      name: project.name || '',
      domainId: project.domainId || '',
      marketPlace: project.marketPlace || false
    };
  }
});
