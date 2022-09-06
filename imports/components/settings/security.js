import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Accounts } from 'meteor/accounts-base';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';

import SettingsTab from './settingsTab';

class SecuritySettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      oldPassword: '',
      newPassword: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Manage the SubmitButton Press
   */
  handleSubmit(e) {
    const { intl } = this.context;

    e.preventDefault();

    Accounts.changePassword(this.state.oldPassword, this.state.newPassword, (err) => {
      if (err) {
        Alert.error(err.reason);
      } else {
        this.setState({ oldPassword: '', newPassword: '' });
        Alert.success(intl.formatMessage({ id: 'passwordChanged' }));
      }
    });
  }

  /**
   * Manage the state Change
   */
  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <SettingsTab>
        <React.Fragment>
        <Helmet title="Security" />
          <fieldset>
            <form onSubmit={this.handleSubmit} className="form-horizontal">
              <div className="card-body mt-3">
                <div className="form-group row">
                  <label className="control-label col-md-3 text-md-right"><FormattedMessage id="oldPassword" /></label>
                  <div className="col-md-5">
                    <input type="password" name="oldPassword" className="form-control" value={this.state.oldPassword} onChange={this.handleChange} required />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="control-label col-md-3 text-md-right"><FormattedMessage id="newPassword" /></label>
                  <div className="col-md-5">
                    <input type="password" name="newPassword" className="form-control" value={this.state.newPassword} onChange={this.handleChange} required />
                  </div>
                </div>
              </div>
              <div className="card-footer text-right">
                <button type="submit" className="btn btn-primary"><FormattedMessage id="changePassword" /></button>
              </div>
            </form>
          </fieldset>
        </React.Fragment>
      </SettingsTab>
    );
  }
}

SecuritySettings.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default SecuritySettings;
