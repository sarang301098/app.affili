import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import pick from 'lodash/pick';
import { createContainer } from 'meteor/react-meteor-data';
import Select from 'react-select';
import StarRatings from 'react-star-ratings';
import reactSelectStyle from '../../utils/reactSelectStyle';

import Confirm from '../confirm';
import SettingsTab from './settingsTab';
import languages from '../../data/languages.json';
import UploadInput from '../uploadInput';

class MarketPlaceProfileSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      marketPlaceSettingSetps: 1
    };

    this.getAllUserReviews = this.getAllUserReviews.bind(this);
    this.handleMarketplaceSubmit = this.handleMarketplaceSubmit.bind(this);
    this.handleMarketplaceChange = this.handleMarketplaceChange.bind(this);
    this.handleMarketPlaceImgurl = this.handleMarketPlaceImgurl.bind(this);
    this.handleMarketplaceLanguages = this.handleMarketplaceLanguages.bind(this);
    this.removeReviews = this.removeReviews.bind(this);
    this.verifyReview = this.verifyReview.bind(this);
  }

  componentDidMount() {
    this.setInitialState();
  }

  /**
   * Get The All Review Which Assign to the current Loggedin User
   */
  getAllUserReviews() {
    Meteor.call('getAllUserReviews', (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      }
      if (res) {
        this.setState({ allReviews: (res || []), loaded: true });
      }
    });
  }

  /**
   * Set the Initial State Data
   */
  setInitialState() {
    const state = {};
    if (Meteor.user() && Meteor.user().marketPlaceProfile) {
      state.marketPlaceProfile = Meteor.user().marketPlaceProfile || {};
    }
    if (Meteor.user() && Meteor.user().marketPlace) {
      state.marketPlace = Meteor.user().marketPlace;
    }
    this.setState(state);
    this.getAllUserReviews();
  }

  /**
   * Handle the Submit of the Save Marketplace Button
   */
  handleMarketplaceSubmit(e) {
    e.preventDefault();

    const { intl } = this.context;

    this.setState({ loading: true });

    Meteor.call('updateMarketplaceProfile', (this.state.marketPlaceProfile || {}), (err) => {
      this.setState({ loading: false });
      Alert.closeAll();
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'marketplaceProfileSaved' }));
      }
    });
  }

  /**
   * Manage Change of the MarketplaceProfile Data
   */
  handleMarketplaceChange(e) {
    const marketPlaceProfile = this.state.marketPlaceProfile || {};
    marketPlaceProfile[e.target.name] = e.target.value;
    this.setState({ marketPlaceProfile });
  }

  /**
   * Manage Change of the Image Type Data of the MArketplaceSettings
   */
  handleMarketPlaceImgurl(name, value) {
    const marketPlaceProfile = this.state.marketPlaceProfile || {};
    marketPlaceProfile[name] = value;
    this.setState({ marketPlaceProfile });
  }

  /**
   * Manage the Change of the Languages
   */
  handleMarketplaceLanguages(name, value) {
    const marketPlaceProfile = this.state.marketPlaceProfile || {};
    marketPlaceProfile[name] = value.map(val => val.value);
    this.setState({ marketPlaceProfile });
  }

  /**
   * REmove the Review Based on the ReviewId
   */
  removeReviews(reviewId) {
    const { intl } = this.context;

    if (reviewId) {
      Meteor.call('removeUserReview', reviewId, (err) => {
        this.setState({ loaded: true });
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'reviewDeleted' }));
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'noRatingFound' }));
    }
    this.getAllUserReviews();
  }

  /**
   * Verify the Review from the ReviewId
   */
  verifyReview(reviewId) {
    const { intl } = this.context;

    if (reviewId) {
      Meteor.call('verifyUserReview', reviewId, (err) => {
        this.setState({ loaded: true });
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'reviewApproved' }));
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'noRatingFound' }));
    }
    this.getAllUserReviews();
  }

  render() {
    const { allReviews } = this.state;

    const allLanguages = Object.keys(languages).map(key => ({
      value: key,
      label: languages[key].nativeName || ''
    }));

    const { address } = this.state.marketPlaceProfile || {};

    return (
      <SettingsTab>
        <React.Fragment>
          <Helmet title="Marketplace Profile" />
          <div className="card-header border-0 py-3">
            <ul className="nav nav-pills settings-tabs">
              <li className="nav-item mr-2">
                <div className={this.state.marketPlaceSettingSetps === 1 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 1 })}>1. GENERAL</div>
              </li>
              <li className="nav-item mr-2">
                <div className={this.state.marketPlaceSettingSetps === 2 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 2 })}>2. DESCRIPTION</div>
              </li>
              <li className="nav-item">
                <div className={this.state.marketPlaceSettingSetps === 3 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 3 })}>3. REVIEWS</div>
              </li>
            </ul>
          </div>

          <React.Fragment>
            <fieldset>
              <form onSubmit={this.handleMarketplaceSubmit} className="form-horizontal0">
                <div className="card-body mt-3">
                  {this.state.marketPlaceSettingSetps === 1 ?
                    <React.Fragment>
                      <div className="row">
                        <div className="col-xl-8">
                          <div className="row">
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).name ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="name" /></label>
                                <input type="text" name="name" className="form-control form-control-lg" value={((this.state.marketPlaceProfile || {})).name} onChange={this.handleMarketplaceChange} required />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).company ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="company" /></label>
                                <input type="text" name="company" className="form-control" value={(this.state.marketPlaceProfile || {}).company} onChange={this.handleMarketplaceChange} />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).imageUrl ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="image" /></label>
                                <UploadInput noEditor value={(this.state.marketPlaceProfile || {}).imageUrl} onChange={value => this.handleMarketPlaceImgurl('imageUrl', value)} />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).backgroundImageUrl ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="backgroundImage" /></label>
                                <UploadInput noEditor value={(this.state.marketPlaceProfile || {}).backgroundImageUrl} onChange={value => this.handleMarketPlaceImgurl('backgroundImageUrl', value)} />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).email ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="email" /></label>
                                <input type="email" name="email" className="form-control" value={(this.state.marketPlaceProfile || {}).email} onChange={this.handleMarketplaceChange} required />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).phone ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="phoneNumber" /></label>
                                <input type="text" name="phone" className="form-control" value={(this.state.marketPlaceProfile || {}).phone} onChange={this.handleMarketplaceChange} />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).website ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="website" /></label>
                                <input type="url" name="website" className="form-control" value={(this.state.marketPlaceProfile || {}).website} onChange={this.handleMarketplaceChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment> : null}

                  {this.state.marketPlaceSettingSetps === 2 ?
                    <React.Fragment>
                      <div className="row">
                        <div className="col-xl-8">
                          <div className="row">
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).category ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="category" /></label>
                                <div className="col-md-50">
                                  <select name="category" className="custom-select custom-select-lg " value={(this.state.marketPlaceProfile || {}).category} onChange={this.handleMarketplaceChange}>
                                    <option value="" />
                                    <option value="category1">ct 1</option>
                                    <option value="category2">ct 2</option>
                                    <option value="category3">ct 3</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className={((this.state.marketPlaceProfile || {})).languages ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="languages" /></label>
                                <div className="col-md-50">
                                  <Select
                                    closeMenuOnSelect={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    value={(((this.state.marketPlaceProfile || {}).languages) || []).map(language => (allLanguages || []).find(prod => prod.value === language)).map(prod => ({ label: prod.label, value: prod.value }))}
                                    onChange={value => this.handleMarketplaceLanguages('languages', value)}
                                    options={allLanguages}
                                    theme={reactSelectStyle.theme}
                                    isMulti
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className={((this.state.marketPlaceProfile || {})).description ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                <label className="control-label"><FormattedMessage id="descriptionText" /></label>
                                <div className="col-md-50">
                                  <textarea name="description" rows={5} className="form-control form-control-lg" value={(this.state.marketPlaceProfile || {}).description} onChange={this.handleMarketplaceChange} required />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment> : null}

                  {this.state.marketPlaceSettingSetps === 3 ?
                    <React.Fragment>
                      <ul className={allReviews && allReviews.length ? 'list-group list-group-flush my-n3' : 'text-center'}>
                        {allReviews && allReviews.length ? allReviews.map((review, index) => (
                          <li className="list-group-item px-0 py-3 d-flex align-items-center" key={index}>
                            <div>
                              <p className="mb-0 mt-1">{(review.userProfile || {}).name || 'N/A'}</p>
                              <StarRatings
                                rating={review.rating}
                                starRatedColor="#f12732"
                                isAggregateRating
                                starDimension={'20px'}
                                starSpacing={'3px'}
                              />
                              <p className="mb-0 mt-1">{review.comment}</p>
                            </div>
                            <div className="ml-auto">
                              {review.isVerified ?
                                <span className="badge badge-success text-white ml-auto"><i className="fa fa-check mr-1" /> Verified</span>
                                :
                                <Confirm
                                  onConfirm={() => this.verifyReview(review._id)}
                                  body={<FormattedMessage id="approveReviewBodyText" />}
                                  confirmText={<FormattedMessage id="approve" />}
                                  cancelText={<FormattedMessage id="approveReviewAbortText" />}
                                  title={<FormattedMessage id="approveReviewTitleText" />}
                                >
                                  <button type="button" className="btn btn-outline-success btn-sm " ><i className="fa fa-check" /></button>
                                </Confirm>
                              }
                              <Confirm
                                onConfirm={() => this.removeReviews(review._id)}
                                body={<FormattedMessage id="deleteReviewBodyText" />}
                                confirmText={<FormattedMessage id="remove" />}
                                cancelText={<FormattedMessage id="deleteReviewAbortText" />}
                                title={<FormattedMessage id="deleteReviewTitleText" />}
                              >
                                <button type="button" className="btn btn-outline-danger btn-sm ml-2"><i className="fa fa-trash" /></button>
                              </Confirm>
                            </div>
                          </li>
                        )) : 'No Ratings Available'}
                      </ul>
                    </React.Fragment> : null}

                </div>
                {this.state.marketPlaceSettingSetps === 3 ? null :
                  <div className="card-footer text-right">
                    <button type="submit" className="btn btn-primary" disabled={this.state.marketPlaceSettingSetps === 1}><FormattedMessage id="saveMarketplace" /></button>
                    {/* <button onClick={() => this.props.history.push('/affiliateManagers/' + Meteor.userId())} className="btn btn-primary ml-2"><FormattedMessage id="preview" /></button> */}
                  </div>}

              </form>
            </fieldset>
          </React.Fragment>
        </React.Fragment>
      </SettingsTab>
    );
  }
}

MarketPlaceProfileSettings.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default createContainer(() => ({
  currentUser: Meteor.user(),
}), connect(
  state => pick(state, ['userLocale'])
)(MarketPlaceProfileSettings));
