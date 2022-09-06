import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { FormattedMessage } from 'react-intl';

import Products from 'meteor/affilihero-lib/collections/products';

import UploadInput from '../uploadInput';
import InfoTooltip from '../infoTooltip';
import ExternalProviderSelectionSingle from '../settings/externalProviders/selectionSingle';
import Loader from '../loader';
import reactSelectStyle from '../../utils/reactSelectStyle';
import ProjectTabs from '../projects/projectTabs';
import ProductTabs from './productTabs';

class EditProduct extends React.Component {
  constructor(props) {
    super(props);
    this.isPlansAvailable = true;

    this.defaultState = {
      name: '',
      loaded: true,
      productId: props.productId,
      settingsTab: 'general',
      marketPlace: true,
      publicVisible: true
    };

    this.state = Object.assign({}, { create: this.props.match.params.id && this.props.match.params.id === 'new' }, this.defaultState);

    this.getProductById = this.getProductById.bind(this);
    this.setDomain = this.setDomain.bind(this);
    this.setToplist = this.setToplist.bind(this);
    this.getDigistore24Products = this.getDigistore24Products.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateExternalProvider = this.updateExternalProvider.bind(this);
    this.handleHtmlChange = this.handleHtmlChange.bind(this);
    this.addPrizes = this.addPrizes.bind(this);
    this.removePrizes = this.removePrizes.bind(this);
    this.handlePrizes = this.handlePrizes.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.manageMarketplace = this.manageMarketplace.bind(this);

  }

  componentDidMount() {
    this.setInitialState();
  }

  componentWillReceiveProps(nextProps) {
    const create = !nextProps.match.params.id || nextProps.match.params.id === 'new';
    this.setState({ create });
    this.setInitialState();
  }

