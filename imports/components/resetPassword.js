import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Accounts } from 'meteor/accounts-base';
import { FormattedMessage } from 'react-intl';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

class ResetPassword extends PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      loading: false,
      password: '',
      passwordConfirmation: ''
    };
  }

  getSearchParameters() {
    const prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr !== '' ? this.transformToAssocArray(prmstr) : {};
  }

  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  transformToAssocArray(prmstr) {
    const params = {};
    const prmarr = prmstr.split('&');
    for (let i = 0; i < prmarr.length; i += 1) {
      const tmparr = prmarr[i].split('=');
      params[tmparr[0]] = tmparr[1];
    }
    return params;
  }

  handleSubmit(e) {
    const { match } = this.props;
    const { intl } = this.context;

    e.preventDefault();

    if (!this.state.password || this.state.password !== this.state.passwordConfirmation) {
      Alert.error(intl.formatMessage({ id: 'passwordsDontMatch' }));
    } else {
      this.setState({ loading: true });
      Accounts.resetPassword(match.params.token, this.state.password, (error) => {
        this.setState({ loading: false });
        if (error) {
          Alert.error(error.reason, {
            position: 'bottom'
          });
        } else {
          this.setState({
            password: '',
            passwordConfirmation: ''
          });

          this.props.history.push('/');

          Alert.success(intl.formatMessage({ id: 'passwordResetSuccess' }), {
            position: 'bottom',
            timeout: 10000
          });
        }
      });
    }
  }

  render() {
    const { enrollment } = this.props;
    const { intl } = this.context;

    return (
      <div className="login register d-flex">
        <Helmet title={intl.formatMessage({ id: enrollment ? 'enrollAccount' : 'resetPassword' })} />

        <div className="register-content">
          <div className="register-content-inner">
            <div className="card register-box">
              <div className="card-body">
                {Meteor.isClient && self.location.hostname !== 'deineapp.io' ? <div className="mb-5 logo" style={{ width: 200, margin: '0 auto' }} /> : null}
                <h3 className="heading h4 text-center pt-2">{intl.formatMessage({ id: enrollment ? 'enrollAccount' : 'resetPassword' })}</h3>
                <p className="text-center mb-4 text-muted">Hi! Please enter your login information below to send submissions as contacts.</p>
                <div className="register-body">
                  <fieldset disabled={this.state.loading}>
                    <form onSubmit={this.handleSubmit} className="login-form">
                      <div className="form-group">
                        <label htmlFor="password" className="sr-only"><FormattedMessage id="newPassword" /></label>
                        <input type="password" name="password" id="password" value={this.state.password} onChange={this.handleChange} placeholder={intl.formatMessage({ id: 'enterPassword' })} className="form-control form-control-inverse" required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="passwordConfirmation" className="sr-only"><FormattedMessage id="confirmNewPassword" /></label>
                        <input type="password" name="passwordConfirmation" id="passwordConfirmation" value={this.state.passwordConfirmation} placeholder={intl.formatMessage({ id: 'confirmPassword' })} onChange={this.handleChange} className="form-control form-control-inverse" required />
                      </div>
                      <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block"><FormattedMessage id="submit" /></button>
                      </div>
                    </form>
                  </fieldset>
                  <br />
                  <p><Link to="/login"><i className="fa fa-long-arrow-left" /> <FormattedMessage id="backToLogin" /></Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  match: PropTypes.object,
  enrollment: PropTypes.bool
};

ResetPassword.defaultProps = {
  match: {},
  enrollment: false
};

ResetPassword.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default ResetPassword;
