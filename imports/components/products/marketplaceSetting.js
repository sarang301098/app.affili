import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import pick from 'lodash/pick';
import _ from 'lodash';
import { createContainer } from 'meteor/react-meteor-data';
import StarRatings from 'react-star-ratings';
import Select from 'react-select';

import Products from 'meteor/affilihero-lib/collections/products';

import Confirm from '../confirm';
import UploadInput from '../uploadInput';
import Loader from '../loader';
import ProjectTabs from '../projects/projectTabs';
import ProductTabs from './productTabs';
import { silderPlans } from '../../data/sliderPlans';
import reactSelectStyle from '../../utils/reactSelectStyle';

class MarketPlaceProfileSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      marketPlaceSettingSetps: 1,
      showPurchaseModal: false
    };

    this.getMarketplaceSettings = this.getMarketplaceSettings.bind(this);
    this.getAllReviews = this.getAllReviews.bind(this);
    this.handleMarketplaceChange = this.handleMarketplaceChange.bind(this);
    this.handleMarketplaceSubmit = this.handleMarketplaceSubmit.bind(this);
    this.handleMarketPlaceImgurl = this.handleMarketPlaceImgurl.bind(this);
    this.handleMarketplaceLanguages = this.handleMarketplaceLanguages.bind(this);
    this.addImages = this.addImages.bind(this);
    this.handleProductImageChange = this.handleProductImageChange.bind(this);
    this.removeProductImage = this.removeProductImage.bind(this);
    this.removeReview = this.removeReview.bind(this);
    this.verifyReview = this.verifyReview.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (this.props.projectId) {
      this.setState({ projectId: this.props.projectId });
    }
    if (this.props.marketPlaceSettings) {
      this.setState({ marketPlaceSettings: this.props.marketPlaceSettings });
      if ((this.props.marketPlaceSettings || {}).productImages) {
        this.setState({ productImages: (this.props.marketPlaceSettings || {}).productImages });
      }
    }
    this.getAllReviews();
    this.getMarketplaceSettings();
    this.getMarketplaceSlots();
  }

  /**
   * Get The Marketplace Settings from the Product and Validate based on Domain/marketplace checkbox
   */
  getMarketplaceSettings() {
    Meteor.call('getProductMarketplaceSettings', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ marketPlaceSettings: res.marketPlaceSettings, name: res.name, domainId: res.domainId, marketPlace: res.marketPlace }, () => {
          if (this.state.domainId || !this.state.marketPlace) {
            if (this.state.domainId && this.state.marketPlace) {
              this.marketPlaceError = true;
              Alert.error(this.context.intl.formatMessage({ id: 'notUseMarketplaceDomainError' }));
            } if (!this.state.domainId && !this.state.marketPlace) {
              this.marketPlaceError = true;
              Alert.error(this.context.intl.formatMessage({ id: 'notUseMarketplaceCheckboxError' }));
            } else {
              this.marketPlaceError = true;
              Alert.error(this.context.intl.formatMessage({ id: 'notUseMarketplaceError' }));
            }

            if (this.marketPlaceError === true) {
              this.props.history.push('/project/' + this.props.projectId + '/product/' + this.props.productId + '/edit');
            }
          }
        });
      }
    });
  }

  getMarketplaceSlots() {
    this.setState({ loaded: false });
    Meteor.call('getMarketplaceProductsSlots', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        if (res && res.marketPlaceSlotsData) {
          const isCurrentProductHasSlot = (Object.keys((res.marketPlaceSlotsData || []).find(prod => prod._id === this.props.productId) || {}) || []).length > 0;
          this.setState({ isCurrentProductHasSlot });
        }
        this.setState({ ...res });
      }
    });
  }

  /**
   * Get All The Reviews By ProductId
   */
  getAllReviews() {
    this.setState({ loaded: false });
    Meteor.call('getProductReviews', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ allReviews: res });
      }
    });
  }

  /**
   * Handle/Save Marketplace Data in Products Collections
   */
  handleMarketplaceSubmit(e) {
    e.preventDefault();

    const { intl } = this.context;

    this.setState({ loaded: false });
    const doc = _.pick(this.state, ['marketPlaceSettings']);

    if (doc.marketPlaceSettings && Object.keys(doc.marketPlaceSettings || {}).length && (doc.marketPlaceSettings.minSales && doc.marketPlaceSettings.minSales <= 0) || (!doc.marketPlaceSettings.minSales)) {
      doc.marketPlaceSettings.minSales = '0';
    }

    Products.update((this.props.productId || ''), {
      $set: Object.assign({
        updatedAt: new Date()
      }, doc)
    }, (err) => {
      Alert.closeAll();
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'marketplaceSaved' }));
      }
    });
    this.setState({ loaded: true });
  }

  /**
   * Manage Change the Marketplace Events
   */
  handleMarketplaceChange(e) {
    const marketPlaceSettings = this.state.marketPlaceSettings || {};
    marketPlaceSettings[e.target.name] = e.target.value;
    this.setState({ marketPlaceSettings });
  }

  /**
   * Manage Change of the Image
   */
  handleMarketPlaceImgurl(name, value) {
    const marketPlaceSettings = this.state.marketPlaceSettings || {};
    marketPlaceSettings[name] = value;
    this.setState({ marketPlaceSettings });
  }

  /**
   * Manage Change of the Language
   */
  handleMarketplaceLanguages(name, value) {
    const marketPlaceSettings = this.state.marketPlaceSettings || {};
    marketPlaceSettings[name] = value.map(val => val.value);
    this.setState({ marketPlaceSettings });
  }

  /**
   * Add New Images at MarketplaceSettings ProductImages
   */
  addImages() {
    const marketPlaceSettings = this.state.marketPlaceSettings || {};
    const productImages = (this.state.marketPlaceSettings || {}).productImages || [];
    productImages.push('');
    if (productImages) {
      marketPlaceSettings.productImages = productImages;
    }
    this.setState({ marketPlaceSettings });
  }

  /**
   * Handle Change in the Product image of the MarketplaceSettings
   */
  handleProductImageChange(value, index) {
    const marketPlaceSettings = this.state.marketPlaceSettings || {};
    const productImages = (this.state.marketPlaceSettings || {}).productImages || [];
    productImages[index] = value;
    if (productImages) {
      marketPlaceSettings.productImages = productImages;
    }
    this.setState({ marketPlaceSettings });
  }

  /**
   * Remove the MarketplaceSettings Product Image by index
   */
  removeProductImage(index) {
    const marketPlaceSettings = this.state.marketPlaceSettings || {};
    const productImages = (this.state.marketPlaceSettings || {}).productImages || [];
    productImages.splice(index, 1);
    if (productImages) {
      marketPlaceSettings.productImages = productImages;
    }
    this.setState({ marketPlaceSettings });
  }

  /**
   * Remove The Review From Collection By Id
   */
  removeReview(reviewId, productId) {
    const { intl } = this.context;

    if (reviewId) {
      this.setState({ loaded: false });
      Meteor.call('removeReview', (reviewId || ''), (productId || ''), (err) => {
        this.setState({ loaded: true });
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'reviewApproved' }));
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'noReviewFound' }));
    }
    this.setState({ loaded: true });
    this.getAllReviews();
  }

  /**
   * Verify Review for the product from productId
   */
  verifyReview(reviewId, productId) {
    const { intl } = this.context;

    if (reviewId) {
      Meteor.call('verifyReview', (reviewId || ''), (productId || ''), (err) => {
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
    this.getAllReviews();
  }

  popupCenter(url, title, w, h) {
    const dualScreenLeft = typeof window.screenLeft !== 'undefined' ? window.screenLeft : screen.left;
    const dualScreenTop = typeof window.screenTop !== 'undefined' ? window.screenTop : screen.top;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const left = ((width / 2) - (w / 2)) + dualScreenLeft;
    const top = ((height / 2) - (h / 2)) + dualScreenTop;
    const newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    if (window.focus) {
      newWindow.focus();
    }

    return newWindow;
  }

  setPayment() {
    this.setState({ showPurchaseModal: false, selectedSlot: undefined, selectedPlan: undefined });
    const { id } = this.state.selectedPlan || {};
    this.popupCenter('/settings/' + this.props.productId + '/' + Meteor.userId() + '/plan/' + id + '/' + (window.location.search || ''));
  }

  handleChange(e) {
    this.setState({ [e.target.name]: silderPlans[e.target.value] })
  }

  render() {
    const availableSlotOptions = (this.state.availableSlots || []).map(prod => ({
      label: prod,
      value: prod
    }));

    const plansOptions = (silderPlans || []).map(plan => ({
      label: `${plan.amount} Euro for ${plan.time} ${plan.cycle}`,
      value: plan
    }));

    return (
      <div>
        <Helmet title="MarketPlace" />
        <div className="content">
          <div className="container-fluid">
            <div className="page-header">
              <h1 className="h5 m-0"><FormattedMessage id="editProduct" />{this.state.name ? `: ${this.state.name}` : ''}</h1>
            </div>

            <Loader loaded={this.state.loaded}>
              <ProjectTabs projectId={this.props.projectId} marketPlace>
                <div className="card-header bg-white">
                  <ProductTabs projectId={this.props.projectId} productId={this.props.productId} />
                </div>
                <div className="card-header border-0 py-3">
                  <ul className="nav nav-pills settings-tabs">
                    <li className="nav-item mr-2">
                      <div className={this.state.marketPlaceSettingSetps === 1 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 1 })}>1. GENERAL</div>
                    </li>
                    <li className="nav-item mr-2">
                      <div className={this.state.marketPlaceSettingSetps === 2 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 2 })}>2. DESCRIPTION</div>
                    </li>
                    <li className="nav-item mr-2">
                      <div className={this.state.marketPlaceSettingSetps === 3 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 3 })}>3. IMAGES</div>
                    </li>
                    <li className="nav-item mr-2">
                      <div className={this.state.marketPlaceSettingSetps === 4 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 4 })}>4. REVIEWS</div>
                    </li>
                    <li className="nav-item mr-2">
                      <div className={this.state.marketPlaceSettingSetps === 5 ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({ marketPlaceSettingSetps: 5 })}>5. PURCHASE</div>
                    </li>
                  </ul>
                </div>

                <fieldset>
                  <form onSubmit={this.handleMarketplaceSubmit} className="form-horizontal0">
                    <div className="card-body">
                      {this.state.marketPlaceSettingSetps === 1 ?
                        <React.Fragment>
                          <div className="row">
                            <div className="col-xl-8">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className={((this.state.marketPlaceSettings || {})).name ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="name" /></label>
                                    <input type="text" name="name" className="form-control form-control-lg" value={((this.state.marketPlaceSettings || {})).name} onChange={this.handleMarketplaceChange} required />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className={((this.state.marketPlaceSettings || {})).company ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="company" /></label>
                                    <input type="text" name="company" className="form-control" value={(this.state.marketPlaceSettings || {}).company} onChange={this.handleMarketplaceChange} />
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className={((this.state.marketPlaceSettings || {})).imageUrl ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="image" /></label>
                                    <UploadInput noEditor value={(this.state.marketPlaceSettings || {}).imageUrl} onChange={value => this.handleMarketPlaceImgurl('imageUrl', value)} />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className={((this.state.marketPlaceSettings || {})).backgroundImageUrl ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="backgroundImage" /></label>
                                    <UploadInput noEditor value={(this.state.marketPlaceSettings || {}).backgroundImageUrl} onChange={value => this.handleMarketPlaceImgurl('backgroundImageUrl', value)} />
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className={((this.state.marketPlaceSettings || {})).minSales ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="minSales" /></label>
                                    <input type="number" name="minSales" className="form-control form-control-lg" value={((this.state.marketPlaceSettings || {})).minSales} onChange={this.handleMarketplaceChange} required />
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
                                  <div className={((this.state.marketPlaceSettings || {})).category ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="category" /></label>
                                    <div className="col-md-50">
                                      <select name="category" className="custom-select custom-select-lg " value={(this.state.marketPlaceSettings || {}).category} onChange={this.handleMarketplaceChange}>
                                        <option value="" />
                                        <option value="category1">Category 1</option>
                                        <option value="category2">Category 2</option>
                                        <option value="category3">Category 3</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className={((this.state.marketPlaceSettings || {})).description ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                    <label className="control-label"><FormattedMessage id="descriptionText" /></label>
                                    <div className="col-md-50">
                                      <textarea name="description" rows={5} className="form-control form-control-lg" value={(this.state.marketPlaceSettings || {}).description} onChange={this.handleMarketplaceChange} required />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </React.Fragment> : null}

                      {this.state.marketPlaceSettingSetps === 3 ?
                        <React.Fragment>
                          <div className="row">
                            <div className="col-xl-8">
                              <div className="row">
                                <div className="col-md-5 mb-4">
                                  <button type="button" className="btn btn-outline-primary" onClick={() => this.addImages()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addProductImages" /></button>
                                </div>
                              </div>

                              <div className="row">
                                {(this.state.marketPlaceSettings || {}).productImages && (this.state.marketPlaceSettings || {}).productImages.length ? (this.state.marketPlaceSettings || {}).productImages.map((image, index) => (
                                  <div key={index} className="col-md-6 product-images">
                                    <div className={image ? 'form-group form-group-material has-value' : 'form-group form-group-material'}>
                                      <label className="control-label">Image {index + 1}</label>
                                      <UploadInput noEditor value={image} onChange={value => this.handleProductImageChange(value, index)} />
                                      <button type="button" className="btn btn-outline-primary rounded-circle product-images-delete-btn" onClick={() => this.removeProductImage(index)}><i className="fa fa-trash font-size-12" /></button>
                                    </div>
                                  </div>
                                )) : null}
                              </div>
                            </div>
                          </div>
                        </React.Fragment> : null}

                      {this.state.marketPlaceSettingSetps === 4 ?
                        <React.Fragment>
                          <ul className="list-group list-group-flush my-n3">
                            {this.state.allReviews && this.state.allReviews.length ? this.state.allReviews.map((review, index) => (
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
                                    <span className="badge badge-success text-white ml-auto"><i className="fa fa-check mr-1" /> <FormattedMessage id="verified" /></span>
                                    :
                                    <Confirm
                                      onConfirm={() => this.verifyReview(review._id, review.productId)}
                                      body={<FormattedMessage id="approveReviewBodyText" />}
                                      confirmText={<FormattedMessage id="approve" />}
                                      cancelText={<FormattedMessage id="approveReviewAbortText" />}
                                      title={<FormattedMessage id="approveReviewTitleText" />}
                                    >
                                      <button type="button" className="btn btn-outline-success btn-sm" ><i className="fa fa-check" /></button>
                                    </Confirm>
                                  }

                                  <Confirm
                                    onConfirm={() => this.removeReview(review._id, review.productId)}
                                    body={<FormattedMessage id="deleteReviewBodyText" />}
                                    confirmText={<FormattedMessage id="remove" />}
                                    cancelText={<FormattedMessage id="deleteReviewAbortText" />}
                                    title={<FormattedMessage id="deleteReviewTitleText" />}
                                  >
                                    <button type="button" className="btn btn-outline-danger btn-sm ml-2"><i className="fa fa-trash" /></button>
                                  </Confirm>
                                </div>
                              </li>
                            )) :
                              <span className="text-center">
                                <FormattedMessage id="noRatings" />
                              </span>
                            }
                          </ul>
                        </React.Fragment> : null}

                      {this.state.marketPlaceSettingSetps === 5 ?
                        <React.Fragment>
                          {this.state.isCurrentProductHasSlot ?
                            <React.Fragment>
                              <div className="text-center">
                                This Product Already Has a Slot
                              </div>
                            </React.Fragment> :
                            <React.Fragment>
                              {(this.state.assignedSlotCounts || 0) < 11 ?
                                <div className="text-center">
                                  <button type="button" className="btn btn-outline-primary" onClick={() => this.setState({ showPurchaseModal: true })} >Go to Purchase</button>
                                </div> :
                                <div className="text-center">
                                  <span> All Slots are Purchased Wait For Slots To be Available </span>
                                </div>
                              }
                            </React.Fragment>
                          }
                        </React.Fragment> : null}
                    </div>

                    {this.state.marketPlaceSettingSetps === 4 || this.state.marketPlaceSettingSetps === 5 ? null :
                      <div className="card-footer text-right">
                        <button type="submit" className="btn btn-primary" disabled={this.state.marketPlaceSettingSetps === 1 || this.state.marketPlaceSettingSetps === 2}><FormattedMessage id="saveMarketplace" /></button>
                      </div>}
                  </form>
                </fieldset>

              </ProjectTabs>
            </Loader>
          </div>
          <Modal isOpen={this.state.showPurchaseModal} toggle={() => this.setState({ showPurchaseModal: false })}>
            <ModalHeader toggle={() => this.setState({ showPurchaseModal: false })}>
              <FormattedMessage id="purchaseSlot" />
            </ModalHeader>
            <ModalBody>
              <div className="row mt-2">
                <div className="col-md-4">
                  <FormattedMessage id="selectPlan" />:
                </div>
                <div className="col-md-8">
                  <Select
                    value={this.state.selectedPlan ? ((plansOptions || []).find(prod => (prod.value || {}).id === (this.state.selectedPlan || {}).id) || null) : null}
                    onChange={val => this.setState({ selectedPlan: val ? (val.value || null) : null })}
                    options={plansOptions}
                    placeholder={this.context.intl.formatMessage({ id: 'selectPlan' })}
                    theme={reactSelectStyle.theme}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button type="button" className="btn btn-primary font-weight-bold" onClick={() => this.setPayment()}><FormattedMessage id="bookSlot" /></button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    );
  }
}

MarketPlaceProfileSettings.propTypes = {
  projectId: PropTypes.string.isRequired
};

MarketPlaceProfileSettings.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const projectId = match.params.projectId;
  const productId = match.params.productId;

  return {
    projectId,
    productId
  };
}, connect(
  state => pick(state, ['userLocale'])
)(MarketPlaceProfileSettings));
