import { Meteor } from 'meteor/meteor';

import Plans from 'meteor/affilihero-lib/collections/plans';
import Videos from 'meteor/affilihero-lib/collections/videos';

Meteor.startup(() => {
  const plans = [
    {
      name: 'Starter',
      yearlyCost: 299,
      defaultPlan: false,
      maximumProjects: 8,
      maximumProducts: 32,
      maximumToplists: 64,
      maximumSubUsers: 3,
      visible: false
    }
  ];

  const videos = [
    {
      name: 'ProductVideo1',
      url: 'https://youtu.be/KO4xEQ3--OI',
      embedUrl: 'https://www.youtube.com/embed/KO4xEQ3--OI',
      type: 'youtube'
    },
    {
      name: 'ProductVideo2',
      url: 'https://youtu.be/-FmWuCgJmxo',
      embedUrl: 'https://www.youtube.com/embed/-FmWuCgJmxo',
      type: 'youtube'
    },
    {
      name: 'ProductVideo3',
      url: 'https://youtu.be/dCNADdUslu0',
      embedUrl: 'https://www.youtube.com/embed/dCNADdUslu0',
      type: 'youtube'
    },
    {
      name: 'ProductVideo4',
      url: 'https://youtu.be/CwzjlmBLfrQ',
      embedUrl: 'https://www.youtube.com/embed/CwzjlmBLfrQ',
      type: 'youtube'
    },
    {
      name: 'ProductVideo5',
      url: 'https://vimeo.com/22439234',
      embedUrl: 'https://player.vimeo.com/video/22439234',
      type: 'vimeo'
    }
  ];

  plans.forEach((plan) => {
    const planAlreadyExists = typeof Plans.findOne({ name: plan.name }) === 'object';

    if (!planAlreadyExists) {
      Plans.insert(plan);
    } else {
      Plans.update({ name: plan.name }, { $set: plan });
    }
  });

  videos.forEach((video) => {
    const videoAlreadyExist = typeof Videos.findOne({ name: video.name }) === 'object';

    if (!videoAlreadyExist) {
      Videos.insert(video);
    } else {
      Videos.update({ name: video.name }, { $set: video });
    }
  });
});
