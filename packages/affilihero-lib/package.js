Package.describe({
  name: 'affilihero-lib',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.0.1');

  api.use('ecmascript');
  api.use('simonsimcity:job-collection');
  api.use('aldeed:collection2');
  api.use('aldeed:simple-schema');

  api.mainModule('index.js');
});
