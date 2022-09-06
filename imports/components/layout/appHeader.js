import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Nav, NavItem, NavLink, Navbar, NavbarBrand, Collapse, NavbarToggler, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledDropdown } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import Avatar from 'react-avatar';
import { withRouter } from 'react-router-dom';

import Plans from 'meteor/affilihero-lib/collections/plans';

import RouterLink from '../routerLink';

class AppHeader extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      navbarVisible: false,
      dropdownOpen: false,
      menuOpen: false,
      navOpen: false,
    };

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
    this.hideNavbar = this.hideNavbar.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout() {
    Meteor.logout(() => {
      this.props.history.push('/');
    });
  }

  toggleNavbar(e) {
    e.preventDefault();
    this.setState({ navbarVisible: !this.state.navbarVisible });
  }

  closeNavbar(e) {
    e.preventDefault();
    if (this.state.navbarVisible) {
      this.setState({ navbarVisible: !this.state.navbarVisible });
    }
  }

  hideNavbar() {
    this.setState({ navbarVisible: false });
  }

  openSupport(e) {
    e.preventDefault();

    zE.activate();
  }

  render() {
    const { dropdownOpen, navOpen } = this.state;
    const { router, intl } = this.context;
    const { loggedIn } = this.props;
    let navItems = [];

    const isActive = item => (item.routes || []).some(route => (router.history.location.pathname).indexOf(route) === 0);
    const isSettingsActive = item => (router.history.location.pathname).indexOf(item) === 0;

    if (router.history.location.pathname === '/register' || router.history.location.pathname === '/login' || (router.history.location.pathname || '').startsWith('/enroll-account') || (router.history.location.pathname || '').startsWith('/reset-password') || (router.history.location.pathname || '').startsWith('/forgot-password')) {
      return null;
    }

    if (!loggedIn && (router.history.location.pathname || '').startsWith('/affiliateManagers')) {
      navItems = [
        { title: intl.formatMessage({ id: 'affiliateManagers' }), link: '/affiliateManagers', icon: 'fas fa-user', routes: ['/affiliateManagers'] },
      ];
    } else {
      navItems = [
        { title: intl.formatMessage({ id: 'dashboard' }), link: '/dashboard', routes: ['/dashboard'], icon: 'fa fa-tachometer' },
        { title: intl.formatMessage({ id: 'projects' }), link: '/projects', routes: ['/projects', '/project', '/toplists', '/toplist'], icon: 'fas fa-project-diagram' },
        { title: intl.formatMessage({ id: 'affiliateManagers' }), link: '/affiliateManagers', icon: 'fas fa-user', routes: ['/affiliateManagers'] },
      ];
    }

    return (
      <React.Fragment>
        <header className="app-header">
          <Navbar color="light" light expand="md" className="bg-white border-bottom">
            <div className="container-fluid">
              <NavbarToggler isOpen={navOpen} onClick={() => this.setState({ navOpen: !navOpen })} />
              <div className={'navbar-header'}>
                <NavbarBrand className="app-header-logo"><div className="logo mr-3" /></NavbarBrand>
              </div>
              <Nav className="navbar-nav order-md-4 flex-row nav-right">
                {this.props.user && this.props.user._id ? (
                  <React.Fragment>
                    <NavItem className="nav-item d-flex align-items-center justify-content-center">
                      <RouterLink className={isSettingsActive('/settings') ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ navType: 'settings' })} to="/settings/profile" >
                        <i className="fa fa-cog" />
                      </RouterLink>
                    </NavItem>
                    <NavItem className="ml-4 ml-md-0">
                      <Dropdown isOpen={dropdownOpen} toggle={() => this.setState({ dropdownOpen: !dropdownOpen })} id="user-dropdown" className="user-dropdown">
                        <DropdownToggle nav>
                          <Avatar name={this.props.userName} size="25" round />
                        </DropdownToggle>
                        <DropdownMenu right className={dropdownOpen ? 'show' : null}>
                          <DropdownItem onClick={this.logout}><i className="fa fa-sign-out-alt mr-2 fa-fw" />
                            <FormattedMessage id="logout" />
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </NavItem>
                  </React.Fragment>
                ) :
                  <React.Fragment>
                    <NavItem className="ml-1 ml-md-0 pt-5p">
                      <NavLink to={'/login'} onClick={() => this.props.history.push('/login')} className={isActive('/login') ? ' active' : null}>
                        <span>LOGIN</span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="ml-1 ml-md-0 pt-5p">
                      <NavLink to={'/register'} onClick={() => this.props.history.push('/register')} className={isActive('/register') ? ' active' : null}>
                        <span>REGISTER</span>
                      </NavLink>
                    </NavItem>
                  </React.Fragment>
                }
              </Nav>

              <Collapse isOpen={navOpen} navbar>
                <ul className="navbar-nav">
                  <React.Fragment>
                    {navItems.filter(item => !!item).map((item, i) => (
                      item.items ? (
                        <UncontrolledDropdown
                          key={i}
                          tag="li"
                          className="nav-item"
                        >
                          <DropdownToggle
                            tag="a"
                            className={(isActive(item)) ? 'nav-link dropdown-toggle active' : 'nav-link dropdown-toggle'}
                            data-toggle="dropdown"
                          >
                            <i className={item.icon + ' mr-2'} />
                            <span>{item.title}</span>
                          </DropdownToggle>
                          <DropdownMenu>
                            {item.items.map((innerItem, k) => (
                              <DropdownItem tag="li" key={k}>
                                <NavLink onClick={() => this.props.history.push(innerItem.link)} className={isActive(innerItem) ? 'active' : null}>
                                  <i className={innerItem.icon + ' mr-2'} style={{ fontSize: '15px' }} />
                                  <span>{innerItem.title}</span>
                                </NavLink>
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      ) : (
                        <li key={i} className="nav-item">
                          <NavLink to={item.link} onClick={() => this.props.history.push(item.link)} className={isActive(item) ? ' active' : null}>
                            <i className={item.icon + ' mr-2'} />
                            <span>{item.title}</span>
                          </NavLink>
                        </li>
                      )
                    ))}
                  </React.Fragment>
                </ul>
              </Collapse>
            </div>
          </Navbar>
        </header>
      </React.Fragment>
    );
  }
}

AppHeader.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default withRouter(createContainer(() => {
  const userName = Meteor.isClient && Meteor.user() && Meteor.user().profile ? (Meteor.user().profile.firstName || Meteor.user().profile.name) : '';

  return {
    plan: Meteor.isClient && Meteor.user() && Meteor.user().plan ? Plans.findOne(Meteor.user().plan.id) : null,
    user: Meteor.isClient ? Meteor.user() || {} : {},
    userName,
    loggedIn: Meteor.isClient ? !!Meteor.userId() : false,
  };
}, AppHeader));
