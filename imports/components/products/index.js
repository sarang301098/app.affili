import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactPaginate from 'react-paginate';
import { createContainer } from 'meteor/react-meteor-data';

import Products from 'meteor/affilihero-lib/collections/products';

import Confirm from '../confirm';
import Loader from '../loader';
import ProjectTabs from '../projects/projectTabs';

const PAGE_SIZE = 20;

class ListProducts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: true,
      showCodeModal: false,
      showAffiliateModal: false,
      searchQuery: '',
      pages: 0,
      page: (props.location.state || {}).page || 0,
    };

    this.setPage = this.setPage.bind(this);
    this.getProducts = this.getProducts.bind(this);
    this.getProjectName = this.getProjectName.bind(this);
    this.showAffiliateModal = this.showAffiliateModal.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.removeProduct = this.removeProduct.bind(this);
  }

  componentDidMount() {
    this.getProducts();
    this.getProjectName();
  }

  /**
   * Set the Page For the Pagination and get the Projects based on the pagination Data
   */
  setPage(page) {
    this.props.history.push(this.props.location.pathname, { page });
    this.setState({ page }, () => this.getProducts());
  }

  /**
   * Get All Products Based on the Pagination Data and SearchQuery (if there)
   */
  getProducts() {
    Meteor.call('getProducts', this.props.projectId, this.state.page, PAGE_SIZE, (this.state.searchQuery || ''), (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      }
      if (res) {
        this.setState({ ...res });
      }
    });
  }

  /**
   * Get Project Name for the Header
   */
  getProjectName() {
    this.setState({ loaded: false });
    Meteor.call('getProjectName', this.props.projectId, (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      }
      if (res) {
        this.setState({ projectName: res });
      }
    });
  }

  /**
   * Get Product Debouncely (when enter search query)
   */
  getProductDebounce = _.debounce(() => { this.getProducts(); }, 1000);

  /**
   * Show the Affiliate Modal and set the ProjectUrl
   */
  showAffiliateModal(e, value, domaintld) {
    let productUrl = 'https://affiliportal.com/product/public/' + value;

    if (domaintld && domaintld.length) {
      productUrl = 'https://' + domaintld;
    }

    e.stopPropagation();
    this.setState({ showAffiliateModal: true, productId: value, productUrl });
  }

  /**
   * REdirect to the Given Path
   */
  redirectTo(e, path) {
    e.stopPropagation();
    this.props.history.push(path);
  }

  /**
   * Remove Product From the Database
   */
  removeProduct(productId) {
    const { intl } = this.context;

    this.setState({ loaded: false });
    if (productId) {
      Products.remove(productId, (err) => {
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Meteor.call('removeProductIdFromAffiliateUser', productId || '', (error) => {
            if (err) {
              Alert.error(error.reason || error.message);
            }
          });
          Alert.success(intl.formatMessage({ id: 'productDeleted' }));
        }
      });
    } else {
      Alert.error(intl.formatMessage({ id: 'noProductFound' }));
    }
    this.setState({ loaded: true });
    this.getProducts();
  }

  render() {
    const { intl } = this.context;

    return (
      <React.Fragment>
        <div>
          <Helmet title="Products" />
          <div className="content">
            <div className="container-fluid">
              <div className="page-header">
                <h1 className="h5 m-0"><FormattedMessage id="editProject" />{this.state.projectName ? `: ${this.state.projectName}` : ''}</h1>
              </div>
              <Loader loaded={this.state.loaded}>
                <ProjectTabs projectId={this.props.projectId}>
                  <div>

                    <div className="page-header d-flex flex-wrap align-items-center p-3">
                      <div className="searchBar ml-auto">
                        <input type="text" className="form-control search-bar" placeholder={intl.formatMessage({ id: 'searchForProduct' })} value={this.state.searchQuery} onChange={e => this.setState({ searchQuery: e.target.value }, () => this.getProductDebounce())} />
                      </div>
                      <Link to={'/project/' + (this.props.projectId || '') + '/product/new/edit'} ><button type="button" className="btn btn-outline-primary ml-3"><i className="fa fa-plus mr-2" /><FormattedMessage id="createProduct" /></button> </Link>
                    </div>

                    <div className="card-body">
                      {!(this.state.products && (this.state.products || []).length) ? (
                        <div className="mt-md-5">
                          <p className="lead text-center"><FormattedMessage id="noProductsFound" /></p>
                        </div>
                      ) : (
                        <React.Fragment>
                          <div className="toplist-table">
                            <div className="table-responsive">
                              <table className="table table-hover vm no-th-brd pro-of-month mb-0">
                                <tbody>
                                  {(this.state.products || []).map((product, index) => (
                                    <tr key={index} className="animated animated-list-item cursor-pointer fadeIn" onClick={e => this.redirectTo(e, '/project/' + (this.props.projectId || '') + '/product/' + (product._id || '') + '/edit')} >
                                      <td>
                                        {product.name || 'Digistore Product'}
                                      </td>
                                      <td className="text-right funnel-list-actions">
                                        <button type="button" id={'edit-' + product._id} onClick={() => this.props.history.push('/project/' + (this.props.projectId || '') + '/product/' + (product._id || '') + '/edit')} className="btn btn-link btn-sm"> <i className="fa fa-cog mr-1" /> <FormattedMessage id="edit" /></button> &nbsp;

                                        <button type="button" id={'affiliate-' + product._id} onClick={e => this.showAffiliateModal(e, product._id, (product.domaintld || ''))} className="btn btn-link btn-sm"> <i className="fa fa-info-circle mr-1" /> <FormattedMessage id="links" /></button> &nbsp;

                                        {Meteor.isClient && Meteor.user() && (Meteor.user().subUser && !(product.createdBySubUser)) ? null :
                                          <Confirm
                                            onConfirm={() => this.removeProduct(product._id)}
                                            body={<FormattedMessage id="deleteProductBodyText" />}
                                            confirmText={<FormattedMessage id="remove" />}
                                            cancelText={<FormattedMessage id="deleteProductAbortText" />}
                                            title={<FormattedMessage id="deleteProductTitleText" />}
                                          >
                                            <button type="button" id={'delete-' + product._id} className="btn btn-link btn-sm"><i className="fa fa-trash mr-1" /> <FormattedMessage id="remove" /></button>
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

                      {(this.state.products && this.state.products.length) ?
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
                </ProjectTabs>
              </Loader>

              <Modal isOpen={this.state.showAffiliateModal} toggle={() => this.setState({ showAffiliateModal: false })}>
                <ModalHeader toggle={() => this.setState({ showAffiliateModal: false })}>
                  Affiliate
                </ModalHeader>
                <ModalBody>
                  <div className="form-group">
                    <label><FormattedMessage id="productRegisterLink" /></label>
                    <div className="input-group">
                      <input type="url" className="flex-fill" defaultValue={'https://affiliportal.com/register/' + this.state.productId} disabled />
                      <div className="input-group-append">
                        <CopyToClipboard
                          text={'https://affiliportal.com/register/' + this.state.productId}
                          onCopy={() => Alert.success(intl.formatMessage({ id: 'codeCpoiedToClipboard' }))}
                        >
                          <button type="button" className="btn btn-secondary btn-sm"><i className="fas fa-copy mr-2" /><FormattedMessage id="copy" /></button>
                        </CopyToClipboard>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label><FormattedMessage id="viewProjectLink" /></label>
                    <div className="input-group">
                      <input type="url" className="flex-fill" defaultValue={this.state.productUrl} disabled />
                      <div className="input-group-append">
                        <CopyToClipboard
                          text={this.state.productUrl}
                          onCopy={() => Alert.success(intl.formatMessage({ id: 'codeCpoiedToClipboard' }))}
                        >
                          <button type="button" className="btn btn-secondary btn-sm"><i className="fas fa-copy mr-2" /><FormattedMessage id="copy" /></button>
                        </CopyToClipboard>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <button type="button" onClick={() => this.setState({ showAffiliateModal: false })} className="btn btn-primary"><FormattedMessage id="done" /></button>
                </ModalFooter>
              </Modal>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ListProducts.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const projectId = match.params.projectId;

  return {
    projectId
  };
}, ListProducts);
