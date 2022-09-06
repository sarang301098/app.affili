import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

class SettingsMenu extends Component {
  render() {
    return (
      <div>
        <div className="content">
          <div className="container-fluid">
            <div className="page-header">
              <h1 className="h5 m-0"><FormattedMessage id="settings" /></h1>
            </div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

SettingsMenu.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default SettingsMenu;
