import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Nav, NavItem } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';

import RouterLink from '../routerLink';

class SettingsTab extends Component {
  render() {
    const { router } = this.context;

    const isActive = item => (router.history.location.pathname).indexOf(item) === 0;

    return (
      <div className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header p-0 border-0 bg-white">
              <Nav tabs className="settings-tabs">

                <NavItem>
                  <RouterLink className="nav-link" to="/settings/profile" wrapInLi>
                    <FormattedMessage id="profile" />
                  </RouterLink>
                </NavItem>

                {Meteor.user() && !Meteor.user().subUser ? (
                  <NavItem>
                    <RouterLink className="nav-link" to="/settings/marketplace" wrapInLi>
                      <FormattedMessage id="marketPlace" />
                    </RouterLink>
                  </NavItem>) : null}

                {Meteor.user() && !Meteor.user().subUser ? (
                  <NavItem>
                    <RouterLink to="/settings/external-providers" className={isActive('/settings/external-provider/') ? 'nav-link active' : 'nav-link'} wrapInLi>
                      <FormattedMessage id="externalProvider" />
                    </RouterLink>
                  </NavItem>) : null}

                <NavItem>
                  <RouterLink className="nav-link" to="/settings/security" wrapInLi>
                    <FormattedMessage id="security" />
                  </RouterLink>
                </NavItem>

                {Meteor.user() && !Meteor.user().subUser ? (
                  <NavItem className="d-app-none">
                    <RouterLink className="nav-link" to="/settings/users" wrapInLi>
                      <FormattedMessage id="customerAccess" />
                    </RouterLink>
                  </NavItem>) : null}

                {Meteor.user() && !Meteor.user().subUser ? (
                  <NavItem>
                    <RouterLink to="/settings/domains" className={isActive('/settings/domain/') ? 'nav-link active' : 'nav-link'} wrapInLi>
                      <FormattedMessage id="domain" />
                    </RouterLink>
                  </NavItem>) : null}

                {Meteor.user() && !Meteor.user().subUser ? (
                  <NavItem className="d-app-none">
                    <RouterLink className="nav-link" to="/settings/plan" wrapInLi>
                      <FormattedMessage id="billing" />
                    </RouterLink>
                  </NavItem>) : null}

              </Nav>
            </div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

SettingsTab.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(SettingsTab);
