import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom/server';

import Plans from 'meteor/affilihero-lib/collections/plans';

import md5 from '../../imports/utils/md5';
import EmailLayout from '../../imports/components/layout/emailLayout';
import tagActiveCampaign from '../utils/tagActiveCampaign';

const emailText = (lines, locale, name) => {
  let text = name && name.length ? ('Hallo ' + name) : 'Hallo';
  text += '\n\n';
  text += lines.map(line => line + '\n\n');
  text += 'Beste Grüße';
  text += '\n';
  text += 'Dein AffiliHero Team';
  return text;
};

Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: false,
  loginExpirationInDays: 365,
  passwordResetTokenExpirationInDays: 90,
  passwordEnrollTokenExpirationInDays: 365,
});

Accounts.emailTemplates.siteName = 'AffiliHero';
Accounts.emailTemplates.from = 'AffiliHero <support@affilihero.io>';

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    const locale = user.profile.locale || 'de';
    return 'Passwort zurücksetzen';
  },
  html(user, url) {
    const locale = user.profile.locale || 'de';
    const token = url.substring(url.lastIndexOf('/') + 1, url.length);
    const actualUrl = Meteor.absoluteUrl('reset-password/' + token);
    const text = (
      <div>
        <p>bitte klicke auf den folgenden Link, um dein Passwort für AffiliHero zurückzusetzen:</p>
        <p><a href={actualUrl}>{actualUrl}</a></p>
        <p>Wenn du keine Zurücksetzung des Passworts angefordert hast, kannst du diese E-Mail einfach ignorieren.</p>
      </div>
    );
    return ReactDOM.renderToStaticMarkup(<EmailLayout body={text} name={user.profile.firstName} locale={locale} />);
  },
  text(user, url) {
    const locale = user.profile.locale || 'de';
    const token = url.substring(url.lastIndexOf('/') + 1, url.length);
    const actualUrl = Meteor.absoluteUrl('reset-password/' + token);
    return emailText([
      'bitte klicke auf den folgenden Link, um dein Passwort für AffiliHero zurückzusetzen:',
      actualUrl,
      'Wenn du keine Zurücksetzung des Passworts angefordert hast, kannst du diese E-Mail einfach ignorieren.'
    ], locale, user.profile.firstName);
  }
};


Accounts.emailTemplates.enrollAccount = {
  subject(user) {
    const locale = user.profile.locale || 'de';
    return 'Dein AffiliHero Account';
  },
  html(user, url) {
    const locale = user.profile.locale || 'de';
    const token = url.substring(url.lastIndexOf('/') + 1, url.length);
    const actualUrl = Meteor.absoluteUrl('enroll-account/' + token) + '?email=' + ((user.emails || [{}])[0].address || '');
    const text = (
      <div>
        <p>klicke auf den folgenden Link, um deinen Account zu aktivieren:</p>
        <p><a href={actualUrl}>{actualUrl}</a></p>
      </div>
    );

    return ReactDOM.renderToStaticMarkup(<EmailLayout body={text} name={user.profile.firstName} locale={locale} />);
  },
  text(user, url) {
    const locale = user.profile.locale || 'de';
    const token = url.substring(url.lastIndexOf('/') + 1, url.length);
    const actualUrl = Meteor.absoluteUrl('enroll-account/' + token);
    return emailText([
      'klicke auf den folgenden Link, um deinen Account zu aktivieren:',
      actualUrl,
    ], locale, user.profile.firstName);
  }
};

Accounts.onCreateUser((options, userParam) => {
  const user = Object.assign({
    profile: options.profile
  }, userParam);

  user.marketPlace = true;

  if (!user.profile) {
    user.profile = {};
  }

  if (!user.plan) {
    const defaultPlan = Plans.findOne({ name: 'Starter' });
    if (defaultPlan) {
      user.plan = {
        id: defaultPlan._id,
        active: true //Meteor.isDevelopment // will be updated to 'true' later
      };
    }
  }

  if (!user.profile.name) {
    if (user.profile.firstName && user.profile.lastName) {
      user.profile.name = user.profile.firstName + ' ' + user.profile.lastName;
    } else if (user.emails && user.emails[0] && user.emails[0].address) {
      const emailAddress = user.emails[0].address;
      const atSignIndex = emailAddress.indexOf('@');
      if (emailAddress > -1) {
        user.profile.name = emailAddress.substr(0, atSignIndex);
      }
    }
  }

  if (user.emails && user.emails[0] && user.emails[0].address) {
    /*
    try {
      tagActiveCampaign(user.emails[0].address, 'register');
    } catch (err) {
      console.error(err);
    }
    */

    user.profile.picture = 'https://www.gravatar.com/avatar/' + md5(user.emails[0].address) + '/picture/?type=large';
  }

  if (options.subUser) {
    user.subUser = true;
    user.parentUserId = options.parentUserId;
  }

  return user;
});

Meteor.users.allow({
  update(userId, doc, _, update) {
    return (doc.subUser && doc.parentUserId === userId);
  },
  remove(userId, doc) {
    return (doc.subUser && doc.parentUserId === userId);
  }
});
