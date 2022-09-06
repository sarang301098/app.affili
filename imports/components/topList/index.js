import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactPaginate from 'react-paginate';

import Toplist from 'meteor/affilihero-lib/collections/toplist';

import Confirm from '../confirm';
import Loader from '../loader';
import ProjectTabs from '../projects/projectTabs';
import ProductTabs from '../products/productTabs';

const PAGE_SIZE = 20;

class ListToplist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showCodeModal: false,
      loaded: true,
      searchQuery: '',
      pages: 0,
      page: (props.location.state || {}).page || 0,
    };

    this.getProjectById = this.getProjectById.bind(this);
    this.getProductName = this.getProductName.bind(this);
    this.getToplists = this.getToplists.bind(this);
    this.setPage = this.setPage.bind(this);
    this.removeToplist = this.removeToplist.bind(this);
    this.showToplistCode = this.showToplistCode.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }

  // Get All the Data at the render time                
  componentDidMount() {
    this.getToplists();
    this.getProjectById();
    this.getProductName();
  }

  /**
   * Get Project by ProjectId
   */
  getProjectById() {
    this.setState({ loaded: false });
    Meteor.call('getProjectById', (this.props.projectId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ name: res.name || '', marketPlace: res.marketPlace });
      }
    });
  }

  /**
   * Get Project Name for the Header
   */
  getProductName() {
    this.setState({ loaded: false });
    Meteor.call('getProductName', this.props.productId, (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      }
      if (res) {
        this.setState({ productName: res });
      }
    });
  }

  /**
 * Get All Toplists Based on the Pagination Data and SearchQuery (if there)
 */
  getToplists() {
    Meteor.call('getToplists', this.state.page, PAGE_SIZE, (this.state.searchQuery || ''), this.props.projectId || '', this.props.productId || '', (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      }
      if (res) {
        this.setState({ ...res });
      }
    });
  }

  /**
   * Set the Page For the Pagination and get the Toplist based on the pagination Data
   */
  setPage(page) {
    this.props.history.push(this.props.location.pathname, { page });
    this.setState({ page }, () => this.getToplists());
  }

  /**
   * get Projects Debounce (after entering query)
   */
  getToplistDebounce = _.debounce(() => { this.getToplists(); }, 1000);

  /**
   * Remove Toplist From the Collection By Id
   */
  removeToplist(toplistId) {
    const { intl } = this.context;

    if (toplistId) {
      Toplist.remove(toplistId, (err) => {
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'toplistDeleted' }));
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'noToplistFound' }));
    }
    this.getToplists();
  }

  /**
   * Show Modal Of Toplist Code
   */
  showToplistCode(e, id) {
    e.stopPropagation();
    this.setState({ showCodeModal: true, currentToplistId: id });
  }

  /**
   * Redirect to the Router
   */
  redirectTo(e, path) {
    e.stopPropagation();
    this.props.history.push(path);
  }

  render() {
    const { intl } = this.context;

    return (
      <div>
        <Helmet title="toplist" />
        <div className="content">
          <div className="container-fluid">
            <div className="page-header">
              <h1 className="h5 m-0"><FormattedMessage id="editProduct" />{this.state.productName ? `: ${this.state.productName}` : ''}</h1>
            </div>
            <Loader loaded={this.state.loaded} >
              <ProjectTabs projectId={this.props.projectId} marketPlace={this.state.marketPlace}>
                <div className="card-header bg-white">
                  <ProductTabs projectId={this.props.projectId} productId={this.props.productId} />
                </div>
                <div>
                  <div className="page-header d-flex flex-wrap align-items-center p-3">
                    <div className="searchBar ml-auto">
                      <input type="text" className="form-control search-bar" placeholder={intl.formatMessage({ id: 'searchForToplist' })} value={this.state.searchQuery} onChange={e => this.setState({ searchQuery: e.target.value }, () => this.getToplistDebounce())} />
                    </div>
                    <Link to={'/project/' + (this.props.projectId || '') + '/product/' + (this.props.productId || '') + '/toplist/new'} ><button type="button" className="btn btn-outline-primary ml-3"><i className="fa fa-plus mr-2" /><FormattedMessage id="createToplist" /></button> </Link>
                  </div>

                  <div className="card-body">
                    {!(this.state.toplists && this.state.toplists.length) ? (
                      <div className="mt-md-5">
                        <p className="lead text-center"><FormattedMessage id="noToplistFound" /></p>
                      </div>
                    ) : (
                      <React.Fragment>
                        <div className="toplist-table">
                          <div className="table-responsive">
                            <table className="table table-hover vm no-th-brd pro-of-month mb-0">
                              <tbody>
                                {(this.state.toplists || []).map((toplists, index) => (
                                  <tr key={index} className="animated animated-list-item cursor-pointer fadeIn" onClick={e => this.redirectTo(e, '/project/' + this.props.projectId + '/product/' + (this.props.productId || '') + '/toplist/' + toplists._id)} >
                                    <td>
                                      {toplists.name || 'new toplist'}
                                    </td>
                                    <td className="text-right funnel-list-actions">
                                      <button type="button" id={'edit-' + toplists._id} onClick={e => this.redirectTo(e, '/project/' + this.props.projectId + '/product/' + (this.props.productId || '') + '/toplist/' + toplists._id)} className="btn btn-link btn-sm"> <i className="fa fa-cog mr-1" /><FormattedMessage id="edit" /></button> &nbsp;

                                      <button type="button" onClick={e => this.showToplistCode(e, toplists._id)} className="btn btn-link btn-sm"> <i className="fa fa-info-circle mr-1" />Code</button> &nbsp;

                                      {Meteor.isClient && Meteor.user() && (Meteor.user().subUser && !(toplists.createdBySubUser)) ? null :
                                      <Confirm
                                        onConfirm={() => this.removeToplist(toplists._id)}
                                        body={<FormattedMessage id="deleteToplistBodyText" />}
                                        confirmText={<FormattedMessage id="remove" />}
                                        cancelText={<FormattedMessage id="deleteToplistAbortText" />}
                                        title={<FormattedMessage id="deleteToplistTitleText" />}
                                      >
                                        <button type="button" id={'delete-' + toplists._id} className="btn btn-link btn-sm"><i className="fa fa-trash mr-1" /><FormattedMessage id="remove" /></button>
                                      </Confirm>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                    {(this.state.toplists && this.state.toplists.length) ?
                      <ReactPaginate
                        previousLabel={<i className="fa fa-angle-left" />}
                        nextLabel={<i className="fa fa-angle-right" />}
                        breakLabel={<a href="">...</a>}
                        pageCount={this.state.pages}
                        forcePage={this.state.page}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={data => this.setPage(data.selected)}
                        containerClassName="pagination justify-content-center mb-0"
                        activeClassName="active"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        disabledClassName="page-link"
                      /> : null}
                  </div>
                </div>
                <Modal isOpen={this.state.showCodeModal} toggle={() => this.setState({ showCodeModal: false })}>
                  <ModalHeader><FormattedMessage id="toplistCode" /></ModalHeader>
                  <ModalBody>
                    <div className="p-2 bg-light border">
                      <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}><code>{'<script src="' + 'https://front.affilihero.io/toplist/' + this.state.currentToplistId + '/embed.js"></script>'}</code></pre>
                    </div>

                  </ModalBody>
                  <ModalFooter>
                    <CopyToClipboard
                      text={'<script src="' + 'https://front.affilihero.io/toplist/' + this.state.currentToplistId + '/embed.js"></script>'}
                      onCopy={() => Alert.success(intl.formatMessage({ id: 'codeCpoiedToClipboard' }))}
                    >
                      <button type="button" className="btn btn-success text-white"><i className="fas fa-copy mr-2" /><FormattedMessage id="copy" /></button>
                    </CopyToClipboard>
                    <button type="button" onClick={() => this.setState({ showCodeModal: false })} className="btn btn-primary"><FormattedMessage id="shutDown" /></button>
                  </ModalFooter>
                </Modal>
              </ProjectTabs>
            </Loader>
          </div>
        </div>
      </div>
    );
  }
}

ListToplist.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default createContainer(({ match }) => {
  const projectId = match.params.projectId;
  const productId = match.params.productId;

  return {
    projectId,
    productId
  };
}, ListToplist);
