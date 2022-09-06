import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Helmet from 'react-helmet';
import { createContainer } from 'meteor/react-meteor-data';

import SettingsTab from './settingsTab';
import countries from '../../data/countries.json';

import Reviews from 'meteor/affilihero-lib/collections/affiliateReview';

const selectCountries = omit(countries, ['O1', 'A1', 'A2', 'EU']);

class ProfileSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentDidMount() {
    const state = Meteor.user() && Meteor.user().profile ? Meteor.user().profile : {};
    if (Meteor.user() && Meteor.user().emails && Meteor.user().emails.length > 0) {
      state.email = Meteor.user().emails[0].address;
    }
    if (Meteor.user() && Meteor.user().marketPlace) {
      state.marketPlace = Meteor.user().marketPlace;
    }
    this.setState(state);
  }

  /**
   * Set the EmailNotification Enable/Disable
   */
  setDisabledEmailNotifications(type, enabled) {
    const disabledEmailNotifications = this.state.disabledEmailNotifications || [];
    const index = disabledEmailNotifications.indexOf(type);
    if (index >= 0 && enabled) {
      disabledEmailNotifications.splice(index, 1);
    } else if (index < 0 && !enabled) {
      disabledEmailNotifications.push(type);
    }
    this.setState({ disabledEmailNotifications });
  }

  /**
   * Handle all Changes of the Current State
   */
  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  /**
   * Save/Update The Data in Users Collection
   */
  handleSubmit(e) {
    e.preventDefault();

    const { intl } = this.context;

    const doc = {};
    this.setState({ loading: true });

    if (e.target.firstName.value || e.target.lastName.value) {
      doc['profile.firstName'] = e.target.firstName.value;
      doc['profile.lastName'] = e.target.lastName.value;
      doc['profile.name'] = e.target.firstName.value + ' ' + e.target.lastName.value;
    }
    if (Meteor.user().emails.length === 0 || Meteor.user().emails[0].address !== e.target.email.value) {
      Meteor.call('changeEmail', e.target.email.value);
    }
    if (e.target.company) {
      doc['profile.company'] = e.target.company.value;
    }
    if (e.target.address) {
      doc['profile.address'] = e.target.address.value;
    }
    if (e.target.city) {
      doc['profile.city'] = e.target.city.value;
    }
    if (e.target.zip) {
      doc['profile.zip'] = e.target.zip.value;
    }
    if (e.target.country) {
      doc['profile.country'] = e.target.country.value;
    }
    if (e.target.phone) {
      doc['profile.phone'] = e.target.phone.value;
    }

    Meteor.users.update(Meteor.userId(), { $set: doc }, { removeEmptyStrings: false }, (err) => {
      this.setState({ loading: false });
      Alert.closeAll();
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'profileSaved' }));
      }
    });
  }

  /**
   * Remove The Review By Id
   */
  remove(reviewId) {
    Reviews.remove(reviewId);
  }

  render() {
    const { userLocale } = this.props;
    const { intl } = this.context;

    const sortedCountryKeys = Object.keys(selectCountries).sort((a, b) => {
      const nameA = countries[a].names.de.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
      const nameB = countries[b].names.de.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    return (
      <SettingsTab >
        <React.Fragment>
          <Helmet title="Profile" />
          <fieldset disabled={this.state.loading}>
            <form onSubmit={this.handleSubmit} className="form-horizontal0">
              <div className="card-body mt-3">
                <div className="row">
                  <div className="col-xl-8">
                    <div className="row">
                      <div className="col-md-6">
                        <div className={this.state.firstName ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="firstName" /></label>
                          <input type="text" name="firstName" className="form-control form-control-lg" value={this.state.firstName} onChange={this.handleChange} required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={this.state.lastName ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="lastName" /></label>
                          <input type="text" name="lastName" className="form-control form-control-lg" value={this.state.lastName} onChange={this.handleChange} required />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className={this.state.company ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="company" /></label>
                          <input type="text" name="company" className="form-control form-control-lg" value={this.state.company} onChange={this.handleChange} required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={this.state.email ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="email" /></label>
                          <input type="text" name="email" className="form-control form-control-lg" value={this.state.email} onChange={this.handleChange} required />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className={this.state.phone ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="phoneNumber" /></label>
                          <input type="text" name="phone" className="form-control form-control-lg" value={this.state.phone} onChange={this.handleChange} required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={this.state.address ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="address" /></label>
                          <input type="text" name="address" className="form-control form-control-lg" value={this.state.address} onChange={this.handleChange} required />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className={this.state.city ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="city" /></label>
                          <input type="text" name="city" className="form-control form-control-lg" value={this.state.city} onChange={this.handleChange} required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={this.state.zip ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="zipCode" /></label>
                          <input type="text" name="zip" className="form-control form-control-lg" value={this.state.zip} onChange={this.handleChange} required />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className={this.state.country ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                          <label className="control-label"><FormattedMessage id="country" /></label>
                          <div className="">
                            <select name="country" className="form-control custom-select custom-select-lg" value={this.state.country || ''} onChange={this.handleChange}>
                              <option value="" disabled />
                              {userLocale === 'de' ? [
                                <option key="DE" value="DE">{intl.formatMessage({ id: 'germany' })}</option>,
                                <option key="AT" value="AT">{intl.formatMessage({ id: 'austria' })}</option>,
                                <option key="CH" value="CH">{intl.formatMessage({ id: 'switzerland' })}</option>,
                                <option key="-" value="" disabled>---</option>
                              ] : null}
                              {sortedCountryKeys.map(code => (
                                <option key={code} value={code}>{countries[code].names.de}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer text-right">
                <button type="submit" className="btn btn-primary"><span><FormattedMessage id="save" /></span></button>
              </div>
            </form>
          </fieldset>
        </React.Fragment>
      </SettingsTab >
    );
  }
}

ProfileSettings.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default createContainer(() => ({
}), connect(
  state => pick(state, ['userLocale'])
)(ProfileSettings));
