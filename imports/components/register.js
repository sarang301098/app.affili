import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { pure } from 'meteor/ssrwpo:ssr';
import { FormattedMessage } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';

const REGISTER_CODE = 'affilihero2021';

class Register extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      success: false,
      loading: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  handleSubmit(e) {
    const { intl } = this.context;

    e.preventDefault();

    this.setState({ loading: true });

    const options = {
      email: e.target.email.value,
      password: e.target.password.value
    };

    if (!options.profile) {
      options.profile = {
        name: options.email.split('@')[0],
        firstName: options.email.split('@')[0],
        lastName: '',
        locale: this.context.intl.locale
      };
    }

    if (e.target.registerCode.value === REGISTER_CODE) {
      Meteor.call('createUserFromClient', options, (error) => {
        if (this._mounted) {
          if (error) {
            this.setState({ loading: false });
            console.error(error);
            Alert.error(error.reason || error.message || error, {
              position: 'top',
              effect: 'bouncyflip'
            });
          } else {
            this.setState({ success: true });

            Meteor.loginWithPassword(options.email, options.password, (err) => {
              this.setState({ success: true, loading: false });
              if (!err) {
                this.props.history.push('/dashboard');
              }
            });
          }
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'enterValidRegisterCode' }), {
        position: 'top',
        effect: 'bouncyflip'
      });
    }
  }

  render() {
    const { intl } = this.context;

    const registerForm = (
      <div>
        <fieldset disabled={this.state.loading}>
          <form onSubmit={this.handleSubmit} className="clearfix">
            <div className="form-group">
              <div>
                <input type="email" name="email" id="email" className="form-control input-lg" placeholder={intl.formatMessage({ id: 'yourEmailAddress' })} required />
              </div>
            </div>
            <div className="form-group">
              <div>
                <input type="password" name="password" id="password" className="form-control input-lg" placeholder={intl.formatMessage({ id: 'yourPassword' })} required />
              </div>
            </div>
            <div className="form-group">
              <div>
                <input type="text" name="registerCode" id="registerCode" className="form-control input-lg" placeholder={intl.formatMessage({ id: 'yourCode' })} required />
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary btn-block btn-lg" type="submit"><FormattedMessage id="register" /></button>
            </div>
          </form>
        </fieldset>
      </div>
    );

    const successMessage = (
      <div className="text-center">
        <p><i className="fa-5x pe-7s-check text-success" /></p>
        <p className="text text-success lead"><FormattedMessage id="registerSuccess" /></p>
      </div>
    );

    const content = this.state.success ? successMessage : registerForm;

    return (
      <div className="register d-flex">
        <Helmet title="Registrieren" />
        <div className="register-content">
          <div className="register-content-inner">
            <div className="card register-box">
              <div className="card-body">
                <div className="my-2 logo" />
                <h1 className="heading h4 text-center pt-2"><FormattedMessage id="registerForFree" /></h1>
                <p className="text-center mb-4 text-muted"><FormattedMessage id="registerInfo" /></p>
                <div className="register-body">
                  {content}
                </div>
                <div className="mt-4 text-center text-muted">
                  <FormattedMessage id="alreadyHaveAccount" /> <Link to="/login"><FormattedMessage id="signIn" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Register.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default pure(Register);
