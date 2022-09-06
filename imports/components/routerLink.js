import React from 'react';
import PropTypes from 'prop-types';

import { NavLink } from 'react-router-dom';

const RouterLink = ({ to, onClick, children, className }) => (
  <NavLink activeClassName="active" to={to} onClick={onClick} className={className}>{children}</NavLink>
);

RouterLink.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string
};

export default RouterLink;
