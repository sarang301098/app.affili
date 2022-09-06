import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect, withRouter, Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import pick from 'lodash/pick';
import { connect } from 'react-redux';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import moment from 'moment';
import 'moment/locale/de';
import numeral from 'numeral';
import 'numeral/locales/de';
import { pure, asymetricSsr } from 'meteor/ssrwpo:ssr';
import Alert from 'react-s-alert';
import { Tracker } from 'meteor/tracker';
import { createContainer } from 'meteor/react-meteor-data';

import Plans from 'meteor/affilihero-lib/collections/plans';

import scrollTopSmooth from '../utils/scrollTopSmooth';
import withDragDropContext from '../components/withDragDropContext';

// Components
import Register from '../components/register';
import EnrollAccount from '../components/enrollAccount';
import ForgotPassword from '../components/forgotPassword';
import ResetPassword from '../components/resetPassword';
import Login from '../components/login';
import NotFound from '../components/notFound';
import Loader from '../components/loader';
import Dashboard from '../components/dashboard';
import ProfileSettings from '../components/settings/profile';
import SecuritySettings from '../components/settings/security';
import PlanSettings from '../components/settings/plan';
import DomainsSettings from '../components/settings/domains';
import DomainSettings from '../components/settings/domains/edit';
import ExternalProviders from '../components/settings/externalProviders';
import SubUsers from '../components/settings/subUsers';
import EditExternalProvider from '../components/settings/externalProviders/edit';
import MarketPlaceProfileSettings from '../components/settings/marketplaceProfile';
import AppFooter from '../components/layout/appFooter';
import AppHeader from '../components/layout/appHeader';
import EditProduct from '../components/products/edit';
import ListProducts from '../components/products/index';
import EditProject from '../components/projects/edit';
import ListProject from '../components/projects/index';
import EditToplist from '../components/topList/edit';
import ListToplist from '../components/topList/index';
import AcceptAffiliate from '../components/products/AcceptAffiliate';
import DesignEditorProject from '../components/products/designEditorProject';
import MarketplaceSetting from '../components/products/marketplaceSetting';
import AffiliateManagers from '../components/affiliateManagers/index';
import SingleAffiliateManager from '../components/affiliateManagers/edit';

const checkLocationHash = () => {
  let target = 0;

  if (location.hash && location.hash.length) {
    const element = document.querySelector(location.hash);
    if (element) {
      target = element.offsetTop;
    }
  }

  target -= 61 - (96 - 61); // navbar height

  scrollTopSmooth(target, 200);
};

