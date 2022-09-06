import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';

import RouterLink from '../routerLink';

class ProjectSettingsTabs extends Component {

  render() {
    const { router } = this.context;
    const isActive = item => (router.history.location.pathname).indexOf(item) >= 0;

    return (
      <div className="card bg-white border-0">
        <div className="card-header p-0 border-0 bg-white">
          <Nav tabs className="settings-tabs">
            <NavItem>
              <RouterLink to={'/project/' + this.props.projectId + '/edit'} className={isActive('/project/' + this.props.projectId + '/edit') ? 'nav-link active' : 'nav-link'} wrapInLi>
                <FormattedMessage id="general" />
              </RouterLink>
            </NavItem>
            <NavItem>
              <RouterLink to={'/project/' + this.props.projectId + '/products'} className={isActive('/product') ? 'nav-link active' : 'nav-link'} wrapInLi>
                <FormattedMessage id="products" />
              </RouterLink>
            </NavItem>
          </Nav>
        </div>
        {this.props.children}
      </div>
    );
  }
}

ProjectSettingsTabs.propTypes = {
  projectId: PropTypes.string,
  marketPlace: PropTypes.bool
};

ProjectSettingsTabs.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(ProjectSettingsTabs);
