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

import Projects from 'meteor/affilihero-lib/collections/projects';

import HtmlEditor from '../htmlEditor';
import ColorInput from '../colorInput';
import UploadInput from '../uploadInput';
import ProjectTabs from './projectTabs';
import InfoTooltip from '../infoTooltip';
import Loader from '../loader';
import reactSelectStyle from '../../utils/reactSelectStyle';

class EditProject extends React.Component {
  constructor(props) {
    super(props);

    this.defaultState = {
      name: '',
      loaded: true,
      affiliateLink: '',
      invalidUrl: false,
      marketPlace: true,
      publicVisible: true,
      settingsTab: 'general'
    };

    this.state = Object.assign({}, { create: this.props.match.params.id && this.props.match.params.id === 'new' }, this.defaultState);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleHtmlChange = this.handleHtmlChange.bind(this);
    this.getProjectById = this.getProjectById.bind(this);
    this.handleHtmlChange = this.handleHtmlChange.bind(this);
    this.save = this.save.bind(this);
    this.setDomain = this.setDomain.bind(this);
    this.setProjects = this.setProjects.bind(this);
    this.setToplist = this.setToplist.bind(this);
  }

  componentDidMount() {
    this.setInitialState();
  }

  componentWillReceiveProps(nextProps) {
    const create = !nextProps.match.params.id || nextProps.match.params.id === 'new';
    this.setState({ create });
    this.setInitialState();
  }

  setInitialState() {
    this.getProjectById();
    this.setProjects();
    this.setToplist();
    this.setDomain();
    this.getDigistore24Products(this.state.externalProviderId || '');
  }

