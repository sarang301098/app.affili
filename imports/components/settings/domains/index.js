import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';
import ReactPaginate from 'react-paginate';

import Domains from 'meteor/affilihero-lib/collections/domains';

import Loader from '../../loader';
import SettingsTab from '../settingsTab';
import Confirm from '../../confirm';

const PAGE_SIZE = 5;

class ListDomains extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      pages: 0,
      page: (props.location.state || {}).page || 0,
    };

    this.getDomains = this.getDomains.bind(this);
    this.setPage = this.setPage.bind(this);
    this.removeDomain = this.removeDomain.bind(this);
  }

  componentDidMount() {
    this.getDomains();
  }

  /**
   * Get All Domains of the Current User
   */
  getDomains() {
    this.setState({ loaded: false });
    Meteor.call('getPaginateDomains', this.state.page, PAGE_SIZE, (err, res) => {
      if (err) {
        Alert.error(err.reason);
      } else {
        this.setState({ ...res, loaded: true });
      }
    });
  }

  /**
   * Set the Page For the Pagination and get the Projects based on the pagination Data
   */
  setPage(page) {
    this.props.history.push(this.props.location.pathname, { page });
    this.setState({ page }, () => this.getDomains());
  }

  /**
   * Remove The Domain By The DomainId
   */
  removeDomain(domainId) {
    const { intl } = this.context;

    Domains.remove(domainId, (err) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'domainDeleted' }));
      }
    });
    this.getDomains();
  }

  render() {
    return (
      <SettingsTab>
        <React.Fragment>
          <Helmet title="Domains" />
          <div className="card-body domains">
            <div className="d-flex align-items-center mb-3">
              <h5><FormattedMessage id="domains" /></h5>
              <Link to="/settings/domain/new" className="btn btn-primary ml-auto"><i className="fa fa-plus mr-2" /><FormattedMessage id="addDomain" /></Link>
            </div>
            <div className="panel panel-default m-0 p-0 pb-2">
              <div className="panel-body">
                <Loader loaded={this.state.loaded}>
                  {!(this.state.domains || []).length ? (
                    <p className="text-muted text-center"><FormattedMessage id="noDataAvailable" /></p>
                  ) : (
                    <div>
                      <table className="table">
                        <thead>
                          <tr>
                            <th><FormattedMessage id="domain" /></th>
                            <th className="w-120 text-center"><FormattedMessage id="actions" /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(this.state.domains || []).map((domain, index) => (
                            <tr key={index}>
                              <td>{(domain.tld || '')}</td>
                              <td className="text-center">
                                <Link to={'/settings/domain/' + domain._id} className="btn btn-outline-primary btn-sm mr-2"><i className="fa fa-pencil fa-fw" /></Link>
                                <Confirm
                                  onConfirm={() => this.removeDomain(domain._id)}
                                  body={<FormattedMessage id="deleteDomainBodyText" />}
                                  confirmText={<FormattedMessage id="remove" />}
                                  cancelText={<FormattedMessage id="deleteDomainAbortText" />}
                                  title={<FormattedMessage id="deleteDomainTitleText" />}
                                >
                                  <button type="button" onClick={() => this.removeDomain(domain._id)} className="btn btn-outline-primary btn-sm"><i className="fa fa-trash fa-fw" /></button>
                                </Confirm>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {(this.state.domains && this.state.domains.length) ?
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
                </Loader>
              </div>
            </div>
          </div>
        </React.Fragment>
      </SettingsTab>
    );
  }
}

ListDomains.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default ListDomains;