const AppContent = pure(asymetricSsr(createContainer(({ match }) => {
  const sub = Meteor.subscribe('userData');
  Meteor.subscribe('userPlan');
  return {
    user: Meteor.user(),
    plan: Meteor.user() && Meteor.user().plan ? Plans.findOne(Meteor.user().plan.id) : null,
    loaded: sub.ready()
  };
}, ({ children, path, loaded }) => {
  if (!Meteor.loggingIn() && !Meteor.userId() && path.indexOf('/login') < 0 && path.indexOf('/forgot-password') < 0 && path.indexOf('/reset-password') < 0 && path.indexOf('/enroll-account') < 0 && path.indexOf('/register') < 0 && path.indexOf('/affiliateManagers') < 0) {
    try {
      localStorage.setItem('redirectAfterLogin', path);
    } catch (e) { }
    return <Redirect to={'/login'} />;
  }

  if (!loaded) {
    return (
      <div className="app-content">
        <Loader />
      </div>
    );
  }

  if (Meteor.user() && !Meteor.user().subUser && !(Meteor.user().plan || {}).active && path.indexOf('/settings') < 0) {
    return (
      <React.Fragment>
        <div className="app-content text-center d-block">
          <iframe src="https://google.com/" className="restricted-iframe" />
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className={path === '/register' ? 'app-content auth-app-content' : 'app-content'}>
      <div className="app-content-inner">
        {children}
      </div>
    </div>
  );
}, () => (
  <div className="app-content">
    <Loader />
  </div>
))));

class MainApp extends PureComponent {
  constructor(props, context) {
    super(props, context);

    const { userLocale: lang } = props;

    this.state = {
      hasError: false,
      showSidebar: Meteor.isClient && (window.innerWidth || screen.width) >= 768,
      showDataProcessingModal: false,
      nightMode: Meteor.isClient && (window.location.search || '').indexOf('nightMode=true') > -1
    };

    if (Meteor.isClient) {
      window.nightMode = this.state.nightMode;

      checkLocationHash();

      // simpleschema locale
      if (lang === 'de') {
        SimpleSchema.messages({
          required: '[label] ist erforderlich',
          minString: '[label] muss mindestens [min] Buchstaben enthalten',
          maxString: '[label] kann nicht mehr als [max] Buchstaben haben',
          minNumber: '[label] muss mindestens [min] sein',
          maxNumber: '[label] darf nicht mehr als [max] sein',
          minNumberExclusive: '[label] muss grösser als [min] sein',
          maxNumberExclusive: '[label] muss kleiner als [max] sein',
          minDate: '[label] muss am oder nach dem [min] sein',
          maxDate: '[label] darf nicht nach dem [max] sein',
          badDate: '[label] ist kein valides Datum',
          minCount: 'Sie müssen mindestens [minCount] Werte angeben',
          maxCount: 'Sie können nicht mehr als [maxCount] Werte angeben',
          noDecimal: '[label] muss eine Ganzzahl sein',
          notAllowed: '[value] ist ein nicht erlaubter Wert',
          expectedString: '[label] muss eine Buchstabenkette sein',
          expectedNumber: '[label] muss eine Nummer sein',
          expectedBoolean: '[label] muss ein Wahrheitswert sein',
          expectedArray: '[label] muss ein Array sein',
          expectedObject: '[label] muss ein Objekt sein',
          expectedConstructor: '[label] muss von Type [type] sein',
          keyNotInSchema: '[key] ist vom Schema nicht erlaubt',
          regEx: [
            {
              msg: '[label] ist durch den Regulären Ausdruck gefallen'
            },
            {
              exp: SimpleSchema.RegEx.Email,
              msg: '[label] muss eine valide Email Adresse sein'
            },
            {
              exp: SimpleSchema.RegEx.WeakEmail,
              msg: '[label] muss eine valide Email Adresse sein'
            },
            {
              exp: SimpleSchema.RegEx.Domain,
              msg: '[label] muss eine valide Domain sein'
            },
            {
              exp: SimpleSchema.RegEx.WeakDomain,
              msg: '[label] muss eine valide Domain sein'
            },
            {
              exp: SimpleSchema.RegEx.IP,
              msg: '[label] muss eine IPv4 oder IPv6 Adresse sein'
            },
            {
              exp: SimpleSchema.RegEx.IPv4,
              msg: '[label] muss eine valide IPv4 Adresse sein'
            },
            {
              exp: SimpleSchema.RegEx.IPv6,
              msg: '[label] muss eine valide IPv6 Adresse sein'
            },
            {
              exp: SimpleSchema.RegEx.Url,
              msg: '[label] muss eine valide URL sein'
            },
            {
              exp: SimpleSchema.RegEx.Id,
              msg: '[label] muss eine valide alphanumerische ID sein'
            }
          ]
        });
      } else {
        SimpleSchema.messages({
          required: '[label] is required',
          minString: '[label] must be at least [min] characters',
          maxString: '[label] cannot exceed [max] characters',
          minNumber: '[label] must be at least [min]',
          maxNumber: '[label] cannot exceed [max]',
          minDate: '[label] must be on or after [min]',
          maxDate: '[label] cannot be after [max]',
          badDate: '[label] is not a valid date',
          minCount: 'You must specify at least [minCount] values',
          maxCount: 'You cannot specify more than [maxCount] values',
          noDecimal: '[label] must be an integer',
          notAllowed: '[value] is not an allowed value',
          expectedString: '[label] must be a string',
          expectedNumber: '[label] must be a number',
          expectedBoolean: '[label] must be a boolean',
          expectedArray: '[label] must be an array',
          expectedObject: '[label] must be an object',
          expectedConstructor: '[label] must be a [type]',
          keyNotInSchema: '[key] is not allowed by the schema',
          regEx: [
            { msg: '[label] failed regular expression validation' },
            { exp: SimpleSchema.RegEx.Email, msg: '[label] must be a valid e-mail address' },
            { exp: SimpleSchema.RegEx.WeakEmail, msg: '[label] must be a valid e-mail address' },
            { exp: SimpleSchema.RegEx.Domain, msg: '[label] must be a valid domain' },
            { exp: SimpleSchema.RegEx.WeakDomain, msg: '[label] must be a valid domain' },
            { exp: SimpleSchema.RegEx.IP, msg: '[label] must be a valid IPv4 or IPv6 address' },
            { exp: SimpleSchema.RegEx.IPv4, msg: '[label] must be a valid IPv4 address' },
            { exp: SimpleSchema.RegEx.IPv6, msg: '[label] must be a valid IPv6 address' },
            { exp: SimpleSchema.RegEx.Url, msg: '[label] must be a valid URL' },
            { exp: SimpleSchema.RegEx.Id, msg: '[label] must be a valid alphanumeric ID' }
          ]
        });
      }

      const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Version)/i.test(navigator.userAgent);
      if (window.ReactNativeWebView || isWebView) {
        const style = document.createElement('style');
        style.innerHTML = `
        .d-app-none, .zEWidget-launcher { display: none !important; }
        `;
        document.head.appendChild(style);
      }
    }

    // set moment.js locale
    moment.locale(lang);

    // set numeral locale
    numeral.locale(lang);
  }

  componentDidMount() {
    if (Meteor.isClient) {
      Tracker.autorun((computation) => {
        if (Meteor.user() && Meteor.user().profile && Meteor.user().emails && Meteor.user().emails.length) {
          if (Meteor.user().createdAt) {
            computation.stop();
          }

          if (window.zE) {
            zE(() => {
              zE.identify({
                name: Meteor.user().profile.name,
                email: Meteor.user().emails[0].address,
                organization: 'AffiliHero'
              });
            });
          }
        }

        if (Meteor.user() && Meteor.user().subUser) {
          this.setState({ subUser: true });
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      // checkLocationHash();
      window.scrollTo(0, 0);
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    const { history } = this.props;
    const { intl } = this.context;
    const { hasError, error, errorInfo, subUser } = this.state;

    const routes = [
      {
        exact: true,
        path: '/',
        redirect: '/dashboard'
      },
      {
        exact: true,
        path: '/register',
        component: Register
      },
      {
        exact: true,
        path: '/forgot-password',
        component: ForgotPassword
      },
      {
        exact: true,
        path: '/reset-password/:token',
        component: ResetPassword
      },
      {
        exact: true,
        path: '/enroll-account/:token',
        component: EnrollAccount
      },
      {
        exact: true,
        path: '/login',
        component: Login
      },
      {
        exact: true,
        path: '/dashboard',
        component: Dashboard
      },
      {
        exact: true,
        path: '/settings',
        redirect: '/settings/external-providers'
      },
      {
        exact: true,
        path: '/settings/profile',
        component: ProfileSettings
      },
      {
        exact: true,
        path: '/settings/plan',
        component: PlanSettings
      },
      {
        exact: true,
        path: '/settings/external-providers',
        component: ExternalProviders
      },
      {
        exact: true,
        path: '/settings/external-provider/:id',
        component: EditExternalProvider
      },
      {
        exact: true,
        path: '/settings/security',
        component: SecuritySettings
      },
      {
        exact: true,
        path: '/settings/marketplace',
        component: MarketPlaceProfileSettings
      },
      {
        exact: true,
        path: '/settings/domains',
        component: DomainsSettings
      },
      {
        exact: true,
        path: '/settings/domain/:id',
        component: DomainSettings
      },
      {
        exact: true,
        path: '/settings/users',
        component: SubUsers
      },
      {
        exact: true,
        path: '/product/:id',
        component: EditProduct
      },
      {
        exact: true,
        path: '/products',
        component: ListProducts
      },
      {
        exact: true,
        path: '/project/:id/edit',
        component: EditProject
      },
      {
        exact: true,
        path: '/projects',
        component: ListProject
      },
      {
        exact: true,
        path: '/project/:projectId/toplist/:id',
        component: EditToplist
      },
      {
        exact: true,
        path: '/project/:projectId/toplists',
        component: ListToplist
      },
      {
        exact: true,
        path: '/project/:projectId/product/:productId/toplist/:id',
        component: EditToplist
      },
      {
        exact: true,
        path: '/project/:projectId/product/:productId/toplists',
        component: ListToplist
      },
      {
        exact: true,
        path: '/project/:projectId/product/:id/edit',
        component: EditProduct
      },
      {
        exact: true,
        path: '/project/:projectId/products',
        component: ListProducts
      },
      {
        exact: true,
        path: '/project/:projectId/product/:productId/AffiliateAccess',
        component: AcceptAffiliate
      },
      {
        exact: true,
        path: '/project/:projectId/product/:productId/marketplace',
        component: MarketplaceSetting
      },
      {
        exact: true,
        path: '/project/:projectId/product/:productId/designEditor',
        component: DesignEditorProject
      },
      {
        exact: true,
        path: '/affiliateManagers',
        component: AffiliateManagers
      },
      {
        exact: true,
        path: '/affiliateManagers/:id',
        component: SingleAffiliateManager
      },
    ];

    return (
      <div>
        <Helmet
          defaultTitle={'AffiliHero'}
          titleTemplate={'%s - ' + 'AffiliHero'}
        >
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />

          <link rel="icon" type="image/png" sizes="128x128" href={'/images/favicon.png'} />

          <meta name="robots" content="noindex, nofollow" />

          <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700" rel="stylesheet" />
        </Helmet>

        <div className={'app' + (this.state.nightMode ? ' night-mode' : '')}>
          <div className="app-container">
            <AppHeader />

            {this.state.hasError ? (
              <div className="page-wrapper">
                <div className="container-fluid p-3 mb-5">

                  <div className="row page-titles">
                    <div className="col-md-5 align-self-center"><h3>Fehler</h3></div>
                  </div>
                  <div className="card p-3">
                    <div>
                      <h3 className="text-danger mb-3"><i className="fa fa-exclamation-triangle mr-2" /> Oooops - Es ist ein unerwarteter Fehler aufgetreten</h3>
                    </div>
                    <div className="mt-3">
                      <p className="mb-4">Kein Grund zur Panik! Bitte melde dich bei unserem Support mit den folgenden Fehler Details. Wir werden uns umgehend um die Behebung kümmern.</p>
                      <p className="pt-3"><strong className="text-dark">Fehler Details:</strong></p>
                      <div className="pl-3">
                        {error ? (
                          <div>
                            <pre><code>{error.toString()}</code></pre>
                            <pre><code>{error.stack}</code></pre>
                          </div>
                        ) : null}
                        {errorInfo && errorInfo.componentStack ? (
                          <div>
                            <pre><code>{errorInfo.componentStack}</code></pre>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="app-footer bg-white">
                    <AppFooter />
                  </div>
                </div>
                <Alert stack={{ limit: 3 }} position="bottom-right" effect="slide" />
              </div>
            ) : (
              <React.Fragment>
                <AppContent path={history.location.pathname} showDataProcessingModal={this.state.showDataProcessingModal} toggleDataProcessingModal={() => this.setState({ showDataProcessingModal: !this.state.showDataProcessingModal })} subUser={subUser} >
                  <Switch>
                    {routes.map((route, i) => {
                      if (route.redirect) {
                        return (
                          <Route key={i} exact={route.exact} path={route.path} render={() => <Redirect to={route.redirect} />} />
                        );
                      }
                      return (
                        <Route key={i} {...route} exact={route.exact} path={route.path} />
                      );
                    })}

                    <Route component={NotFound} />
                  </Switch>

                </AppContent>
                <div className="app-footer bg-white">
                  <AppFooter subUser={subUser} />
                </div>
              </React.Fragment>
            )}
          </div>
          <Alert stack={{ limit: 3 }} />
        </div>

      </div>
    );
  }
}

MainApp.propTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired
};

MainApp.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default withDragDropContext(withRouter(connect(
  state => pick(state, ['intl', 'user', 'userLocale', 'isIntlInitialised']),
)(MainApp)));
