import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { pure, changeLanguage, valueSet } from 'meteor/ssrwpo:ssr';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import pick from 'lodash/pick';
import * as Cookies from 'js-cookie';

const AppFooter = ({ userLocale, languageChanger, subUser }, { router }) => {
  const setLocale = (e, locale) => {
    e.preventDefault();

    const oldLocale = userLocale;

    languageChanger(locale);

    Cookies.set('locale', locale);

    if (Meteor.userId()) {
      Meteor.users.update(Meteor.userId(), {
        $set: {
          'profile.locale': locale
        }
      });
    }

    router.history.push(router.history.location.pathname.replace('/' + oldLocale, '/' + locale));
  };

  return (
    <footer className="border-top">
      <div className="container-fluid">
        <div className="footer text-center d-flex justify-content-end">
          <div className="px-2">
            <a href="#" onClick={e => setLocale(e, 'en')}>EN</a>
          </div>
          <div className="px-2">
            <a href="#" onClick={e => setLocale(e, 'de')}>DE</a>
          </div>
          <div className="pl-2"><FormattedMessage id="copyright" /> &copy; Affilihero.io</div>
        </div>
      </div>
    </footer>
  );
};

AppFooter.propTypes = {
  userLocale: PropTypes.string.isRequired,
  languageChanger: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

AppFooter.contextTypes = {
  router: PropTypes.object,
  intl: PropTypes.object.isRequired
};

export default connect(
  state => pick(state, ['intl', 'userLocale', 'isIntlInitialised']),
  dispatch => ({
    languageChanger(locale) {
      dispatch(valueSet('userLocale', locale));
      dispatch(changeLanguage({ locale }));
    },
  }),
)(pure(AppFooter));