  /**
   * Get The Projects By Id and Manage Digistore products
   */
  getProductById() {
    this.setState({ loaded: false });
    Meteor.call('getProductById', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ ...res }, () => {
          this.getDigistore24Products(this.state.externalProviderId || '');
          this.getDigistoreProductPaymentPlans(this.state.digistore24ProdsuctId || '', this.state.externalProviderId || '');
        });
      }
    });
  }

  /**
   * Set the Options of the Domains for the select Domain
   */
  setDomain() {
    this.setState({ loaded: false });
    Meteor.call('getDomainSelectOptions', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ domainsOption: res });
      }
    });
  }

  /**
 * Set the Options of the Toplist for the select Toplist
 */
  setToplist() {
    this.setState({ loaded: false });
    Meteor.call('getToplistSelectOptions', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ toplistsOption: res });
      }
    });
  }

  /**
 * retrive the Digistore24 Products based on ProviderId
 */
  getDigistore24Products(id) {
    this.setState({ loading: false });
    Meteor.call('getDigistore24Products', (id || ''), (err, order) => {
      this.setState({ loading: true });
      if (order) {
        const options = order.map(data => ({
          value: data.id,
          label: data.name
        }));
        this.setState({ digistore24Products: (options || []) });
      } else if (err) {
        Alert.error(err.reason || err.message);
      }
    });
  }
  /**
   * Manage Submit of the Project and call Save Method to save data in Project Collection
   */
  handleSubmit(e) {
    e.preventDefault();

    this.save();
    this.setState({ create: false });
  }

  /**
   * Update External Provider
   */
  updateExternalProvider(id) {
    this.setState({ externalProviderId: id, loaded: false });
    if (this.props.id) {
      Products.update(this.props.id, { $set: { externalProviderId: id } });
    }

    this.setState({ loaded: true });
    this.getDigistore24Products(id);
  }

  setInitialState() {
    this.getProductById();
    this.setDomain();
    this.setToplist();
  }

  /**
 * Manage Change of State Variables
 */
  handleHtmlChange(name, value) {
    this.setState({ [name]: value });
  }

  /**
 * Add New Prizes
 */
  addPrizes() {
    const prizes = this.state.prizes || [];
    prizes.push({ name: 'Prize Name', points: 0 });
    this.setState({ prizes });
  }

  /**
   * Remove Prizes by Index
   */
  removePrizes(index) {
    const prizes = this.state.prizes || [];
    prizes.splice(index, 1);
    this.setState({ prizes });
  }

  /**
   * Handle Change in Prizes
   */
  handlePrizes(index, name, value) {
    const prizes = this.state.prizes || [];
    prizes[index][name] = value;
    this.setState({ prizes });
  }

  getDigistoreProductPaymentPlans() {
    Meteor.call('getDigistore24ProductPaymentPlans', (this.state.digistore24ProductId || ''), (this.state.externalProviderId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        this.isPlansAvailable = false;
        Alert.error(err.reason || err.message);
      } else {
        const paymentPlansOptions = (res || []).map(plan => ({ label: plan.description || (plan.rendered_texts || {}).description || '', value: plan.id }));
        if (paymentPlansOptions && paymentPlansOptions.length) {
          this.isPlansAvailable = true;
        }

        this.setState({ paymentPlansOptions });
      }
    });
  }

  handleDigistore24ProductsChange(value) {
    this.setState({ digistore24ProductId: value, loaded: true }, () => {
      this.getDigistoreProductPaymentPlans();
    });
  }

  handleWelcomeUrl(value) {
    let welcomeVideo = this.state.welcomeVideo || {};
    if ((value || '').indexOf('youtu.be') >= 0 || (value || '').indexOf('youtube.com') >= 0) {
      const youtubeRegx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      const videoId = value.match(youtubeRegx) && value.match(youtubeRegx)[1] ? value.match(youtubeRegx)[1] : '';
      welcomeVideo.url = value;
      welcomeVideo.embedUrl = `https://www.youtube.com/embed/${videoId}`;
      welcomeVideo.type = 'youtube';
    } else if ((value || '').indexOf('vimeo.com') >= 0) {
      const vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
      const videoId = value.match(vimeoRegex) && value.match(vimeoRegex)[1] ? value.match(vimeoRegex)[1] : '';
      welcomeVideo.url = value;
      welcomeVideo.embedUrl = `https://player.vimeo.com/video/${videoId}`;
      welcomeVideo.type = 'vimeo';
    } else {
      welcomeVideo.url = value;
      welcomeVideo.embedUrl = undefined;
      welcomeVideo.type = undefined;
    }

    this.setState({ welcomeVideo });
  }

  /**
   * Save The Project Data
   */
  save() {
    const { projectId, productId } = this.props;
    const { intl } = this.context;

    const doc = _.pick(this.state, ['name', 'image', 'variants', 'productDescription', 'emailTemplates', 'productIds', 'domainId', 'domaintld', 'banners', 'links', 'shareFacebook', 'shareWhatsapp', 'shareTwitter', 'privacyPolicyUrl', 'imprintUrl', 'headerColor', 'buttonColor', 'textColorOne', 'textColorTwo', 'backgroundColorOne', 'backgroundColorTwo', 'footerColor', 'templateColor', 'productImage', 'toplistId', 'priceMacBook', 'priceIphone', 'prizes', 'slug', 'digistore24ProductId', 'digistore24ProductIds', 'externalProviderId', 'marketPlace', 'optinCode', 'welcomeVideo', 'showEventLink', 'trainingLink', 'trainingText', 'publicVisible', 'paymentPlanId']);
    this.setState({ loaded: true });

    const { digistore24Products, digistore24ProductId } = this.state;

    let name;
    (digistore24Products || []).forEach((product) => {
      if (product.value === digistore24ProductId) {
        name = product.label;
      }
    });

    if (name) {
      doc.name = name;
    }

    if (this.props.projectId) {
      doc.projectId = this.props.projectId;
    }

    /**
     * Manage the Sortable element and remove the chosen and selected data while Save in the Collection
     */
    if (this.state.emailTemplates && this.state.emailTemplates.length) {
      const emailTemplates = this.state.emailTemplates.map(emailTemplate => _.omit(emailTemplate, ['chosen', 'selected']));
      doc.emailTemplates = emailTemplates;
    }

    if (this.state.links && this.state.links.length) {
      const links = this.state.links.map(link => _.omit(link, ['chosen', 'selected']));
      doc.links = links;
    }

    if (this.state.banners && this.state.banners.length) {
      const banners = this.state.banners.map(banner => _.omit(banner, ['chosen', 'selected']));
      doc.banners = banners;
    }

    const newProduct = Object.assign({}, doc, { projectId: this.props.projectId, userId: Meteor.user().subUser ? Meteor.user().parentUserId : Meteor.userId(), createdAt: new Date(), updatedAt: new Date(), createdBySubUser: !!Meteor.user().subUser });

    if (this.state.create) {
      const id = Products.insert(
        newProduct
        , (err) => {
          if (err) {
            Alert.error(err.reason || err.message);
          } else {
            Alert.success(intl.formatMessage({ id: 'projectCreated' }));
          }
        });
      if (id) {
        if (Meteor.user().subUser) {
          Meteor.call('updateSubUsersProjectIds', (id || ''), (err) => {
            this.setState({ loaded: true });
            if (err) {
              Alert.error(err.reason || err.message);
            }
          });
        }
        this.setState({ loaded: true });
        this.props.history.push('/project/' + this.props.projectId + '/product/' + id + '/edit');
      }
    } else {
      Products.update(productId, {
        $set: Object.assign({
          updatedAt: new Date()
        }, doc)
      }, (err) => {
        Alert.closeAll();
        this.setState({ loaded: true });
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'projectSaved' }));
        }
      });
    }
  }

  /**
   * Handle change of the User Inputes/Update
   */
  handleChange(e) {
    const state = {};
    if (e.target.type === 'number') {
      state[e.target.name] = parseInt(e.target.value, 10);
    } else {
      state[e.target.name] = e.target.value;
    }
    this.setState(state);
  }

  /**
   * Manage marketplace if Domain is selected
   */
  manageMarketplace() {
    if (this.state.domainId && this.state.domaintld && (this.state.domainId != '' && this.state.domaintld != '')) {
      this.setState({ marketPlace: false });
    } else {
      this.setState({ marketPlace: true });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Helmet title={'Edit Product'} />
        <div className="content">
          <div className="container-fluid">
            <Loader loaded={this.state.loaded}>
              <React.Fragment>
                <div className="page-header">
                  <h1 className="h5 m-0"><FormattedMessage id="editProduct" />{this.state.name ? `: ${this.state.name}` : ''}</h1>
                </div>
                <ProjectTabs projectId={this.props.projectId}>
                  <div className="card-header py-3 bg-white">
                    <ProductTabs projectId={this.props.projectId} productId={this.props.productId} create={this.state.create} />
                  </div>
                  <div className="card">

                    <form className="form-horizontal" onSubmit={this.handleSubmit}>
                      <div className="card-body">
                        <div className="mt-3">
                          <Loader loaded={this.state.loading} >

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="selectProvider" />
                                <InfoTooltip id="selectProvider"><FormattedMessage id="selectExternalProviderTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5">
                                <ExternalProviderSelectionSingle
                                  className="form-control"
                                  type="digistore24"
                                  value={this.state.externalProviderId || ''}
                                  onChange={externalProviderId => this.updateExternalProvider(externalProviderId || '')}
                                />
                              </div>
                            </div>

                            {this.state.digistore24Products ?
                              <React.Fragment>
                                <div className="form-group row">
                                  <label className="control-label col-md-3 text-md-right">
                                    <FormattedMessage id="selectProduct" />
                                    <InfoTooltip id="selectProduct"><FormattedMessage id="selectProductsTooltip" /></InfoTooltip>
                                  </label>
                                  <div className="col-md-5">
                                    <Select
                                      value={this.state.digistore24ProductId ? ((this.state.digistore24Products || []).find(prod => prod.value === this.state.digistore24ProductId) || '') : ''}
                                      onChange={val => this.handleDigistore24ProductsChange(val.value || null)}
                                      options={this.state.digistore24Products}
                                      placeholder={this.context.intl.formatMessage({ id: 'selectProduct' })}
                                      theme={reactSelectStyle.theme}
                                    />
                                  </div>
                                </div>
                              </React.Fragment> : null}

                            {(this.state.toplistsOption && (this.state.toplistsOption || []).length) ?
                              <div className="form-group row">
                                <label className="control-label col-md-3 text-md-right">
                                  <FormattedMessage id="selectToplist" />
                                  <InfoTooltip id="selectToplist"><FormattedMessage id="selectToplistTooltip" /></InfoTooltip>
                                </label>
                                <div className="col-md-5">
                                  <Select
                                    value={this.state.toplistId ? ((this.state.toplistsOption || []).find(prod => prod.value === this.state.toplistId) || null) : null}
                                    onChange={val => this.setState({ toplistId: val ? (val.value || null) : null })}
                                    options={this.state.toplistsOption}
                                    theme={reactSelectStyle.theme}
                                    placeholder={this.context.intl.formatMessage({ id: 'selectToplist' })}
                                    isClearable
                                  />
                                </div>
                              </div> : null}

                            {this.isPlansAvailable && this.state.paymentPlansOptions && this.state.paymentPlansOptions.length ?
                              <div className="form-group row">
                                <label className="control-label col-md-3 text-md-right">
                                  <FormattedMessage id="selectPlans" />
                                  <InfoTooltip id="selectPlans"><FormattedMessage id="selectPlansTooltip" /></InfoTooltip>
                                </label>
                                <div className="col-md-5">
                                  <Select
                                    value={this.state.paymentPlanId ? ((this.state.paymentPlansOptions || []).find(prod => prod.value === this.state.paymentPlanId) || null) : null}
                                    onChange={val => this.setState({ paymentPlanId: val ? (val.value || null) : null })}
                                    options={this.state.paymentPlansOptions || []}
                                    theme={reactSelectStyle.theme}
                                    placeholder={this.context.intl.formatMessage({ id: 'selectPlan' })}
                                  />
                                </div>
                              </div> : null}

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="logo" />
                                <InfoTooltip id="logo"><FormattedMessage id="logoTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5">
                                <UploadInput noEditor value={this.state.productImage || ''} onChange={logo => this.setState({ productImage: logo })} />
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="productDescription" />
                                <InfoTooltip id="logo"><FormattedMessage id="productDescriptionTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5">
                                <textarea
                                  className="form-control"
                                  data-title="body"
                                  value={this.state.productDescription}
                                  onChange={event => this.setState({ productDescription: event.target.value })}
                                />
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="marketPlace" />
                                <InfoTooltip id="marketPlace"><FormattedMessage id="productMarketplaceTooptip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5">
                                <div className="d-flex flex-wrap align-items-center mt-1">
                                  <label className="checkbox-container mr-3">
                                    <input type="checkbox" checked={!!this.state.marketPlace} onChange={e => this.setState({ marketPlace: e.target.checked })} />
                                    <span className="checkmark" />
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="publicVisible" />
                                <InfoTooltip id="publicVisible"><FormattedMessage id="publicVisibleToolTip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5">
                                <div className="d-flex flex-wrap align-items-center mt-1">
                                  <label className="checkbox-container mr-3">
                                    <input type="checkbox" checked={!!this.state.publicVisible} onChange={e => this.setState({ publicVisible: e.target.checked })} />
                                    <span className="checkmark" />
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="domian" />
                                <InfoTooltip id="domian"><FormattedMessage id="domainInfoTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5">
                                <div className="row">
                                  <div className="col-md-12">
                                    <Select
                                      value={this.state.domainId ? ((this.state.domainsOption || []).find(prod => prod.value === this.state.domainId) || null) : null}
                                      onChange={val => this.setState({ domainId: val ? (val.value || '') : '', domaintld: val ? (val.label || '') : '' }, () => this.manageMarketplace())}
                                      options={this.state.domainsOption}
                                      placeholder={this.context.intl.formatMessage({ id: 'selectDomain' })}
                                      theme={reactSelectStyle.theme}
                                      isClearable
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="welcomeVideoUrl" />
                                <InfoTooltip id="welcomeVideoUrl"><FormattedMessage id="welcomeVideoUrlTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5 share-button">
                                <input type="url" data-title="welcomeVideoUrl" id="welcomeVideoUrl" value={(this.state.welcomeVideo || {}).url || ''} onChange={e => this.handleWelcomeUrl(e.target.value)} className="form-control" />
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="emailOptinHtmlCode" />
                              </label>
                              <div className="col-md-5">
                                <textarea
                                  className="form-control"
                                  data-title="body"
                                  value={this.state.optinCode}
                                  onChange={event => this.setState({ optinCode: event.target.value })}
                                />
                              </div>
                            </div>

                          </Loader>
                        </div>
                      </div>
                      <div className="card-footer text-right">
                        {this.state.create ? (
                          <Link to={'/project/' + (this.props.projectId || '') + '/products'} className="btn btn-secondary mr-2"><FormattedMessage id="cancle" /></Link>
                        ) : (
                          <button type="button" onClick={() => this.props.history.push('/project/' + (this.props.projectId || '') + '/products')} className="btn btn-secondary mr-2"><FormattedMessage id="back" /></button>
                        )}
                        <button type="submit" className="btn btn-primary"><FormattedMessage id="save" /></button>
                      </div>
                    </form>
                  </div>
                </ProjectTabs>
              </React.Fragment>
            </Loader>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

EditProduct.propTypes = {
  productId: PropTypes.string.isRequired
};

EditProduct.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const productId = match.params.id;
  const projectId = match.params.projectId;

  return {
    productId,
    projectId
  };
}, EditProduct);
