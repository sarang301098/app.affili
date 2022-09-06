import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import _ from 'lodash';
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import StarRatings from 'react-star-ratings';

import Loader from '../loader';
import Confirm from '../confirm';
import languages from '../../data/languages.json';

class ViewMarketPlaceUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showContactModal: false,
      showRatingModal: false,
      infoTab: 'description'
    };

    this.saveRatings = this.saveRatings.bind(this);
  }

  componentDidMount() {
    this.setInitialState(this.props);
    if (this.props.affiliateManagerUserId) {
      this.setUserData(this.props.affiliateManagerUserId);
      this.setUserReviewData(this.props.affiliateManagerUserId);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setInitialState(nextProps);
  }

  /**
   * Set the Initial State Data
   */
  setInitialState(props) {
    const { review, affiliateManagerUserId } = props;
    this.setState({ review, affiliateManagerUserId }, () => {
      if (this.state.review) {
        const { rating, comment } = this.state.review;
        this.setState({ rating, comment });
      }
    });
  }

  /**
   * Get Review Data of currently loggedin User and all Reviews of the marketplace user.
   */
  setUserReviewData(affiliateManagerUserId) {
    Meteor.call('getUserReviews', (affiliateManagerUserId || ''), (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState(Object.assign({}, { review: (res || {}).review, allReviews: (res || {}).allReviews }));
        const review = (res || {}).review;
        if (review) {
          this.setState({ rating: (review || {}).rating, comment: (review || {}).comment, isVerified: (review || {}).isVerified });
        }
      }
    });
  }

  /**
   * Get the User Marketplace Profile Data
   */
  setUserData(affiliateManagerUserId) {
    this.setState({ loaded: false });
    Meteor.call('getUserMarketPlaceProfile', (affiliateManagerUserId || ''), (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState(Object.assign({}, { marketPlaceProfile: res, loaded: true }), () => {
          const allLanguages = (Object.keys(languages) || []).map((key, i) => ({
            value: key,
            label: languages[key].nativeName || ''
          }));
          if (this.state.marketPlaceProfile && (this.state.marketPlaceProfile || {}).languages && allLanguages) {
            const marketplaceLanguaues = (this.state.marketPlaceProfile.languages || []).map(language => (allLanguages || []).find((prod => prod.value === language)) || []).map(prod => prod.label);
            this.setState({ languages: marketplaceLanguaues });
          }
        });
      }
    });
  }

  /**
   * Send Data to the Email of the User
   */
  contactSubmit() {
    const { intl } = this.context;
    this.setState({ contactLoading: true });
    if (this.state.marketPlaceProfile && (this.state.marketPlaceProfile || {}).email) {
      Meteor.call('contactMarketplace', (this.state.marketPlaceProfile.email || ''), {
        name: this.state.contactName,
        company: this.state.contactCompany,
        email: this.state.contactEmail,
        phone: this.state.contactPhone,
        message: this.state.contactMessage
      }, (err) => {
        this.setState({ contactLoading: false });
        if (err) {
          Alert.error(intl.formatMessage({ id: 'sendingRequestError' }));
        } else {
          this.setState({ showContactModal: false });
          Alert.success(intl.formatMessage({ id: 'requestSendSuccess' }));
        }
      });
    }
  }

  /**
   * Save / Update Ratings
   */
  saveRatings() {
    const { intl } = this.context;
    this.setState({ showRatingModal: false });
    Meteor.call('updateAffiliateManagersRatings', (this.props.affiliateManagerUserId || ''), (this.state.rating || 0), (this.state.comment || ''), (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
        this.setState({ rating: undefined, comment: undefined }); // _.omit(this.state, ['rating', 'comment' ])
      } else {
        this.setUserReviewData(this.props.affiliateManagerUserId);
        this.setUserData(this.props.affiliateManagerUserId);
        if (res) {
          Alert.success(intl.formatMessage({ id: 'reviewSaved' }));
        } else {
          Alert.error(intl.formatMessage({ id: 'UpdateRatingError' }));
        }
      }
    });
  }

  /**
   * REmove Review by the ReviewId
   */
  removeReview(reviewId, affiliateManagerUserId) {
    const { intl } = this.context;
    if (reviewId) {

      Meteor.call('removeUserReview', (reviewId || ''), (affiliateManagerUserId || ''), (err) => {
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

    this.setState({ rating: undefined, comment: undefined }); // _.omit(this.state, ['rating', 'comment' ])
    this.setUserReviewData(this.props.affiliateManagerUserId);
  }

  /**
   * Manage Reviews and return the Html
   */
  reviewList() {
    let reviews,
      average,
      totalReviews,
      reviewCount = [],
      reviewCountAverage = [],
      stars = 5;
    if (this.state.allReviews) {
      reviews = _.countBy((this.state.allReviews || []), 'rating');
      average = _.meanBy((this.state.allReviews || []), 'rating');
      totalReviews = (this.state.allReviews || []).length;
      for (let i = 0; i < 5; i++) {
        reviewCount[i] = (reviews[i + 1] || 0);
        reviewCountAverage[i] = parseFloat(reviewCount[i] * 100 / totalReviews);
      }
    }

    return (
      <React.Fragment>
        {(reviews && Object.keys(reviews).length) ?
          <div>
            <h5 className="mb-2 font-size-18"><FormattedMessage id="customerReviews" /></h5>
            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <StarRatings
                  rating={average || 0}
                  starRatedColor="#f12732"
                  isAggregateRating
                  starDimension={'20px'}
                  starSpacing={'0px'}
                />
                <label className="font-weight-normal font-size-18 mb-0 mt-2 ml-2">{average.toFixed(1)} <FormattedMessage id="startOutOfFive" /></label>
              </div>
              <p className="text-muted">{totalReviews} <FormattedMessage id="globalRatings" /></p>
            </div>
            <div>
              {reviewCountAverage && reviewCountAverage.length ? ((reviewCountAverage || []).reverse() || []).map((width, index) => (
                <div key={index} className="d-flex align-items-center mt-3">
                  <label className="font-weight-normal text-nowrap mb-0">{stars--} <FormattedMessage id="Star" /></label>
                  <div className="progress mx-2 flex-fill" style={{ height: '20px' }}>
                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${width.toFixed(2)}%` }} aria-valuenow={width.toFixed(2)} aria-valuemin="0" aria-valuemax="100" />
                  </div>
                  <label className="font-weight-normal text-nowrap mb-0">{parseInt((width || 0), 10)} %</label>
                </div>
              )) : null}
            </div>
          </div>
          :
          <div>
            <span><FormattedMessage id="noRatingData" /></span>
          </div>
        }
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="content">
          <div className="container-fluid">
            <Helmet title="Affiliate Managers" />
            <Loader loaded={this.state.loaded}>
              <div className="page-header d-flex flex-wrap align-items-center">
                <h1 className="h5 mb-0 mr-auto"><FormattedMessage id="affiliateManager" />: {this.state.marketPlaceProfile && (this.state.marketPlaceProfile || {}).name ? (this.state.marketPlaceProfile || {}).name : null}</h1>
                <button onClick={() => this.props.history.goBack()} className="btn btn-outline-primary ml-3" ><i className="fa fa-chevron-left mr-2" /><FormattedMessage id="back" /> </button>
                {this.props.affiliateManagerUserId && this.props.affiliateManagerUserId !== Meteor.userId() ?
                  <button type="button" onClick={() => this.setState({ showContactModal: true })} className="btn btn-outline-primary ml-3"><FormattedMessage id="makeContact" /></button> : null}
              </div>

              <React.Fragment>
                <div className="card">
                  <div className="row no-gutters">
                    <div className="col-md-8 border-right">
                      <div
                        className="cover-image border-bottom"
                        style={{
                          backgroundImage: `url("${(this.state.marketPlaceProfile || {}).backgroundImageUrl || '/images/default-avatar.png'}")`,
                          height: '275px',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center center'
                        }}
                      >
                      </div>
                      <div className="media market-place-box viewBox">
                        {(this.state.marketPlaceProfile || {}) ? <img src={(this.state.marketPlaceProfile || {}).imageUrl || '/images/default-avatar.png'} className="mr-4 ml-3 rounded-circle img-thumbnail h-150 o-cover" width="150" /> : null}
                        <div className="media-body align-self-end">
                          <h1 className="h4">{(this.state.marketPlaceProfile || {}).name ? (this.state.marketPlaceProfile || {}).name : 'N/A'}</h1>
                          <p className="mb-0 text-muted">{(this.state.marketPlaceProfile || {}).company ? (this.state.marketPlaceProfile || {}).company : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="card-header border-0 mt-5">
                        <ul className="nav nav-pills settings-tabs">
                          <li className="nav-item mr-2"><div className={this.state.infoTab === 'description' ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ infoTab: 'description' })}><FormattedMessage id="overview" /></div></li>
                          <li className="nav-item"><div className={this.state.infoTab === 'ratings' ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ infoTab: 'ratings' })}><FormattedMessage id="ratings" /></div></li>
                        </ul>
                      </div>
                      <div className="card-body">
                        {this.state.infoTab === 'description' ?
                          <div className="description-tab">
                            <h5 className="mb-3 font-size-18 mt-3"><FormattedMessage id="description" /></h5>
                            <p>{this.state.marketPlaceProfile && (this.state.marketPlaceProfile || {}).description !== '' ?
                              <React.Fragment>
                                {(((this.state.marketPlaceProfile || {}).description || '').split('\n') || []).map((item, key) => (
                                  <span key={key}>{item}<br /></span>
                                ))}
                              </React.Fragment>
                              : 'N/A'}
                            </p>
                          </div> : null}

                        {this.state.infoTab === 'ratings' ?
                          <div className="rating-tab">
                            <div className="page-header d-flex align-items-center">
                              <h5 className="mb-3 font-size-18 mt-3"><FormattedMessage id="ratings" /></h5>
                              {this.props.affiliateManagerUserId && this.props.affiliateManagerUserId !== Meteor.userId() ?
                                <button type="button" onClick={() => this.setState({ showRatingModal: true })} className="btn btn-outline-primary ml-auto">{(this.state.rating || this.state.comment) ? <FormattedMessage id="updateRating" /> : <FormattedMessage id="giveRating" />}</button> : null}
                            </div>
                            {(this.state.rating || this.state.comment) ?
                              <React.Fragment>
                                <div className="mb-2 d-flex justify-content-between">
                                  <StarRatings
                                    rating={this.state.rating || 0}
                                    starRatedColor="#f12732"
                                    numberOfStars={5}
                                    name="rating"
                                    isAggregateRating
                                    starDimension={'20px'}
                                    starSpacing={'0px'}
                                  />

                                  <Confirm
                                    onConfirm={() => this.removeReview((this.state.review || {})._id, (this.state.review || {}).affiliateManagerUserId)}
                                    body={<FormattedMessage id="deleteUserReviewBodyText" />}
                                    confirmText={<FormattedMessage id="remove" />}
                                    cancelText={<FormattedMessage id="deleteUserReviewAbortText" />}
                                    title={<FormattedMessage id="deleteUserReviewTitleText" />}
                                  >
                                    <button type="button" onClick={() => this.removeReview((this.state.review || {})._id, (this.state.review || {}).affiliateManagerUserId)} className="btn btn-sm btn-outline-primary"><i className="fa fa-trash text-danger" /></button>
                                  </Confirm>
                                </div>
                                <div className="mb-5">
                                  {this.state.comment || ''}
                                  <p>{this.state.isVerified ? <FormattedMessage id="reviewVerified" /> : <FormattedMessage id="reviewInVerificatin" />}</p>
                                </div>
                              </React.Fragment> : null}
                            <ul className="list-group list-group-flush my-n3">
                              {this.state.allReviews && this.state.allReviews.length ?
                                (this.state.allReviews || []).map((review, index) => (
                                  <li className="list-group-item px-0 py-3" key={index}>
                                    {review && review.userId && review.userProfile ?
                                      <div className="d-flex align-items-center">
                                        <img src={review.userProfile && (review.userProfile || {}).picture ? (review.userProfile || {}).picture : '/images/default-avatar.png'} height="35" width="35" className="rounded-circle" />
                                        <h6 className="mb-0 ml-2"> {review.userProfile && (review.userProfile || {}).name ? (review.userProfile || {}).name : 'N/A'}</h6>
                                      </div>
                                      :
                                      <div className="d-flex align-items-center">
                                        <img src={'/images/default-avatar.png'} height="35" width="35" className="rounded-circle" />
                                        <h6 className="mb-0 ml-2"> {'N/A'}</h6>
                                      </div>
                                    }
                                    <StarRatings
                                      rating={review.rating || 0}
                                      starRatedColor="#f12732"
                                      isAggregateRating
                                      starDimension={'20px'}
                                      starSpacing={'0px'}
                                    />
                                    <p className="text-muted mt-1 mb-2"><FormattedMessage id="reviewedAt" /> {moment(review.updatedAt).format('MMMM Do YYYY')}</p>
                                    <p className="mb-0">{review.comment || 'No Comments'}</p>
                                  </li>
                                ))
                                :
                                <p className="text-center text-muted">
                                  <FormattedMessage id="noReviewAvailable" />
                                </p>
                              }
                            </ul>
                          </div> : null}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card-body">
                        <h5 className="mb-3 font-size-18"><FormattedMessage id="additionalDetails" /></h5>
                        <ul className="list-unstyled">
                          <li className="d-flex align-items-center mb-4">
                            <i className="fa fa-phone fa-fw text-muted mr-3" />
                            <div>
                              <label className="d-block text-muted mb-1"><FormattedMessage id="phoneNumber" /></label>
                              {(this.state.marketPlaceProfile && (this.state.marketPlaceProfile || {}).phone) ? (this.state.marketPlaceProfile || {}).phone : 'N/A'}
                            </div>
                          </li>
                          <li className="d-flex align-items-center mb-4">
                            <i className="fa fa-globe fa-fw text-muted mr-3" />
                            <div>
                              <label className="d-block text-muted mb-1"><FormattedMessage id="languages" /></label>
                              <div className="d-flex flex-wrap">
                                {(this.state.languages && this.state.languages.length) ? (this.state.languages || []).map((language, index) => (
                                  <React.Fragment>
                                    <span key={index} className="mr-4" >{language}</span>
                                    {index % 5 === 0 && index > 0 ? <br /> : null}
                                  </React.Fragment>
                                )) : 'N/A'}
                              </div>
                            </div>
                          </li>
                        </ul>
                        <div>
                          {this.reviewList()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>

              <Modal isOpen={this.state.showContactModal} toggle={() => this.setState({ showContactModal: false })}>
                <ModalHeader toggle={() => this.setState({ showContactModal: false })}>
                  <FormattedMessage id="makeContact" />
                </ModalHeader>
                <ModalBody>
                  <div className="mb-3">
                    <label className="font-weight-bold"><FormattedMessage id="name" /></label>
                    <input type="text" className="form-control" value={this.state.contactName || ''} onChange={e => this.setState({ contactName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="font-weight-bold"><FormattedMessage id="company" /></label>
                    <input type="text" className="form-control" value={this.state.contactCompany || ''} onChange={e => this.setState({ contactCompany: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="font-weight-bold"><FormattedMessage id="phoneNumber" /></label>
                    <input type="text" className="form-control" value={this.state.contactPhone || ''} onChange={e => this.setState({ contactPhone: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="font-weight-bold"><FormattedMessage id="email" /></label>
                    <input type="email" className="form-control" value={this.state.contactEmail || ''} onChange={e => this.setState({ contactEmail: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="font-weight-bold"><FormattedMessage id="addMessage" /></label>
                    <textarea rows={5} className="form-control" value={this.state.contactMessage || ''} onChange={e => this.setState({ contactMessage: e.target.value })} />
                  </div>
                  <button type="button" onClick={() => this.contactSubmit()} disabled={this.state.contactLoading} className="btn btn-primary font-weight-bold"><FormattedMessage id="makeContact" /></button>
                </ModalBody>
              </Modal>

              <Modal isOpen={this.state.showRatingModal} toggle={() => this.setState({ showRatingModal: false })}>
                <ModalHeader toggle={() => this.setState({ showRatingModal: false })}>
                  <FormattedMessage id="giveRatings" />
                </ModalHeader>
                <ModalBody>
                  <div className="mb-3">
                    <StarRatings
                      rating={this.state.rating}
                      starRatedColor="#f12732"
                      changeRating={value => this.setState({ rating: value })}
                      numberOfStars={5}
                      name="rating"
                      isAggregateRating
                      starDimension={'30px'}
                      starSpacing={'3px'}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="font-weight-bold"><FormattedMessage id="comment" /></label>
                    <textarea rows={5} className="form-control" value={this.state.comment || ''} onChange={e => this.setState({ comment: e.target.value })} />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <button type="button" onClick={() => this.saveRatings()} className="btn btn-primary font-weight-bold"><FormattedMessage id="save" /></button>
                </ModalFooter>
              </Modal>
            </Loader>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ViewMarketPlaceUser.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default createContainer(({ match }) => {
  const affiliateManagerUserId = match.params.id;
  return {
    affiliateManagerUserId,
  };
}, ViewMarketPlaceUser);
