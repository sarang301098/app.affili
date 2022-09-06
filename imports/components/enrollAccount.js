import React from 'react';
import PropTypes from 'prop-types';
import ResetPassword from './resetPassword';

const EnrollAccount = ({ match }) => (
  <ResetPassword match={match} enrollment />
);

EnrollAccount.propTypes = {
  token: PropTypes.string
};

export default EnrollAccount;
