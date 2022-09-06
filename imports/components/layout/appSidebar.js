import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from "meteor/meteor";
import { pure, asymetricSsr } from 'meteor/ssrwpo:ssr';
import { FormattedMessage } from 'react-intl';

import AppFooter from './appFooter';

class AppSidebar extends Component {
  isActive(item) {
    const itemPath = item.path.substr(0, item.path.length - 2);
    return (new RegExp(itemPath)).test(this.context.router.history.location.pathname);
  }

  openSupport(e) {
    e.preventDefault();

    this.props.toggleSidebar();

    zE.activate();
  }

  render() {
    const { loggedIn } = this.props;

    if (Meteor.isServer) {
      return null;
    }

    const navItems = [
      this.props.user.subUser ? null : { title: <FormattedMessage id="dashboard" />, path: '/dashboard', icon: 'fas fa-chart-pie' },
      this.props.user.subUser ? null : { title: 'Kampagnen', path: '/widgets', icon: 'fas fa-share-alt' },
      this.props.user.subUser ? null : { title: 'Pixel', path: '/pixels', icon: 'fas fa-code' },
      { title: <FormattedMessage id="settings" />, path: '/settings', icon: 'fas fa-cog' }
    ];

    if (!loggedIn) {
      return null;
    }

    return (
      <aside className="app-sidebar" style={this.context.router.history.location && this.context.router.history.location.pathname.startsWith('/app-preview') ? { display: 'none' } : null}>
        <nav className="navbar navbar-sidebar" role="navigation">
          <div className={classNames({ 'navbar-collapse': true })}>
            <ul className="nav navbar-nav">
              {navItems.filter(item => !!item).map((nav, i) => (
                <li key={nav.path} className={this.isActive(nav) ? 'active' : null}>
                  <Link to={nav.path} onClick={() => window.innerWidth < 768 ? this.props.toggleSidebar() : {}}>
                    <i className={'fa-fw ' + nav.icon} />
                    <span className="title-hover">{nav.title}</span>
                  </Link>
                </li>
              ))}

              {!this.props.user.subUser ? (
                <li className="d-flex d-md-none">
                  <Link to="/updates" onClick={() => this.props.toggleSidebar()}>
                    <i className="fa-fw far fa-bell" />
                    <span className="title-hover"><FormattedMessage id="updates" /></span>
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </nav>
      </aside>
    );
  }
}

AppSidebar.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default createContainer(() => {
  return {
    user: Meteor.isClient ? Meteor.user() || {} : {},
    loggedIn: Meteor.isClient ? !!Meteor.userId() : false
  };
}, asymetricSsr(AppSidebar));
