import React, { Component } from 'react';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { DateRangePicker } from 'react-dates';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import DateStatisticsChart from './dateStatisticsChart';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    const startDate = moment().subtract(30, 'days').startOf('day');
    const endDate = moment().endOf('day');

    this.state = {
      loaded: false,
      stats: {},
      startDate,
      endDate,
    };

    this.getProjectStats = this.getProjectStats.bind(this);
    this.getProjectCount = this.getProjectCount.bind(this);
    this.getProductCount = this.getProductCount.bind(this);
    this.getAffiliateUserCount = this.getAffiliateUserCount.bind(this);
  }

  componentDidMount() {
    this.getProjectStats(false);
    this.getProjectCount();
    this.getProductCount();
    this.getAffiliateUserCount();
    this.getToplistCount();
  }

  /**
   * Get All Statistics Data of the Projects
   */
  getProjectStats() {
    this.setState({ loaded: false });
    Meteor.call('getDashboardProductStatistics', this.state.startDate.toDate(), this.state.endDate.toDate(), moment().startOf('day').toDate(), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else if (typeof res === 'object') {
        this.setState({ stats: res, loaded: true });
      }
    });
  }

  /**
   * Get Count of the Projects
   */
  getProjectCount() {
    this.setState({ loaded: false });
    Meteor.call('getProjectCount', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ projectCount: res, loaded: true });
      }
    });
  }

  /**
   * Get Count of the Products
   */
  getProductCount() {
    this.setState({ loaded: false });
    Meteor.call('getProductCount', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ productCount: res, loaded: true });
      }
    });
  }

  /**
   * Get Count of the Toplist
   */
  getToplistCount() {
    this.setState({ loaded: false });
    Meteor.call('getToplistCount', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ toplistCount: res, loaded: true });
      }
    });
  }

  /**
   * get Total Affiliate Users
   */
  getAffiliateUserCount() {
    this.setState({ loaded: false });
    Meteor.call('getAffiliateUserCount', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ affiliateUserCount: res, loaded: true });
      }
    });
  }

  render() {
    return (
      <div className="content dashboard-data">
        <div className="container-fluid">
          <Helmet title="Dashboard" />
          <div className="page-header d-flex flex-wrap align-items-center">
            <h1 className="h5 mb-0 mr-auto d-flex"><FormattedMessage id="welcome" />, <span className="pl-2">{Meteor.user() && Meteor.user().profile && Meteor.user().profile.name ? ` ${Meteor.user().profile.name}` : ' N/A'}</span></h1>

          </div>
          <h2 className="h5 font-size-18 mb-0"><FormattedMessage id="affiliateUsersStatistics" /></h2>
          <div className="row mt-3">
            <div className="col-md-3">
              <div className="card common-box">
                <div className="card-body">
                  <h2 className="text-success h4">{this.state.affiliateUserCount ? this.state.affiliateUserCount : 0}</h2>
                  <h6 className="m-0"><FormattedMessage id="affiliateusers" /></h6>
                </div>
              </div>
            </div>

          </div>
          <h2 className="h5 font-size-18 mt-4 mb-0"><FormattedMessage id="userStatistics" /></h2>
          <div className="row mt-3">
            {Meteor.isClient && Meteor.user() && Meteor.user().subUser ? null :
              <div className="col-md-3">
                <div className="card common-box">
                  <div className="card-body">
                    <h2 className="text-info h4">
                      {this.state.productCount ? this.state.productCount : 0}</h2>
                    <h6 className="m-0"><FormattedMessage id="productCount" /></h6>
                  </div>
                </div>
              </div>}
            <div className="col-md-3">
              <div className="card common-box">
                <div className="card-body">
                  <h2 className="text-primary h4">{this.state.projectCount ? this.state.projectCount : 0}</h2>
                  <h6 className="m-0"><FormattedMessage id="projectcount" /></h6>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card common-box">
                <div className="card-body">
                  <h2 className="text-info h4">
                    {(this.state.stats || {}).visits30Days ? (this.state.stats || {}).visits30Days : 0}</h2>
                  <h6 className="m-0"><FormattedMessage id="lastMonthTotalVisits" /></h6>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card common-box">
                <div className="card-body">
                  <h2 className="text-primary h4">{this.state.toplistCount ? this.state.toplistCount : 0}</h2>
                  <h6 className="m-0"><FormattedMessage id="toplistCount" /></h6>
                </div>
              </div>
            </div>
          </div>

          <h2 className="h5 font-size-18 mt-4 mb-0"><FormattedMessage id="projectStatisticsGraph" /></h2>
          <div className="row mt-3">
            <div className="col-md-12">
              <div className="card common-box">
                <div className="card-body">
                  <div className="mb-2">
                    <DateRangePicker
                      startDateId={'start-date'}
                      endDateId={'end-date'}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      onDatesChange={({ startDate, endDate }) => startDate && endDate && this.setState({ startDate: startDate.utc().startOf('day'), endDate: endDate.utc().endOf('day') }, () => this.getProjectStats(true))}
                      focusedInput={this.state.focusedInput}
                      onFocusChange={focusedInput => this.setState({ focusedInput })}
                      hideKeyboardShortcutsPanel
                      isOutsideRange={() => false}
                    />
                    <div style={{ position: 'relative' }}>
                      <DateStatisticsChart startDate={this.state.startDate} endDate={this.state.endDate} statistics={(this.state.stats || {}).ProductStatistics || []} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default Dashboard;
