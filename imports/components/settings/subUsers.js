import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import Select from 'react-select';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';

import Projects from 'meteor/affilihero-lib/collections/projects';

import Confirm from '../confirm';
import Loader from '../loader';
import SettingsTab from './settingsTab';
import reactSelectStyle from '../../utils/reactSelectStyle';

class SubUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newUserEmail: '',
      addingUsers: false,
      loading: true,
      pushSubscriptionLimits: {}
    };

    this.getSubUsers = this.getSubUsers.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.getUserPlan = this.getUserPlan.bind(this);
    this.handleMemberEmailKeyPress = this.handleMemberEmailKeyPress.bind(this);
    this.addSubUser = this.addSubUser.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.handleLogoChange = this.handleLogoChange.bind(this);
    this.userName = this.userName.bind(this);
    this.updatePushSubscriptionLimit = this.updatePushSubscriptionLimit.bind(this);
    this.savePushSubscriptionLimits = this.savePushSubscriptionLimits.bind(this);
    this.handleProjectChange = this.handleProjectChange.bind(this);
    this.handleLogoChange = this.handleLogoChange.bind(this);
  }

  componentDidMount() {
    this.setInitialState();
  }

  /**
   * Get All SubUsers whose parntUserid is current loggedin User id
   */
  getSubUsers() {
    // this.setState({ loading: false });
    Meteor.call('getSubUsers', (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ user: res.user || {}, subUsers: res.subUsers || [] });
      }
    });
  }


  /**
   * Get All the Projects Assign to users
   */
  getProjects() {
    Meteor.call('getUsersProjects', (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ ...res });
      }
    });
  }

  /**
   * Get All the Projects Assign to users
   */
  getUserPlan() {
    Meteor.call('getUserPlan', (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ userPlan: res || {} });
      }
    });
  }

  setInitialState() {
    this.getSubUsers();
    this.getProjects();
    this.getUserPlan();
  }

  /**
   * Handle the enter Key Press
   */
  handleMemberEmailKeyPress(e) {
    if (e.key === 'Enter') {
      this.addSubUser(e);
    }
  }

  /**
   * Add The SubUsers to the Users Collection
   */
  addSubUser(e) {
    e.preventDefault();

    const { intl } = this.context;

    if (!this.state.newUserEmail) {
      return;
    }

    const subUsersCount = (this.state.subUsers || []).length || 0;

    if (this.state.userPlan && (((this.state.userPlan || {}).maximumSubUsers || 0) === -1 || ((this.state.userPlan || {}).maximumSubUsers || 0) > subUsersCount)) {
      this.setState({ loading: false });
      Meteor.call('addSubUser', this.state.newUserEmail, (err) => {
        this.setState({ loading: true, newUserEmail: '' });
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'UserAdded' }));
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'maxSubuserAlert' }) + ((this.state.userPlan || {}).maximumSubUsers || 0) + ' Subuser' + ((this.state.userPlan || {}).maximumSubUsers === 1 ? '' : 's') + ' erstellen.');
    }

    this.setInitialState();
  }

  /**
   * Remove the SubUser
   */
  removeUser(id) {
    const { intl } = this.context;

    Meteor.users.remove(id, (err) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'subUserDeleted' }));
      }
    });
    this.setInitialState();
  }

  /**
   * Render The User Data based on the Given Parameters
   */
  userName(member) {
    let name;
    let company;
    let email;
    if (member.profile) {
      if (member.profile.name) {
        name = member.profile.name;
      }
      if (member.profile.company) {
        company = member.profile.company;
      }
    }
    if (member.emails && member.emails.length && member.emails[0].address) {
      email = member.emails[0].address;
    }

    return (
      <div>
        {name ? <div><strong>{name}</strong></div> : null}
        {company ? <div>{company}</div> : null}
        {email ? <div><span>{email}</span></div> : null}
      </div>
    );
  }

  /**
   * Update the Push subscription values to the project collections
   */
  updatePushSubscriptionLimit(project, value) {
    const pushSubscriptionLimits = Object.assign({}, this.state.pushSubscriptionLimits);
    if (!isNaN(value)) {
      pushSubscriptionLimits[project.value] = parseInt(value, 10);
    }

    let limits = 0;
    Object.keys(pushSubscriptionLimits || {}).forEach(id => limits += pushSubscriptionLimits[id] || 0);

    this.setState({ pushSubscriptionLimits, pushSubscriptionLimitsOverMax: limits > 5000 });
  }

  /**
   * save the Push-notificatin value to the project collecton
   */
  savePushSubscriptionLimits() {
    if (this.state.pushSubscriptionLimitsOverMax) {
      Alert.error('Die Limits müssen zusammen 5.000 ergeben');
      return;
    }

    if (Object.keys(this.state.pushSubscriptionLimits || {}).length) {
      (this.state.projectOptions || []).forEach((project) => {
        Projects.update(project.value, { $set: { pushSubscriptionLimit: this.state.pushSubscriptionLimits[project.value] || 0 } });
      });
    }

    Alert.success('Die Limits wurden erfolgreich gespeichert');
  }

  /**
   * Manage The Projects Change of the SubUsers Directly update the Collection (Multi select Projects)
   */
  handleProjectChange(id, value) {
    Meteor.users.update(id, { $set: { projectIds: (value || []).map(val => val.value) } });
    this.setInitialState();
  }

  /**
   * Manage the Change of the Logo
   */
  handleLogoChange(value) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.logoUrl': value } }, () => Alert.success('Logo erfolgreich hochgeladen'));
    this.getSubUsers();
  }

  render() {
    const { intl } = this.context;

    return (
      <SettingsTab>
        <Helmet title="Customer Access" />
        <div className="card-body">
          {Meteor.isClient && Meteor.user() && !Meteor.user().subUser ?
            <React.Fragment>
              <div className="row mb-4">
                <div className="col-md-5">
                  <label><FormattedMessage id="createAccess" /></label>
                  <div className="form-row">
                    <div className="col-md-8">
                      <input type="email" disabled={!this.state.loading} className="form-control input-sm" value={this.state.newUserEmail} onChange={e => this.setState({ newUserEmail: e.target.value })} placeholder={intl.formatMessage({ id: 'email' })} onKeyPress={this.handleMemberEmailKeyPress} />
                    </div>
                    <div className="col-md-4">
                      <button type="button" onClick={this.addSubUser} disabled={!this.state.loading} className="btn btn-primary"><FormattedMessage id="add" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="mb-2"><FormattedMessage id="manageAccess" /></h5>
              <Loader loaded={this.state.loading}>
                {this.state.subUsers && this.state.subUsers.length ? (
                  <div className="bg-white">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th><FormattedMessage id="subUser" /></th>
                            <th className="w-450"><FormattedMessage id="projects" /></th>
                            <th><FormattedMessage id="status" /></th>
                            <th className="text-center"><FormattedMessage id="actions" /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.subUsers && (this.state.subUsers || []).map((member, i) => (
                            <tr key={member._id}>
                              <td>{this.userName(member)}</td>
                              <td>
                                <Select
                                  className="w-90p"
                                  closeMenuOnSelect={false}
                                  value={(member.projectIds || []).map(events => (this.state.projectOptions || []).find(prod => prod.value === events)).filter(prod => prod && prod.value && prod.label).map(prod => ({ label: prod.label, value: prod.value }))}
                                  onChange={value => this.handleProjectChange(member._id, value)}
                                  options={this.state.projectOptions}
                                  theme={reactSelectStyle.theme}
                                  isClearable
                                  isMulti
                                />
                              </td>
                              <td>
                                {member.emails && member.emails[0].verified ? <span className="text-success"><FormattedMessage id="active" /></span> : <span className="text-muted"><FormattedMessage id="activationLink" />:</span>}
                                {!member.emails[0].verified && member.services && member.services.password && member.services.password.reset ? <input type="text" value={'https://app.affilihero.io/enroll-account/' + member.services.password.reset.token} className="form-control form-control-sm mt-1" onFocus={e => e.target.select()} /> : null}
                              </td>
                              <td className="text-center">
                                <Confirm
                                  onConfirm={() => this.removeUser(member._id)}
                                  body={<FormattedMessage id="deleteSubuserBodyText" />}
                                  confirmText={<FormattedMessage id="remove" />}
                                  cancelText={<FormattedMessage id="deleteSubuserAbortText" />}
                                  title={<FormattedMessage id="deleteSubuserTitleText" />}
                                >
                                  <button type="button" className="btn btn-sm btn-outline-primary"><i className="fa fa-trash text-danger" /></button>
                                </Confirm>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center">
                    <FormattedMessage id="noSubuser" />
                  </p>
                )}
              </Loader>
            </React.Fragment> :
            <p className="text-center text-muted"><FormattedMessage id="notAccess" /></p>
          }
        </div>
      </SettingsTab>
    );
  }
}

SubUsers.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default withRouter(SubUsers);
