import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Helmet from 'react-helmet';
import _ from 'lodash';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';
import ReactPaginate from 'react-paginate';

import RatingChart from '../ratingChart';

const PAGE_SIZE = 10;

class MarketPlaceUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: 0,
      page: (props.location.state || {}).page || 0
    };

  }

  componentDidMount() {
    this.getAllUsers();
  }

  /**
  * Set the Page For the Pagination and get the Projects based on the pagination Data
  */
  setPage(page) {
    this.props.history.push(this.props.location.pathname, { page });
    this.setState({ page }, () => this.getAllUsers());
  }

  /**
   * Get All Projects Based on the Pagination Data and SearchQuery (if there)
   */
  getAllUsers() {
    this.setState({ loaded: false });
    Meteor.call('getAllaffiliateManagers', this.state.page || 0, PAGE_SIZE, (this.state.searchQuery || ''), (this.state.category || ''), (this.state.ratings || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ ...res });
      }
    });
  }

  /**
 * get Projects Debounce (after entering query)
 */
  getAllUsersDebounce = _.debounce(() => { this.getAllUsers(); }, 1000);

  /**
   * Redirect To the Path
   */
  redirectTo(e, path) {
    e.stopPropagation();
    this.props.history.push(path);
  }

  render() {
    const { intl } = this.context;
    return (
      <div className="content">
        <div className="container-fluid">
          <Helmet title="Affiliate Managers" />
          <div className="page-header d-flex flex-wrap align-items-center">
            <div className="searchBar flex-fill">
              <input type="text" className="form-control form-control-lg search-bar" placeholder={intl.formatMessage({ id: 'searchAffiliateManagers' })} value={this.state.searchQuery} onChange={e => this.setState({ searchQuery: e.target.value }, () => this.getAllUsersDebounce())} />
            </div>
            <div className="ml-3">
              <select name="ratings" className="custom-select custom-select-lg" value={this.state.ratings} onChange={e => this.setState({ ratings: e.target.value }, () => this.getAllUsers())}>
                <option value="all" selected >{intl.formatMessage({ id: 'allReviews' })}</option>
                <option value="accending">{intl.formatMessage({ id: 'lowToHigh' })}</option>
                <option value="decending">{intl.formatMessage({ id: 'highToLow' })}</option>
                <option value="latest">{intl.formatMessage({ id: 'latest' })}</option>
                <option value="oldest">{intl.formatMessage({ id: 'oldest' })}</option>
              </select>
            </div>
            <div className="ml-3">
              <select name="category" className="custom-select custom-select-lg" value={this.state.category} onChange={e => this.setState({ category: e.target.value }, () => this.getAllUsers())}>
                <option value="all" selected >{intl.formatMessage({ id: 'allCategory' })}</option>
                <option value="category1">ct 1</option>
                <option value="category2">ct 2</option>
                <option value="category3">ct 3</option>
              </select>
            </div>
          </div>

          <div className="row">
            {(this.state.allUsers && this.state.allUsers.length) ? (this.state.allUsers || []).map((user, index) => (
              <div className="col-lg-12 mb-3" key={index} onClick={e => this.redirectTo(e, '/affiliateManagers/' + user._id)} >
                <div className="card common-box market-place-box h-100 pointer">
                  <div className="card-body d-flex align-items-center p-1">
                    <i className="fa fa-file-text-o fa-lg mr-4 pl-3 text-muted" />
                    <div className="mb-0 flex-fill">
                      <h5 className="mb-1">{((user.marketPlaceProfile || {}).name || 'N/A')}</h5>
                      <p className="m-0">{((user.marketPlaceProfile || {}).company || 'N/A')}</p>
                    </div>
                    <img src={(user.marketPlaceProfile || {}).imageUrl || '/images/default-avatar.png'} height="90" width="90" />
                    <div className="ml-3">
                      <RatingChart ratings={user.averageRating || 0} />
                    </div>
                    <button className="btn btn-outline-primary ml-3 mr-3" ><FormattedMessage id="viewUser" /></button>
                  </div>
                </div>
              </div>
            ))
              :
              <div className="col-lg-12 mt-md-5">
                <h4 className="lead text-center"><FormattedMessage id="noUsersFound" /></h4>
              </div>
            }
          </div>

          {(this.state.allUsers && this.state.allUsers.length) ?
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
    );
  }
}

MarketPlaceUsers.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default createContainer(() => ({
}), MarketPlaceUsers);