  /**
   * Get The Projects By Id
   */
  getProjectById() {
    this.setState({ loaded: false });
    Meteor.call('getProjectById', (this.props.projectId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ ...res }, () => this.getDigistore24Products(this.state.externalProviderId || ''));
      }
    });
  }

  /**
   * Handle The Change of State
   */
  handleHtmlChange(name, value) {
    this.setState({ [name]: value });
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
   * Set the Options of the Products for the select Product
   */
  setProjects() {
    this.setState({ loaded: false });
    Meteor.call('getProductSelectOptions', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ productsOption: res });
      }
    });
  }

  /**
   * Set the Options of the Toplist for the select Toplist
   */
  setToplist() {
    this.setState({ loaded: false });
    Meteor.call('getToplistSelectOptions', (this.props.projectId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ toplistsOption: res });
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
   * Handle the Submit Button of the Form
   */
  handleSubmit(e) {
    e.preventDefault();

    this.save();
    this.setState({ create: false });
  }

  /**
   * Save The Project Data
   */
  save() {
    const { projectId } = this.props;
    const { intl } = this.context;

    const doc = _.pick(this.state, ['name', 'image', 'variants', 'productDescription', 'emailTemplates', 'productIds', 'domainId', 'domaintld', 'banners', 'links', 'shareFacebook', 'shareWhatsapp', 'shareTwitter', 'privacyPolicyUrl', 'imprintUrl', 'headerColor', 'buttonColor', 'textColorOne', 'textColorTwo', 'backgroundColorOne', 'backgroundColorTwo', 'footerColor', 'templateColor', 'projectImage', 'projectLogo', 'backgroundImage', 'toplistId', 'priceMacBook', 'priceIphone', 'prizes', 'slug', 'digistore24ProductIds', 'externalProviderId', 'marketPlace', 'optinCode', 'welcomeVideo', 'showEventLink', 'trainingLink', 'trainingText', 'publicVisible', 'textColor', 'backgroundColor', 'liveTrainingText', 'liveTrainingVideos', 'linkColor', 'headerActiveLinkColor']);
    this.setState({ loaded: true });

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

    const newProject = Object.assign({}, doc, { userId: Meteor.user().subUser ? Meteor.user().parentUserId : Meteor.userId(), createdAt: new Date(), updatedAt: new Date(), createdBySubUser: !!Meteor.user().subUser });

    if (this.state.create) {
      const id = Projects.insert(
        newProject
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
        this.props.history.push('/project/' + id + '/edit');
      }
    } else {
      Projects.update(projectId, {
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
   * Handle The Change of State
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
   * Add New Email Template
   */
  addEmailTemplates() {
    const emailTemplates = this.state.emailTemplates || [];
    emailTemplates.push({ title: 'Action By Affilihero', id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) });
    this.setState({ emailTemplates });
  }

  /**
   * Remove the Email Template By index
   */
  removeEmailTemplate(index) {
    const emailTemplates = this.state.emailTemplates || [];
    emailTemplates.splice(index, 1);
    this.setState({ emailTemplates });
  }

  /**
   * Handle Change of the Email Templates
   */
  handleEmailTemplates(index, name, value) {
    const emailTemplates = this.state.emailTemplates || [];
    emailTemplates[index][name] = value;
    this.setState({ emailTemplates });
  }

  /**
  * Add New Live Video
  */
  addLiveVideos() {
    const liveTrainingVideos = this.state.liveTrainingVideos || [];
    liveTrainingVideos.push({ name: '', id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) });
    this.setState({ liveTrainingVideos });
  }

  /**
   * Remove the Live Video By index
   */
  removeLiveVideos(index) {
    const liveTrainingVideos = this.state.liveTrainingVideos || [];
    liveTrainingVideos.splice(index, 1);
    this.setState({ liveTrainingVideos });
  }

  /**
   * Handle Change of the Live Video
   */
  handleLiveVideos(index, name, value) {
    const liveTrainingVideos = this.state.liveTrainingVideos || [];

    if (name === 'url') {
      const liveVideo = this.handleLiveVideo(index, value);
      liveTrainingVideos[index] = liveVideo;
    } else {
      liveTrainingVideos[index][name] = value;
    }

    this.setState({ liveTrainingVideos });
  }

  handleLiveVideo(index, value) {
    let liveVideo = ((this.state.liveTrainingVideos || [])[index]) || {};
    if ((value || '').indexOf('youtu.be') >= 0 || (value || '').indexOf('youtube.com') >= 0) {
      const youtubeRegx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      const videoId = value.match(youtubeRegx) && value.match(youtubeRegx)[1] ? value.match(youtubeRegx)[1] : '';
      liveVideo.url = value;
      liveVideo.embedUrl = `https://www.youtube.com/embed/${videoId}`;
      liveVideo.type = 'youtube';
    } else if ((value || '').indexOf('vimeo.com') >= 0) {
      const vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
      const videoId = value.match(vimeoRegex) && value.match(vimeoRegex)[1] ? value.match(vimeoRegex)[1] : '';
      liveVideo.url = value;
      liveVideo.embedUrl = `https://player.vimeo.com/video/${videoId}`;
      liveVideo.type = 'vimeo';
    } else {
      liveVideo.url = value;
      liveVideo.embedUrl = undefined;
      liveVideo.type = undefined;
    }

    return liveVideo;
  }

  /**
   * Update External Provider
   */
  updateExternalProvider(id) {
    this.setState({ externalProviderId: id });
    if (this.props.projectId) {
      Projects.update(this.props.projectId, { $set: { externalProviderId: id } });
    }

    this.getDigistore24Products(id);
  }

  /**
  * retrive the Digistore24 Products based on ProviderId
  */
  getDigistore24Products(id) {
    Meteor.call('getDigistore24Products', (id || ''), (err, order) => {
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
      <div>
        <Helmet title={'Edit Project'} />
        <div className="content">
          <div className="container-fluid">

            <div className="page-header">
              <h1 className="h5 m-0"><FormattedMessage id="editProject" />{this.state.name ? `: ${this.state.name}` : ''}</h1>
            </div>

            <Loader loaded={this.state.loaded} >
              <ProjectTabs projectId={this.props.projectId} marketPlace={this.state.marketPlace}>
                <form className="form-horizontal" onSubmit={this.handleSubmit}>
                  <React.Fragment>
                    <div className="card-body">
                      <div className="mt-3">

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right"><FormattedMessage id="projectName" /></label>
                          <div className="col-md-5">
                            <input type="text" id="inputName" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} className="form-control" />
                          </div>
                        </div>

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
                                isClearable
                              />
                            </div>
                          </div> : null}

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="marketPlace" />
                            <InfoTooltip id="marketPlace"><FormattedMessage id="marketPlace" /></InfoTooltip>
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

                        {this.state.marketPlace ?
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
                          </div> : null}

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="logo" />
                            <InfoTooltip id="logo"><FormattedMessage id="logoTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5">
                            <UploadInput noEditor value={this.state.projectLogo || ''} onChange={logo => this.setState({ projectLogo: logo })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="image" />
                            <InfoTooltip id="image"><FormattedMessage id="imageTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5">
                            <UploadInput noEditor value={this.state.projectImage || ''} onChange={logo => this.setState({ projectImage: logo })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="backgroundImage" />
                            <InfoTooltip id="backgroundImage"><FormattedMessage id="backgroundImageTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5">
                            <UploadInput noEditor value={this.state.backgroundImage || ''} onChange={logo => this.setState({ backgroundImage: logo })} />
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

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="headerColor" />
                            <InfoTooltip id="headerColor"><FormattedMessage id="headerColorTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <ColorInput value={this.state.headerColor || ''} onChange={color => this.setState({ headerColor: color })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="footerColor" />
                            <InfoTooltip id="footerColor"><FormattedMessage id="footerColorTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <ColorInput value={this.state.footerColor || ''} onChange={color => this.setState({ footerColor: color })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="textColor" />
                            <InfoTooltip id="textColor"><FormattedMessage id="textColorTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <ColorInput value={this.state.textColor || ''} onChange={color => this.setState({ textColor: color })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="backgroundColor" />
                            <InfoTooltip id="backgroundColor"><FormattedMessage id="backgroundColorTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <ColorInput value={this.state.backgroundColor || ''} onChange={color => this.setState({ backgroundColor: color })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="linkColor" />
                            <InfoTooltip id="linkColor"><FormattedMessage id="linkColorTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <ColorInput value={this.state.linkColor || ''} onChange={color => this.setState({ linkColor: color })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="activelinkColor" />
                            <InfoTooltip id="activelinkColor"><FormattedMessage id="activelinkColorTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <ColorInput value={this.state.headerActiveLinkColor || ''} onChange={color => this.setState({ headerActiveLinkColor: color })} />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="liveTrainingText" />
                            <InfoTooltip id="liveTrainingText"><FormattedMessage id="liveTrainingTextTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5 share-button">
                            <HtmlEditor
                              content={this.state.liveTrainingText || ''}
                              onChange={content => this.setState({ liveTrainingText: content })}
                              config={{
                                toolbar1: 'insertfile undo redo | styleselect fontsizeselect | bold italic underline strikethrough removeformat forecolor backcolor textshadow bullist numlist outdent indent | link ',
                                fontsize_formats: '6px 8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px',
                                autoresize_max_height: undefined
                              }}
                            />
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
                            <FormattedMessage id="liveTrainingVideos" />
                            <InfoTooltip id="liveTrainingVideos"><FormattedMessage id="liveTrainingVideosTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5">
                            <button type="button" className="btn btn-outline-primary" onClick={() => this.addLiveVideos()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addVideo" /></button>
                          </div>
                        </div>

                        <div>
                          {(this.state.liveTrainingVideos || []).map((video, index) => (
                            <div key={index}>
                              <div className="form-group row">
                                <label className="control-label col-md-3 text-md-right">&nbsp;</label>
                                <div className="col-md-5">
                                  <div className="row">
                                    <div className="col-md-5">
                                      <input type="text" placeholder="Video Name" data-title="name" id="name" value={video.name} onChange={event => this.handleLiveVideos(index, event.target.dataset.title, event.target.value)} className="form-control" />
                                    </div>
                                    <div className="col-md-5">
                                      <div className="input-group">
                                        <input type="url" placeholder="Video Url" data-title="url" id="url" value={video.url} onChange={event => this.handleLiveVideos(index, event.target.dataset.title, event.target.value)} className="form-control" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <button type="button" className="btn btn-outline-primary" onClick={() => this.removeLiveVideos(index)}><i className="fa fa-trash font-size-12" /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="showEventLink" />
                            <InfoTooltip id="showEventLink"><FormattedMessage id="showEventLinkTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5">
                            <div className="d-flex flex-wrap align-items-center mt-1">
                              <label className="checkbox-container mr-3">
                                <input type="checkbox" checked={!!this.state.showEventLink} onChange={e => this.setState({ showEventLink: e.target.checked })} />
                                <span className="checkmark" />
                              </label>
                            </div>
                          </div>
                        </div>

                        {this.state.showEventLink ?
                          <React.Fragment>
                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="trainingLink" />
                                <InfoTooltip id="trainingLink"><FormattedMessage id="trainingLinkTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5 share-button">
                                <input type="url" data-title="trainingLink" id="trainingLink" value={this.state.trainingLink || ''} onChange={e => this.setState({ trainingLink: e.target.value })} className="form-control" />
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right">
                                <FormattedMessage id="trainingText" />
                                <InfoTooltip id="trainingText"><FormattedMessage id="trainingTextTooltip" /></InfoTooltip>
                              </label>
                              <div className="col-md-5 share-button">
                                <input type="text" data-title="trainingText" id="trainingText" value={this.state.trainingText || ''} onChange={e => this.setState({ trainingText: e.target.value })} className="form-control" />
                              </div>
                            </div>
                          </React.Fragment>
                          : null}
                      </div>
                    </div>
                  </React.Fragment>

                  <div className="card-footer text-right">
                    {this.state.create ? (
                      <Link to="/projects" className="btn btn-secondary mr-2"><FormattedMessage id="cancel" /></Link>
                    ) : (
                      <button type="button" onClick={() => this.props.history.goBack()} className="btn btn-secondary mr-2"><FormattedMessage id="back" /></button>
                    )}
                    <button type="submit" className="btn btn-primary"><FormattedMessage id="save" /></button>
                  </div>
                </form>

              </ProjectTabs>
            </Loader>
          </div>
        </div>
      </div>
    );
  }
}

EditProject.propTypes = {
  projectId: PropTypes.string.isRequired
};

EditProject.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const projectId = match.params.id;

  return {
    projectId,
  };
}, EditProject);
