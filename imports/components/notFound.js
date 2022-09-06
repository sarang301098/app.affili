import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import { pure } from 'meteor/ssrwpo:ssr';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const NotFound = ({ location }, { router, intl }) => {
  if (Meteor.isServer) {
    // eslint-disable-next-line no-param-reassign
    router.staticContext.has404 = true;
  }
  return (
    <div className="not-found error-page text-center mt-3">
      <Helmet title={intl.formatMessage({ id: 'notFound' })} />

      <h2><FormattedMessage id="notFound" /></h2>

      <p className="mt-4">
        <Link to="/" className="font-weight-bold">
          <i className="fa fa-long-arrow-left mr-2" />
          <FormattedMessage id="backToHome" />
        </Link>
      </p>
    </div>
  );
};

NotFound.propTypes = {
  location: PropTypes.object.isRequired,
};

NotFound.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

export default pure(NotFound);
