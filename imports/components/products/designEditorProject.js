import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import _ from 'lodash';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { ReactSortable } from 'react-sortablejs';

import Products from 'meteor/affilihero-lib/collections/products';

import DesignEditorSingle from './designEditorSingle';
import ProjectTabs from '../projects/projectTabs';
import ProductTabs from '../products/productTabs';
import Loader from '../loader';
import Confirm from '../confirm';
import Toplist from './toplist';

class Project extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: true,
      product: {}
    };

    this.getProducts = this.getProducts.bind(this);
    this.saveProduct = this.saveProduct.bind(this);
    this.addLinks = this.addLinks.bind(this);
    this.removeLinks = this.removeLinks.bind(this);
    this.addEmailTemplates = this.addEmailTemplates.bind(this);
    this.removeEmailTemplate = this.removeEmailTemplate.bind(this);
    this.addBanners = this.addBanners.bind(this);
    this.removeBanners = this.removeBanners.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.updateElement = this.updateElement.bind(this);
    this.showEditModel = this.showEditModel.bind(this);
  }

  componentDidMount() {
    this.getProducts();
  }

  /**
   * Get All the Products Which are connected to the User and set It's value in State.
   */
  getProducts() {
    this.setState({ loaded: false });
    Meteor.call('getProductById', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ product: res, ...res });
      }
    });
  }

  /**
   * Save The Product Collection Data
   */
  saveProduct() {
    const { productId } = this.props || {};
    const { intl } = this.context;

    const doc = _.pick(this.state, ['name', 'image', 'variants', 'productDescription', 'emailTemplates', 'productIds', 'domainId', 'domaintld', 'banners', 'links', 'shareFacebook', 'shareWhatsapp', 'shareTwitter', 'privacyPolicyUrl', 'imprintUrl', 'headerColor', 'buttonColor', 'textColorOne', 'textColorTwo', 'backgroundColorOne', 'backgroundColorTwo', 'footerColor', 'templateColor', 'projectLogo', 'toplistId', 'priceMacBook', 'priceIphone', 'prizes', 'slug', 'digistore24ProductIds', 'externalProviderId', 'marketPlace', 'affiliateLinkHeader', 'affiliateLinkInfo', 'digistore24IdInfo', 'emailTemplatesHeading', 'emailTemplatesInfo', 'bannersHeading', 'bannersInfo', 'digistoreLinkText', 'redirectToDigistoreText', 'privacyPolicy', 'imprint', 'affiliateToplistHeading', 'affiliateToplistInfo']);
    this.setState({ loaded: false });

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

  /**
   * Add New Links
   */
  addLinks() {
    const links = this.state.links || [];
    links.push({ link: ' ', id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) });
    this.setState({ links, product: Object.assign({}, (this.state.product || {}), { links }) });
  }

  /**
   * Remove Links By the Index
   */
  removeLinks(index) {
    const links = this.state.links || [];
    links.splice(index, 1);
    this.setState({ links, product: Object.assign({}, (this.state.product || {}), { links }) });
  }

  /**
   * Add New Email-Template
   */
  addEmailTemplates() {
    const emailTemplates = this.state.emailTemplates || [];
    emailTemplates.push({ title: 'Action By Affilihero', id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) });
    this.setState({ emailTemplates, product: Object.assign({}, (this.state.product || {}), { emailTemplates }) });
  }

  /**
   * Remove Email-Template By the Index
   */
  removeEmailTemplate(index) {
    const emailTemplates = this.state.emailTemplates || [];
    emailTemplates.splice(index, 1);
    this.setState({ emailTemplates, product: Object.assign({}, (this.state.product || {}), { emailTemplates }) });
  }

  /**
   * Add New Banner
   */
  addBanners() {
    const banners = this.state.banners || [];
    banners.push({ bannerImg: '', id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) });
    this.setState({ banners, product: Object.assign({}, (this.state.product || {}), { banners }) });
  }

  /**
   * Remove the Banner By the Index
   */
  removeBanners(index) {
    const banners = this.state.banners || [];
    banners.splice(index, 1);
    this.setState({ banners, product: Object.assign({}, (this.state.product || {}), { banners }) });
  }

  /**
   * Redirect to the Path
   */
  redirectTo(e, path) {
    e.stopPropagation();
    this.props.history.push(path);
  }

  /**
   * Update The Element of the Project
   */
  updateElement(key, value) {
    this.setState({ [key]: value, product: Object.assign({}, (this.state.product || {}), { [key]: value }) });
  }

  /**
   * Open edit Modal and set the State Data
   */
  showEditModel(e, type, template, index, field) {
    if (type === 'banners' || type === 'projectLogo') {
      this.isImageModal = true;
    } else {
      this.isImageModal = false;
    }

    this.setState({ showDesignElementSettings: true, type, template, index, field });
  }

  render() {
    return (
      <div>
        <Helmet title={'Design Editor'} />
        <Loader loaded={this.state.loaded} >
          {this.state.product && Object.keys(this.state.product || {}).length ?
            <style
              dangerouslySetInnerHTML={{
                __html: `
          :root {
            --header-color: ${this.state.headerColor || '#fff'};
            --footer-color: ${this.state.footerColor || '#292a2d'};
            --background-color-One: ${this.state.backgroundColorOne || '#eee'};
            --background-color-Two: ${this.state.backgroundColorTwo || '#fff'};
            --button-color: ${this.state.buttonColor || '#f12732'};
            --text-color-One: ${this.state.textColorOne || '#fff'};
            --text-color-Two: ${this.state.textColorTwo || '#212529'};
            --template-color: ${this.state.templateColor || '#fff'};
          }
          `
              }}
            /> :
            <style
              dangerouslySetInnerHTML={{
                __html: `
          :root {
            --header-color: '#fff'};
            --footer-color: '#292a2d'};
            --background-color-One: '#eee'};
            --background-color-Two: '#fff'};
            --button-color: '#f12732'};
            --text-color-One: '#fff'};
            --text-color-Two: '#212529'};
            --template-color: '#fff'};
          }
          `
              }}
            />
          }

          <div className="content app-custom-project">
            <div className="container-fluid">

              <div className="page-header d-flex flex-wrap align-items-center">
                <h1 className="h5 m-0 mr-auto"><FormattedMessage id="editProduct" />{this.state.name ? `: ${this.state.name}` : ''}</h1>
                <div className="design-editor-action-btn">
                  <Confirm
                    onConfirm={() => this.props.history.goBack()}
                    body={<FormattedMessage id="goToBackBodyText" />}
                    confirmText={<FormattedMessage id="back" />}
                    cancelText={<FormattedMessage id="goToBackAbortText" />}
                    title={<FormattedMessage id="goToBackTitleText" />}
                  >
                    <button type="button" className="btn btn-primary"><FormattedMessage id="back" /></button>
                  </Confirm>
                  <button type="button" onClick={() => this.saveProduct()} className="btn btn-primary ml-2"><FormattedMessage id="save" /></button>
                </div>
              </div>

              <ProjectTabs projectId={this.props.projectId} >
                <div className="card-header bg-white">
                  <ProductTabs projectId={this.props.projectId} productId={this.props.productId} />
                </div>

                <header>
                  <nav className="navbar d-flex align-items-center bg-white">
                    <div className="header-image">
                      <img src={this.state.projectLogo} height="40" alt="Header Logo" />
                      <div className="design-editor-actions header-image-actions">
                        <Button onClick={e => this.showEditModel(e, 'projectLogo', this.state.projectLogo)} ><i className="fa fa-pencil fa-fw" /></Button>
                      </div>
                    </div>
                    <button type="button" onClick={e => this.showEditModel(e, 'colorssettings')} className="btn btn-primary ml-2"><FormattedMessage id="editColors" /></button>
                    <div className="section-actions">
                      <Button onClick={e => this.showEditModel(e, 'headerColor', this.state.headerColor)}><i className="fa fa-pencil fa-fw" /></Button>
                    </div>
                  </nav>
                </header>

                <div className="page-content">
                  <div className="">

                    <div className="section section-padding bg-one" id="affiliateLinks">
                      <div className="section-container">
                        <div className="section-title text-center">
                          <h1 className="heading mb-3">
                            <div dangerouslySetInnerHTML={{ __html: this.state.affiliateLinkHeader || 'COPYWRITER COMPLETE PACKAGE' }} />
                            <div className="design-editor-actions">
                              <Button onClick={e => this.showEditModel(e, 'affiliateLinkHeader', this.state.affiliateLinkHeader)}><i className="fa fa-pencil fa-fw" /></Button>
                            </div>
                          </h1>
                          <p className="m-0">
                            <div dangerouslySetInnerHTML={{ __html: this.state.affiliateLinkInfo || 'Here are your affiliate links:' }} />
                            <div className="design-editor-actions">
                              <Button onClick={e => this.showEditModel(e, 'affiliateLinkInfo', this.state.affiliateLinkInfo)}><i className="fa fa-pencil fa-fw" /></Button>
                            </div>
                          </p>
                        </div>
                        <div className="section-inner-container">
                          <div className="affiliate-link-box">
                            <div className="d-flex align-items-center flex-wrap justify-content-center">
                              <div className="d-flex flex-wrap">
                                <h4 className="m-0 mr-2">
                                  <div dangerouslySetInnerHTML={{ __html: this.state.digistore24IdInfo || 'Enter your DigiStore24 ID to create your affiliate links:' }} />
                                  <div className="design-editor-actions">
                                    <Button onClick={e => this.showEditModel(e, 'digistore24IdInfo', this.state.digistore24IdInfo)}><i className="fa fa-pencil fa-fw" /></Button>
                                  </div>
                                </h4>
                                <div className="tooltip ml-2 mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" className="bi bi-info-circle" id="affiliateInfo" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                  </svg>
                                  <span className="tooltiptext">
                                    {'Digistore24 Id is replace "{{AFFILIATE}}" when you copy'}
                                  </span>
                                </div>
                              </div>
                              <input type="text" value={this.state.affiliateId} className="form-control" placeholder="Your DigiStore24 ID " />
                            </div>
                          </div>
                          <ReactSortable
                            list={this.state.links || []}
                            setList={newState => this.setState({ links: newState, product: Object.assign({}, (this.state.product || {}), { links: newState }) })}
                          >
                            {this.state.links && (this.state.links || []).map((link, index) => (
                              <div key={index} className="links mb-4">
                                <div className="d-flex flex-wrap align-items-center justify-content-md-center">
                                  <label className="m-0">Link {index + 1}:</label>
                                  <div className="links-input-container" >
                                    <div className="w-60 link-input" dangerouslySetInnerHTML={{ __html: link.link || '' }} />
                                    <div className="design-editor-actions">
                                      <Button onClick={e => this.showEditModel(e, 'links', link, index, 'link')}><i className="fa fa-pencil fa-fw" /></Button>
                                      <Button><i className="fa fa-close fa-fw" onClick={() => this.removeLinks(index)} /></Button>
                                    </div>
                                  </div>
                                  <button type="button" className="btn btn-primary">
                                    <span className="align-middle mr-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-link-45deg" viewBox="0 0 16 16">
                                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                                      </svg>
                                    </span>
                                    Copy link
                                  </button>
                                </div>
                              </div>
                            ))}
                          </ReactSortable>
                          <div className="text-center my-4">
                            <button type="button" className="btn btn-outline-primary btn-lg" onClick={() => this.addLinks()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addLink" /></button>
                          </div>
                          <div className="d-flex align-items-center justify-content-center affiliate-link">
                            <div className="affiliate-link-more-info-container">
                              <span className="more-info-affiliate-link" dangerouslySetInnerHTML={{ __html: this.state.redirectToDigistoreText || 'More information about the affiliate link:' }} />
                              <div className="design-editor-actions">
                                <Button onClick={e => this.showEditModel(e, 'redirectToDigistoreText', this.state.redirectToDigistoreText)} ><i className="fa fa-pencil fa-fw" /></Button>
                              </div>
                            </div>
                            <div className="digistore-link-container">
                              <span className="digistore-link d-flex align-items-center" dangerouslySetInnerHTML={{ __html: this.state.digistoreLinkText || 'To Digistore24' }} />
                              <div className="design-editor-actions">
                                <Button><i className="fa fa-pencil fa-fw" onClick={e => this.showEditModel(e, 'digistoreLinkText', this.state.digistoreLinkText)} /></Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="section-actions">
                        <Button onClick={e => this.showEditModel(e, 'backgroundColorOne', this.state.backgroundColorOne)}><i className="fa fa-pencil fa-fw" /></Button>
                      </div>
                    </div>

                    <div className="section section-padding bg-two" id="emailTemplate">
                      <div className="section-container">
                        <div className="section-title text-center">
                          <h1 className="heading mb-3">
                            <div dangerouslySetInnerHTML={{ __html: this.state.emailTemplatesHeading || 'EMAIL TEMPLATES' }} />
                            <div className="design-editor-actions">
                              <Button onClick={e => this.showEditModel(e, 'emailTemplatesHeading', this.state.emailTemplatesHeading)}><i className="fa fa-pencil fa-fw" /></Button>
                            </div>
                          </h1>
                          <p className="m-0">
                            <div dangerouslySetInnerHTML={{ __html: this.state.emailTemplatesInfo || 'Here are some email templates you can use with this product. You are cordially invited to make changes. Do not forget to include your affiliate links.' }} />
                            <div className="design-editor-actions">
                              <Button onClick={e => this.showEditModel(e, 'emailTemplatesInfo', this.state.emailTemplatesInfo)}><i className="fa fa-pencil fa-fw" /></Button>
                            </div>
                          </p>
                        </div>
                        <div className="section-inner-container mt-40">
                          <ReactSortable
                            list={this.state.emailTemplates || []}
                            setList={newState => this.setState({ emailTemplates: newState, product: Object.assign({}, (this.state.product || {}), { emailTemplates: newState }) })}
                            className="row justify-content-center"
                          >
                            {this.state.emailTemplates && (this.state.emailTemplates || []).map((template, index) => (
                              <div key={index} className="col-md-6 mb-4">
                                <div className="card email-template-box">
                                  <div className="card-body">
                                    <div className="email-template-header">
                                      <div className="email-template-title-container">
                                        <h2 className="email-template-title">
                                          <div dangerouslySetInnerHTML={{ __html: template.title }} />
                                        </h2>
                                        <div className="design-editor-actions">
                                          <Button onClick={e => this.showEditModel(e, 'emailTemplates', template, index, 'title')}><i className="fa fa-pencil fa-fw" /></Button>
                                        </div>
                                      </div>
                                      <h3 className="email-template-subject-title"><FormattedMessage id="subject" /></h3>
                                      <div className="email-template-subject-container">
                                        <p className="email-template-subject">
                                          <div dangerouslySetInnerHTML={{ __html: template.subject }} />
                                        </p>
                                        <div className="design-editor-actions">
                                          <Button onClick={e => this.showEditModel(e, 'emailTemplates', template, index, 'subject')}><i className="fa fa-pencil fa-fw" /></Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="email-template-content">
                                      <p className="email-template-body">
                                        <div dangerouslySetInnerHTML={{ __html: template.body }} />
                                      </p>
                                      <button type="button" className="btn btn-primary ">
                                        <span className="align-middle mr-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-link-45deg" viewBox="0 0 16 16">
                                            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                                            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                                          </svg>
                                        </span>
                                        Copy
                                      </button>
                                      <div className="design-editor-actions">
                                        <Button onClick={e => this.showEditModel(e, 'emailTemplates', template, index, 'body')}><i className="fa fa-pencil fa-fw" /></Button>
                                        <Button><i className="fa fa-close fa-fw" /></Button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section-actions email-box-actions">
                                    <Button onClick={e => this.showEditModel(e, 'templateColor', this.state.templateColor)}><i className="fa fa-pencil fa-fw" /></Button>
                                    <Button><i className="fa fa-close fa-fw" onClick={() => this.removeEmailTemplate(index)} /></Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </ReactSortable>
                          <div className="text-center">
                            <button type="button" className="btn btn-outline-primary btn-lg" onClick={() => this.addEmailTemplates()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addEmail" /></button>
                          </div>
                        </div>
                      </div>
                      <div className="section-actions">
                        <Button onClick={e => this.showEditModel(e, 'backgroundColorTwo', this.state.backgroundColorTwo)}><i className="fa fa-pencil fa-fw" /></Button>
                      </div>
                    </div>

                    <div className="section section-padding bg-one" id="banner">
                      <div className="section-container">
                        <div className="section-title text-center">
                          <h1 className="heading mb-3">
                            <div dangerouslySetInnerHTML={{ __html: this.state.bannersHeading || 'PROMOTIONAL BANNERS' }} />
                            <div className="design-editor-actions">
                              <Button onClick={e => this.showEditModel(e, 'bannersHeading', this.state.bannersHeading)}><i className="fa fa-pencil fa-fw" /></Button>
                            </div>
                          </h1>
                          <p className="m-0">
                            <div dangerouslySetInnerHTML={{ __html: this.state.bannersInfo || 'Use these banner ads on your blog, website, or in emails to get your target audience attention.' }} />
                            <div className="design-editor-actions">
                              <Button onClick={e => this.showEditModel(e, 'bannersInfo', this.state.bannersInfo)}><i className="fa fa-pencil fa-fw" /></Button>
                            </div>
                          </p>
                        </div>
                      </div>
                      <div className="section-inner-container">
                        <div className="container-fluid mt-40">
                          <ReactSortable
                            list={this.state.banners || []}
                            setList={newState => this.setState({ banners: newState, product: Object.assign({}, (this.state.product || {}), { banners: newState }) })}
                            className="row"
                          >
                            {this.state.banners && (this.state.banners || []).map((banner, index) => (
                              <div key={index} className="col-md-4 mb-4">
                                <div className="banner-box">
                                  <div className="banner-box-content">
                                    <h3 className="h5 text-center font-weight-normal">Banner {index + 1}</h3>
                                    <img src={banner.bannerImg || ''} className="image" alt="Banner" />
                                  </div>
                                  <div className="banner-box-button">
                                    {this.state.product.links && this.state.product.links[0] ?
                                      <React.Fragment>
                                        <div className="link-input" dangerouslySetInnerHTML={{ __html: this.state.links[0].link || '' }} />
                                        <button type="button" className="btn btn-primary">
                                          <span className="align-middle mr-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-link-45deg" viewBox="0 0 16 16">
                                              <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                                              <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                                            </svg>
                                          </span>
                                          Copy
                                        </button>
                                      </React.Fragment> : null}
                                    <button type="button" className={this.state.product.links && this.state.product.links[0] ? 'btn btn-primary' : 'btn btn-primary w-100'}>Download</button>
                                  </div>
                                  <div className="design-editor-actions">
                                    <Button onClick={e => this.showEditModel(e, 'banners', banner, index, 'bannerImg')}><i className="fa fa-pencil fa-fw" /></Button>
                                    <Button><i className="fa fa-close fa-fw" onClick={() => this.removeBanners(index)} /></Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </ReactSortable>
                        </div>
                        <div className="text-center">
                          <button type="button" className="btn btn-outline-primary btn-lg" onClick={() => this.addBanners()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addBanner" /></button>
                        </div>
                      </div>
                      <div className="section-actions">
                        <Button onClick={e => this.showEditModel(e, 'backgroundColorOne', this.state.backgroundColorOne)}><i className="fa fa-pencil fa-fw" /></Button>
                      </div>
                    </div>

                    {this.state.toplistId ?
                      <div className="section section-padding bg-two" id="toplist">
                        <div className="section-container">
                          <div className="section-title text-center">
                            <h1 className="heading mb-3">
                              <div dangerouslySetInnerHTML={{ __html: this.state.affiliateToplistHeading || 'AFFILIATE TOPLIST' }} />
                              <div className="design-editor-actions">
                                <Button onClick={e => this.showEditModel(e, 'affiliateToplistHeading', this.state.affiliateToplistHeading)}><i className="fa fa-pencil fa-fw" /></Button>
                              </div>
                            </h1>
                            <p className="m-0">
                              <div dangerouslySetInnerHTML={{ __html: this.state.affiliateToplistInfo || 'Affiliates who object to a publication are not included in this list and do not take part in the championship!' }} />
                              <div className="design-editor-actions">
                                <Button onClick={e => this.showEditModel(e, 'affiliateToplistInfo', this.state.affiliateToplistInfo)}><i className="fa fa-pencil fa-fw" /></Button>
                              </div>
                            </p>
                          </div>
                          <Toplist id={this.state.toplistId} affiliateToplistHeading={this.state.affiliateToplistHeading} affiliateToplistInfo={this.state.affiliateToplistInfo} />
                        </div>
                        <div className="section-actions">
                          <Button onClick={e => this.showEditModel(e, 'backgroundColorTwo', this.state.backgroundColorTwo)}><i className="fa fa-pencil fa-fw" /></Button>
                        </div>
                      </div> : null}

                    <div className="section section-padding bg-one" id="shareButtons">
                      <div className="section-inner-container">
                        {(this.state.product || {}).shareFacebook || (this.state.product || {}).shareTwitter || (this.state.product || {}).shareWhatsapp ?
                          <div className="container-fluid">
                            <ul className="list-inline social-icons text-center m-0">
                              {this.state.product && this.state.product.shareFacebook ?
                                <React.Fragment>
                                  <li className="list-inline-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                                    </svg>
                                  </li>
                                </React.Fragment> : null}

                              {this.state.product && this.state.product.shareWhatsapp ?
                                <React.Fragment>
                                  <li className="list-inline-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                    </svg>
                                  </li>
                                </React.Fragment> : null}

                              {this.state.product && this.state.product.shareTwitter ?
                                <React.Fragment>
                                  <li className="list-inline-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                                    </svg>
                                  </li>
                                </React.Fragment> : null}
                            </ul>
                          </div> :
                          <p className="text-center">
                            <FormattedMessage id="shareButtonDiv" />
                          </p>}
                      </div>
                      <div className="section-actions">
                        <Button><i className="fa fa-pencil fa-fw" onClick={e => this.showEditModel(e, 'shareButtons')} /></Button>
                      </div>
                    </div>

                  </div>

                  <footer>
                    <div className="container-fluid">
                      <div className="row align-items-center m-0">
                        <div className="col-3">
                          <div className="footer-logo">
                            <img src={this.state.projectLogo} height="40" alt="Footer Logo" />
                            <div className="design-editor-actions">
                              <Button><i className="fa fa-pencil fa-fw" onClick={e => this.showEditModel(e, 'projectLogo', this.state.projectLogo)} /></Button>
                            </div>
                          </div>
                        </div>
                        <div className="col-9">
                          <ul className="list-inline text-right m-0">
                            <li className="list-inline-item cms-link">
                              <div dangerouslySetInnerHTML={{ __html: this.state.privacyPolicy || 'PRIVACY' }} />
                              <div className="design-editor-actions">
                                <Button onClick={e => this.showEditModel(e, 'privacyPolicy', this.state.privacyPolicy)} ><i className="fa fa-pencil fa-fw" /></Button>
                              </div>
                            </li>
                            <li className="list-inline-item cms-link">
                              <div dangerouslySetInnerHTML={{ __html: this.state.imprint || 'IMPRINT' }} />
                              <div className="design-editor-actions">
                                <Button onClick={e => this.showEditModel(e, 'imprint', this.state.imprint)} ><i className="fa fa-pencil fa-fw" /></Button>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="section-actions">
                      <Button onClick={e => this.showEditModel(e, 'footerColor', this.state.footerColor)}><i className="fa fa-pencil fa-fw" /></Button>
                    </div>
                  </footer>

                </div>

              </ProjectTabs>
            </div>
          </div>

          <Modal className={this.isImageModal ? '' : 'modal-lg'} isOpen={this.state.showDesignElementSettings} toggle={() => this.setState({ showDesignElementSettings: false })}>
            <ModalHeader toggle={() => this.setState({ showDesignElementSettings: false })}>
              Design Editor
            </ModalHeader>
            <ModalBody>
              <DesignEditorSingle
                element={this.state.product}
                template={this.state.template}
                field={this.state.field}
                type={this.state.type}
                index={this.state.index}
                onChange={(field, data) => this.updateElement(field, data)}
              />
            </ModalBody>
            <ModalFooter>
              <button type="button" onClick={() => this.setState({ showDesignElementSettings: false })} className="btn btn-primary btn-lg"><FormattedMessage id="done" /></button>
            </ModalFooter>
          </Modal>
        </Loader>
      </div>
    );
  }
}

Project.propTypes = {
  projectId: PropTypes.string.isRequired
};

Project.contextTypes = {
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
}, Project);
