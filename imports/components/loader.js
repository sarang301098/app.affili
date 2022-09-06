import React from 'react';
import PropTypes from 'prop-types';
import { CopperLoading } from 'respinner';

const Loader = ({ loaded, children }) => loaded ? (
  <div>{children}</div>
) : (
  <div className="loader">
    <CopperLoading stroke="#aaa" gap={5} />
  </div>
);

Loader.propTypes = {
  children: PropTypes.node,
  loaded: PropTypes.bool
};

Loader.defaultProps = {
  children: null,
  loaded: false
};

export default Loader;
