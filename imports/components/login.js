import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Redirect, Link } from 'react-router-dom';
import Alert from 'react-s-alert';

class Login extends PureComponent {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      loading: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    Alert.closeAll();

    this.setState({ loading: true });

    e.preventDefault();
    const email = e.target.email.value;
    Meteor.loginWithPassword(email, e.target.password.value, (error) => {
      this.setState({ loading: false });

      if (error) {
        let message = error.reason;

        if (message && message.indexOf('User has no password set') > -1) {
          message = 'Dein Account wurde noch nicht aktiviert. Du solltest nach der Bestellung 2 Aktivierungsmails bekommen haben, eine davon für die Software.';
        } else if (message && message.indexOf('Token expired') > -1) {
          message = 'Du hast deinen Account bereits aktiviert. Bitte klicke auf "Einloggen" um dich mit dem gewählten Passwort einzuloggen.';
        }

        Alert.error(message, {
          position: 'top',
          effect: 'bouncyflip',
          html: true,
          timeout: 30000
        });
      } else {
        let redirectAfterLogin;
        try {
          redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
        } catch (ignored) { }

        if (redirectAfterLogin && redirectAfterLogin.length) {
          localStorage.removeItem('redirectAfterLogin');
          this.props.history.push(redirectAfterLogin);
        } else {
          this.props.history.push('/');
        }

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'login'
          }));
        }
      }
    });
  }

  render() {
    const { isLoggedIn, location } = this.props;
    const { intl } = this.context;
    if (isLoggedIn) {
      return <Redirect to={location.state ? location.state.from : '/dashboard'} />;
    }

    return (
      <div className="login register d-flex">
        <Helmet title={intl.formatMessage({ id: 'signIn' })} />

        <div className="register-content">
          <div className="register-content-inner">
            <div className="card register-box">
              <div className="card-body">
                {Meteor.isClient && self.location.hostname !== 'deineapp.io' ? <div className="my-2 logo" style={{ width: 200, margin: '0 auto' }} /> : null}
                <h1 className="heading h4 text-center pt-2"><FormattedMessage id="signIn" /></h1>
                <p className="text-center mb-4 text-muted"><FormattedMessage id="loginInfo" /></p>
                <div className="register-body">
                  <form onSubmit={this.handleSubmit} className="login-form">
                    <div className="form-group">
                      <label htmlFor="inputEmail" className="sr-only"><FormattedMessage id="email" /></label>
                      <input type="email" name="email" id="inputEmail" className="form-control form-control-inverse" value={this.state.email} onChange={this.handleChange} placeholder={intl.formatMessage({ id: 'email' })} autoCorrect="off" spellCheck="false" required autoFocus disabled={this.state.loading} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="inputPassword" className="sr-only"><FormattedMessage id="password" /></label>
                      <input type="password" name="password" id="inputPassword" className="form-control form-control-inverse" placeholder={intl.formatMessage({ id: 'password' })} required disabled={this.state.loading} />
                    </div>
                    <div className="form-meta resetPassword text-right">
                      <Link to="/forgot-password"><FormattedMessage id="resetPassword" /></Link>
                    </div>
                    <button className="btn btn-lg btn-primary btn-block mt-4" type="submit" disabled={this.state.loading}><FormattedMessage id="signIn" /></button>
                  </form>
                </div>
                <div className="mt-4 text-center text-muted">
                  <FormattedMessage id="alreadyHaveAccount" /> <Link to="/register"><FormattedMessage id="register" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Login.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(state => ({ isLoggedIn: state.auth }))(Login);
