import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import _ from 'lodash';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

import Toplist from 'meteor/affilihero-lib/collections/toplist';

import UploadInput from '../uploadInput';
import InfoTooltip from '../infoTooltip';
import ProjectTabs from '../projects/projectTabs';
import ProductTabs from '../products/productTabs';
import reactSelectStyle from '../../utils/reactSelectStyle';
import ExternalProviderSelectionSingle from '../settings/externalProviders/selectionSingle';

class EditToplist extends React.Component {
  constructor(props) {
    super(props);

    this.defaultState = {
      navType: 'projects',
      loading: false,
      toplistId: props.toplistId,
      projectId: props.projectId,
      startDate: new Date(),
      endDate: new Date(),
    };

    this.state = Object.assign({}, { create: this.props.match.params.id && this.props.match.params.id === 'new' }, this.defaultState);

    this.handleHtmlChange = this.handleHtmlChange.bind(this);
    this.getToplistById = this.getToplistById.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addStatus = this.addStatus.bind(this);
    this.handleStatus = this.handleStatus.bind(this);
    this.removeStatus = this.removeStatus.bind(this);
    this.addPrizes = this.addPrizes.bind(this);
    this.removePrizes = this.removePrizes.bind(this);
    this.handlePrizes = this.handlePrizes.bind(this);

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
   * Get The Toplist Data By the ToplistId
   */
  getToplistById() {
    Meteor.call('getToplistById', (this.props.toplistId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ ...res });
      }
    });
  }

  /**
 * Handle Change of Toplist Data
 */
  handleHtmlChange(name, value) {
    this.setState({ [name]: value });
  }

  /**
 * Set the Initial State Data at compoent Mount
 */
  setInitialState() {
    this.getToplistById();
  }

  /**
   * Handle Submit of Toplist
   */
  handleSubmit(e) {
    e.preventDefault();

    this.save();
    this.setState({ create: false });
  }

  /**
   * Save Toplist Data
   */
  save() {
    const { toplistId } = this.props;
    const { intl } = this.context;

    const doc = _.pick(this.state, ['name', 'type', 'startDate', 'endDate', 'projectId', 'productId', 'status', 'salesNumber', 'salesPoints', 'externalProviderId', 'prizes', 'rankingPrizes']);
    this.setState({ loading: true });

    if (!this.state.type) {
      doc.type = 'Affiliate_toplist';
    }

    if (this.state.type !== 'Competition_with_timing') {
      delete doc.startDate;
      delete doc.endDate;
    }

    const newToplist = Object.assign({}, doc, { productId: this.props.productId, userId: Meteor.user().subUser ? Meteor.user().parentUserId : Meteor.userId(), createdAt: new Date(), updatedAt: new Date(), projectId: this.props.projectId, createdBySubUser: !!Meteor.user().subUser });

    if (this.state.create) {
      const id = Toplist.insert(
        newToplist
        , (err) => {
          if (err) {
            Alert.error(err.reason || err.message);
          } else {
            Alert.success(intl.formatMessage({ id: 'toplistCreated' }));
          }
        });

      if (id) {
        this.props.history.push('/project/' + this.props.projectId + '/product/' + this.props.productId + '/toplist/' + id);
      }
    } else {
      Toplist.update(toplistId, {
        $set: Object.assign({
          updatedAt: new Date()
        }, doc)
      }, (err) => {
        Alert.closeAll();
        this.setState({ loading: false });
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'toplistSaved' }));
        }
      });
    }
  }

  /**
   * Handle All Change in the Toplist By User
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
   * Add New Status
   */
  addStatus() {
    const status = this.state.status || [];
    status.push({ type: 'Bronze' });
    this.setState({ status });
  }

  /**
   * Handle Updation of Status
   */
  handleStatus(index, name, value) {
    const status = this.state.status || [];
    status[index][name] = value;
    this.setState({ status });
  }

  /**
   * Remove the Status
   */
  removeStatus(index) {
    const status = this.state.status || [];
    status.splice(index, 1);
    this.setState({ status });
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

  /**
* Add New Prizes
*/
  addRankingPrizes() {
    const rankingPrizes = this.state.rankingPrizes || [];
    rankingPrizes.push({ name: 'Prize Name', rank: rankingPrizes.length + 1 || 0 });
    this.setState({ rankingPrizes });
  }

  /**
   * Remove Prizes by Index
   */
  removeRankingPrizes(index) {
    const rankingPrizes = this.state.rankingPrizes || [];
    rankingPrizes.splice(index, 1);
    this.setState({ rankingPrizes });
  }

  /**
   * Handle Change in Prizes
   */
  handleRankingPrizes(index, name, value) {
    const rankingPrizes = this.state.rankingPrizes || [];
    rankingPrizes[index][name] = value;
    this.setState({ rankingPrizes });
  }

  render() {
    const typeOptions = [
      {
        label: "Affiliate Toplist",
        value: "Affiliate_toplist"
      },
      {
        label: "Competition (with Start End Date)",
        value: "Competition_with_timing"
      },
      {
        label: "Competition (without Timing)",
        value: "Competition_without_timing"
      }
    ];
    return (
      <div>
        <Helmet title={'Edit Toplist'} />
        <div className="content">
          <div className="container-fluid">
            <div className="page-header">
              <h1 className="h5 m-0"><FormattedMessage id="editToplist" />{this.state.name ? `: ${this.state.name}` : ''}</h1>
            </div>
            <ProjectTabs projectId={this.props.projectId}>
              <div className="card-header bg-white">
                <ProductTabs projectId={this.props.projectId} productId={this.props.productId} />
              </div>
              <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div className="card-body">
                  <div className="mt-3">

                    <div className="form-group row">
                      <label className="control-label col-md-3 text-md-right">
                        <FormattedMessage id="type" />
                        <InfoTooltip id="type"><FormattedMessage id="typeTooltip" /></InfoTooltip>
                      </label>
                      <div className="col-md-5">
                        <Select
                          value={this.state.type ? ((typeOptions || []).find(prod => prod.value === this.state.type) || null) : null}
                          onChange={val => this.setState({ type: (val.value || null) })}
                          options={typeOptions}
                          theme={reactSelectStyle.theme}
                        />
                      </div>
                    </div>

                    {this.state.type && this.state.type === 'Competition_with_timing' ?
                      <div className="form-group row">
                        <label className="control-label col-md-3 text-md-right">
                          <FormattedMessage id="selectDate" />
                          <InfoTooltip id="selectDate"><FormattedMessage id="selectDateTooltipText" /></InfoTooltip>
                        </label>
                        <div className="col-md-5">
                          <div className="row">
                            <div className="col-md-6">
                              <DatePicker
                                selected={this.state.startDate}
                                dateFormat="MMMM.yyyy"
                                showMonthYearPicker
                                onChange={(startDate) => this.setState({ startDate })}
                              />
                            </div>
                            <div className="col-md-6">
                              <DatePicker
                                selected={this.state.endDate}
                                dateFormat="MMMM.yyyy"
                                showMonthYearPicker
                                onChange={(endDate) => this.setState({ endDate })}
                              />
                            </div>
                          </div>
                        </div>
                      </div> : null}

                    <div className="form-group row">
                      <label className="control-label col-md-3 text-md-right">
                        <FormattedMessage id="name" />
                        <InfoTooltip id="name"><FormattedMessage id="name" /></InfoTooltip>
                      </label>
                      <div className="col-md-5">
                        <input type="text" id="inputName" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} className="form-control" />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="control-label col-md-3 text-md-right">
                        <FormattedMessage id="externalProvider" />
                        <InfoTooltip id="externalProvider"><FormattedMessage id="externalProviderTooltipText" /></InfoTooltip>
                      </label>
                      <div className="col-md-5">
                        <ExternalProviderSelectionSingle
                          className="form-control"
                          type="digistore24"
                          value={this.state.externalProviderId}
                          onChange={externalProviderId => this.setState({ externalProviderId })}
                        />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="control-label col-md-3 text-md-right">
                        <FormattedMessage id="salePoints" />
                        <InfoTooltip id="salePoints"><FormattedMessage id="salesPointTooltipText" /></InfoTooltip>
                      </label>
                      <div className="col-md-5">
                        <div className="row">
                          <div className="col-md-5">
                            <input type="number" id="salesNumber" value={this.state.salesNumber} onChange={e => this.setState({ salesNumber: e.target.value })} className="form-control" />
                          </div>
                          <div className="col-md-2">
                            <label className="control-label text-md-right d-block text-nowrap">
                              <FormattedMessage id="salesEquals" />
                            </label>
                          </div>
                          <div className="col-md-5">
                            <div className="input-group">
                              <input type="number" id="salesPoints" value={this.state.salesPoints} onChange={e => this.setState({ salesPoints: e.target.value })} className="form-control" />
                              <div className="input-group-append h-35">
                                <label className="input-group-text"><FormattedMessage id="points" /></label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="control-label col-md-3 text-md-right">
                        <FormattedMessage id="status" />
                        <InfoTooltip id="status"><FormattedMessage id="statusTooltip" /></InfoTooltip>
                      </label>
                      <div className="col-md-5">
                        <button type="button" className="btn btn-outline-primary" onClick={() => this.addStatus()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addStatus" /></button>
                      </div>
                    </div>

                    <div className="add-status-container">
                      {(this.state.status || []).map((status, index) => (
                        <div key={index}>
                          <div className="form-group row">
                            <label className="control-label col-md-3 text-md-right"><FormattedMessage id="statusName" /></label>
                            <div className="col-md-5">
                              <div className="row">
                                <div className="col-md-5">
                                  <input type="text" placeholder="Type" data-title="type" id="type" value={status.type} onChange={event => this.handleStatus(index, event.target.dataset.title, event.target.value)} className="form-control" />
                                </div>
                                <div className="col-md-2">
                                  <label className="control-label text-md-right d-block text-nowrap"><FormattedMessage id="minPoints" /></label>
                                </div>
                                <div className="col-md-5">
                                  <div className="input-group">
                                    <input type="number" placeholder="minPoints" data-title="minPoints" id="minPoints" value={status.minPoints} onChange={event => this.handleStatus(index, event.target.dataset.title, event.target.value)} className="form-control" />
                                    <div className="input-group-append h-35">
                                      <label className="input-group-text">Points</label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <button type="button" className="btn btn-outline-primary" onClick={() => this.removeStatus(index)}><i className="fa fa-trash font-size-12" /></button>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="control-label col-md-3 text-md-right"><FormattedMessage id="statusLogo" /></label>
                            <div className="col-md-5">
                              <div className="border-bottom pb-3 mb-2">
                                <UploadInput noEditor value={status.logo || ''} onChange={logo => this.handleStatus(index, 'logo', logo)} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-group row">
                      <label className="control-label col-md-3 text-md-right">
                        <FormattedMessage id="prizes" />
                        <InfoTooltip id="prizes"><FormattedMessage id="prizesTooltip" /></InfoTooltip>
                      </label>
                      <div className="col-md-5">
                        <button type="button" className="btn btn-outline-primary" onClick={() => this.addPrizes()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addPrize" /></button>
                      </div>
                    </div>

                    {(this.state.prizes || []).map((prize, index) => (
                      <div key={index}>
                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right"><FormattedMessage id="name" /></label>
                          <div className="col-md-5">
                            <div className="row">
                              <div className="col-md-5">
                                <input id="input-0" type="text" className="forms__input-control form-control js-partner-input" data-title="name" data-value="" value={prize.name} onChange={event => this.handlePrizes(index, event.target.dataset.title, event.target.value)} />
                              </div>
                              <label className="control-label col-md-2 text-md-right"><FormattedMessage id="points" /></label>
                              <div className="col-md-5">
                                <input id="input-0" type="number" className="forms__input-control form-control js-partner-input" data-title="points" data-value="" value={prize.points} onChange={event => this.handlePrizes(index, event.target.dataset.title, event.target.value)} />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <button type="button" className="btn btn-outline-primary" onClick={() => this.removePrizes(index)}><i className="fa fa-trash font-size-12" /> </button>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right"><FormattedMessage id="prizeImage" /></label>
                          <div className="col-md-5">
                            <div className="border-bottom pb-3 mb-2">
                              <UploadInput noEditor value={prize.prizeImage || ''} onChange={logo => this.handlePrizes(index, 'prizeImage', logo)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {this.state.type && this.state.type === 'Affiliate_toplist' ?
                      null :
                      <React.Fragment>
                        <div className="form-group row">
                          <label className="control-label col-md-3 text-md-right">
                            <FormattedMessage id="rankingPrizes" />
                            <InfoTooltip id="rankingPrizes"><FormattedMessage id="rankingPrizesTooltip" /></InfoTooltip>
                          </label>
                          <div className="col-md-5">
                            <button type="button" className="btn btn-outline-primary" onClick={() => this.addRankingPrizes()}><i className="fa fa-plus mr-2" /><FormattedMessage id="addRankingPrize" /></button>
                          </div>
                        </div>

                        {(this.state.rankingPrizes || []).map((prize, index) => (
                          <div key={index}>
                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right"><FormattedMessage id="name" /></label>
                              <div className="col-md-5">
                                <div className="row">
                                  <div className="col-md-5">
                                    <input id="input-0" type="text" className="forms__input-control form-control js-partner-input" data-title="name" value={prize.name} onChange={event => this.handleRankingPrizes(index, event.target.dataset.title, event.target.value)} />
                                  </div>
                                  <label className="control-label col-md-2 text-md-right"><FormattedMessage id="rank" /></label>
                                  <div className="col-md-5">
                                    <input id="input-0" type="number" className="forms__input-control form-control js-partner-input" data-title="rank" value={prize.rank} onChange={event => this.handleRankingPrizes(index, event.target.dataset.title, event.target.value)} />
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <button type="button" className="btn btn-outline-primary" onClick={() => this.removeRankingPrizes(index)}><i className="fa fa-trash font-size-12" /> </button>
                              </div>
                            </div>
                            <div className="form-group row">
                              <label className="control-label col-md-3 text-md-right"><FormattedMessage id="prizeImage" /></label>
                              <div className="col-md-5">
                                <div className="border-bottom pb-3 mb-2">
                                  <UploadInput noEditor value={prize.prizeImage || ''} onChange={logo => this.handleRankingPrizes(index, 'prizeImage', logo)} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>}
                  </div>
                </div>

                <div className="card-footer text-right">
                  {this.state.create ? (
                    <Link to={'/project/' + this.props.projectId + '/product/' + this.props.productId + '/toplists'} className="btn btn-secondary mr-2"><FormattedMessage id="cancle" /></Link>
                  ) : (
                    <button type="button" onClick={() => this.props.history.push('/project/' + this.props.projectId + '/product/' + this.props.productId + '/toplists')} className="btn btn-secondary mr-2"><FormattedMessage id="back" /></button>
                  )}
                  <button type="submit" className="btn btn-primary"><FormattedMessage id="save" /></button>
                </div>

              </form>
            </ProjectTabs>
          </div>
        </div>
      </div>
    );
  }
}

EditToplist.propTypes = {
  productId: PropTypes.string,
  toplistId: PropTypes.string
};

EditToplist.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default createContainer(({ match }) => {
  const toplistId = match.params.id;
  const projectId = match.params.projectId;
  const productId = match.params.productId;

  return {
    toplistId,
    projectId,
    productId
  };
}, EditToplist);
