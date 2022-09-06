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
      <React.Fragment>
        <Nav className="nav-pills settings-tabs product-settings-tabs">

          <NavItem>
            <RouterLink to={'/project/' + this.props.projectId + '/product/' + this.props.productId + '/edit'} className={isActive('/product/' + this.props.productId + '/edit') ? 'nav-link active' : 'nav-link'} wrapInLi>
              <FormattedMessage id="general" />
            </RouterLink>
          </NavItem>
          {!(this.props.create) ?
            <React.Fragment>
              <NavItem>
                <RouterLink to={'/project/' + this.props.projectId + '/product/' + this.props.productId + '/marketplace'} className={isActive('/marketplace') ? 'nav-link active' : 'nav-link'} wrapInLi>
                  <FormattedMessage id="marketPlace" />
                </RouterLink>
              </NavItem>

              <NavItem>
                <RouterLink to={'/project/' + this.props.projectId + '/product/' + this.props.productId + '/toplists'} className={isActive('/toplist') ? 'nav-link active' : 'nav-link'} wrapInLi>
                  <FormattedMessage id="toplistCompitition" />
                </RouterLink>
              </NavItem>

              <NavItem>
                <RouterLink to={'/project/' + this.props.projectId + '/product/' + this.props.productId + '/AffiliateAccess'} className={isActive('/AffiliateAccess') ? 'nav-link active' : 'nav-link'} wrapInLi>
                  <FormattedMessage id="affiliateAccess" />
                </RouterLink>
              </NavItem>

              <NavItem>
                <RouterLink to={'/project/' + this.props.projectId + '/product/' + this.props.productId + '/designEditor'} className={isActive('/designEditor') ? 'nav-link active' : 'nav-link'} wrapInLi>
                  <FormattedMessage id="designEditor" />
                </RouterLink>
              </NavItem>
            </React.Fragment>
            : null}
        </Nav>
      </React.Fragment>
    );
  }
}

ProjectSettingsTabs.propTypes = {
  projectId: PropTypes.string,
  marketPlace: PropTypes.bool,
  create: PropTypes.bool
};

ProjectSettingsTabs.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(ProjectSettingsTabs);
