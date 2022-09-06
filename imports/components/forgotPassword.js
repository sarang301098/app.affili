import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { pure } from 'meteor/ssrwpo:ssr';
import { FormattedMessage } from 'react-intl';
import { Accounts } from 'meteor/accounts-base';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';

class ForgotPassword extends PureComponent {
  constructor() {
    super();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      email: '',
      loading: false
    };
  }

  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  handleSubmit(e) {
    const { intl } = this.context;

    e.preventDefault();
    this.setState({ loading: true });

    Accounts.forgotPassword({ email: e.target.email.value }, (error) => {
      this.setState({ loading: false });
      if (error) {
        Alert.error(error.reason, {
          position: 'top'
        });
      } else {
        this.setState({ email: '' });
        Alert.success(intl.formatMessage({ id: 'passwordForgotSuccess' }), {
          position: 'top'
        });
      }
    });
  }

  render() {
    const { intl } = this.context;

    return (
      <div className="register d-flex">
        <Helmet title={intl.formatMessage({ id: 'resetPassword' })} />

        <div className="register-content">
          <div className="register-content-inner">
            <div className="card register-box">
              <div className="card-body">
                <div className="my-2 logo" />
                <h1 className="heading h4 text-center pt-2"><FormattedMessage id="resetPassword" /></h1>
                <p className="text-center mb-4 text-muted"><FormattedMessage id="forgotPasswordInfo" /></p>
                <div className="register-body">
                  <fieldset disabled={this.state.loading}>
                    <form onSubmit={this.handleSubmit}>
                      <div className="form-group">
                        <label><FormattedMessage id="email" /></label>
                        <input type="email" name="email" className="form-control" value={this.state.email} onChange={this.handleChange} placeholder={intl.formatMessage({ id: 'yourEmailAddress' })} required />
                      </div>
                      <button type="submit" className="btn btn-primary btn-block mt-4"><FormattedMessage id="submit" /></button>
                    </form>
                  </fieldset>
                </div>
                <div className="mt-4 text-center text-muted">
                  <FormattedMessage id="rememberPassword" /> <Link to="/login"><FormattedMessage id="backToLogin" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ForgotPassword.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default pure(ForgotPassword);
