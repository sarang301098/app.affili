import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import ReactPaginate from 'react-paginate';
import { FormattedMessage } from 'react-intl';

import Loader from '../loader';

class Toplist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: 0,
      page: 0,
      pageSize: 10
    }
  }

  componentDidMount() {
    this.setState({ toplistId: this.props.id }, () => {
      this.getAffiliateToplist(this.state.toplistId);
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ toplistId: nextProps.id }, () => {
      this.getAffiliateToplist(this.state.toplistId);
    })
  }

  /**
   * Get the Toplist Data By the TiplistId
   */
  getAffiliateToplist(toplistId) {
    Meteor.call('getAffiliateToplist', (toplistId || ''), (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ toplist: res.toplist, affiliate: res.affiliates }, () => {
          let { affiliate } = this.state;
          let range;
          let point;
          if (affiliate) {
            range = (affiliate || []).length / this.pageSize;
            point = range - parseInt(range, 10);
          }
          if (point > 0) {
            range += 1;
          }
          this.setState({ pages: Math.floor(range) })

          this.setRange();
        });
      }
    });
  }

  /**
   * Set the Pagination Range and also manage the Search
   */
  setRange() {
    let affiliate = this.state.affiliate || [];
    if (this.state.searchQuery) {
      try {
        const regex = new RegExp(this.state.searchQuery, 'i');
        affiliate = (this.state.affiliate || []).filter(item => regex.test(item.name)) || [];
      } catch (err) { }
    }

    let range;
    let point;

    if (affiliate) {
      range = (affiliate || []).length / this.state.pageSize;
      point = range - parseInt(range, 10);
    }
    if (point > 0) {
      range += 1;
    }

    this.setState({ pages: Math.floor(range) })
    this.getAffiliate();
  }

  /**
   * Set the Status based on the points and Manage it with the Toplist Status
   */
  getStatus(point) {
    let { status } = this.state.toplist || {};
    let statusObj;

    if (status && status.length) {
      let minPoints = (status || []).map((prod) => {
        return (parseInt(prod.minPoints, 10) || 0);
      });

      minPoints = (minPoints || []).sort((a, b) => { return a - b });

      let indexedElementData = 0;
      // let isDataAvailable = true;
      if (minPoints && minPoints.length) {
        (minPoints || []).reduce((accumulator, currentValue) => {
          let isDataAvailable = true;
          if (point < currentValue && indexedElementData === 0 && isDataAvailable) {
            if (point < accumulator) {
              isDataAvailable = false;
            } else {
              indexedElementData = accumulator;
            }
          }
          if (isDataAvailable) {
            return currentValue;
          } else {
            return;
          }

        });
      }

      if (indexedElementData === 0) {
        indexedElementData = minPoints[minPoints.length - 1] || 0;
      }

      statusObj = (status || []).find(({ minPoints }) => parseInt(minPoints, 10) === parseInt(indexedElementData, 10));
    }

    if (statusObj && statusObj.logo) {
      return statusObj.logo;
    } else {
      return;
    }
  }

  /**
   * Set the Page value
   */
  setPage(page) {
    this.setState({ page }, () => this.getAffiliate());
  }

  /**
   * Generate the Affiliate For the PAgination From the Affiliate that we have
   */
  getAffiliate() {
    let affiliate = this.state.affiliate || [];
    if (this.state.searchQuery) {
      try {
        const regex = new RegExp(this.state.searchQuery, 'i');
        affiliate = (this.state.affiliate || []).filter(item => regex.test(item.name)) || [];
      } catch (err) { }
    }
    let affiliatePaginate;
    let skip = (this.state.pageSize * this.state.page);
    let limit = this.state.pageSize;
    if (affiliate) {
      if ((skip + limit) >= (affiliate || []).length) {
        limit = ((affiliate || []).length) - skip;
      }

      affiliatePaginate = (affiliate || []).slice(skip, (skip + limit));
      this.setState({ affiliatePaginate: affiliatePaginate || [] });
    }
  }

  /**
   * Page Size is set
   */
  setPageSize(value) {
    this.setState({ pageSize: parseInt(value, 10), page: 0 }, () => this.setRange());
  }

  /**
   * Manage Search Button 
   */
  setSearchQuery(value) {
    this.setState({ searchQuery: value, page: 0 }, () => this.setRange())
  }

  render() {
    return (
      <React.Fragment>
        <div className="section-inner-container mt-40">
          <div className="container-fluid">
            {this.state.affiliate && this.state.affiliatePaginate ?
              <React.Fragment>
                <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center mb-3 mb-md-0">
                    Show
                    <select className="form-control custom-select" onChange={(e) => this.setPageSize(e.target.value)}>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="40">40</option>
                    </select>
                  </div>
                  <div className="form-group d-flex align-items-center m-0">
                    <span className="mr-3"><FormattedMessage id="entries" /></span>
                    <input type="search" className="form-control" placeholder="Search" onChange={(e) => this.setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <div className="table-responsive">
                  {this.state.affiliate && this.state.affiliatePaginate && this.state.affiliatePaginate.length ?
                    <table className="table affiliate-top-list m-0 w-100">
                      <thead>
                        <tr>
                          <th className="w-8">#</th>
                          <th className="w-42"><FormattedMessage id="affiliateName" /></th>
                          <th className="w-17"><FormattedMessage id="points" /></th>
                          <th className="w-17"><FormattedMessage id="total" /></th>
                          <th className="w-17"><FormattedMessage id="status" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(this.state.affiliatePaginate || []).map((affiliate, index) => (
                          <React.Fragment>
                            <tr key={index}>
                              <td>
                                {affiliate.index}
                              </td>
                              <td>
                                {affiliate.name}
                              </td>
                              <td>
                                {affiliate.points}
                              </td>
                              <td>
                                {affiliate.amount}
                              </td>
                              <td>
                                {this.getStatus(affiliate.points) ?
                                  <img src={this.getStatus(affiliate.points)} height='20' width='20' alt="logo" />
                                  : <FormattedMessage id="noStatus" />}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table> :
                    <p className="text-center">
                      <FormattedMessage id="noToplistDataAvailable" />
                    </p>}
                </div>
              </React.Fragment> : null}

            {this.state.pages > 1 && (this.state.affiliate && this.state.affiliatePaginate && this.state.affiliatePaginate.length) ? (
              <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={<a href="">...</a>}
                pageCount={this.state.pages}
                forcePage={this.state.page}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={(data) => this.setPage(data.selected)}
                containerClassName="pagination justify-content-end mb-0"
                activeClassName="active"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                disabledClassName="page-link"
                disableInitialCallback
              />
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Toplist.propTypes = {
  id: PropTypes.string
};

export default Toplist;
