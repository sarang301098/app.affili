import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FormattedMessage } from 'react-intl';
import ReactPaginate from 'react-paginate';

import Projects from 'meteor/affilihero-lib/collections/projects';

import Confirm from '../confirm';
import Loader from '../loader';

const PAGE_SIZE = 20;

class ListProjects extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      loaded: true,
      pages: 0,
      page: (props.location.state || {}).page || 0,
    };

    this.getProjects = this.getProjects.bind(this);
    this.setPage = this.setPage.bind(this);
    this.removeProject = this.removeProject.bind(this);
    this.removeToplists = this.removeToplists.bind(this);
    this.removeProducts = this.removeProducts.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }

  componentDidMount() {
    this.getProjects();
  }

  /**
 * get Projects Debounce (after entering query)
 */
  getProjectDebounce = _.debounce(() => { this.getProjects(); }, 1000);

  /**
   * Get All Projects Based on the Pagination Data and SearchQuery (if there)
   */
  getProjects() {
    Meteor.call('getProjects', this.state.page, PAGE_SIZE, (this.state.searchQuery || ''), (err, res) => {
      if (err) {
        Alert.error(err.reason || err.message);
      }
      if (res) {
        this.setState({ ...res });
      }
    });
  }

  /**
   * Set the Page For the Pagination and get the Projects based on the pagination Data
   */
  setPage(page) {
    this.props.history.push(this.props.location.pathname, { page });
    this.setState({ page }, () => this.getProjects());
  }

  /**
   * Remove The Project From Collection By Id
   */
  removeProject(projectId) {
    const { intl } = this.context;

    if (projectId) {
      this.setState({ loaded: false });
      Projects.remove(projectId, (err) => {
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Meteor.call('removeProjectIdFromSubUser', projectId || '', (err, res) => {
            if (err) {
              Alert.error(err.reason || err.message);
            }
          });
          Meteor.call('removeProductsByProjectIdFromAffiliateUser', projectId || '', (err, res) => {
            if (err) {
              Alert.error(err.reason || err.message);
            }
          });

          Alert.success(intl.formatMessage({ id: 'projectDeleted' }));
        }
      });
      this.setState({ loaded: true });
    } else {
      Alert.error(intl.formatMessage({ id: 'noProjectFound' }));
    }
    this.removeToplists(projectId);
    this.removeProducts(projectId);
    this.getProjects();
  }

  /**
   * Remove Toplist By the ProjectId
   */
  removeToplists(projectId) {
    const { intl } = this.context;

    this.setState({ loaded: false });
    Meteor.call('removeToplists', (projectId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'toplistDeleted' }));
      }
    });
  }

  /**
   * Remove Products By the ProjectId
   */
  removeProducts(projectId) {
    const { intl } = this.context;

    this.setState({ loaded: false });
    Meteor.call('removeProducts', (projectId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'productDeleted' }));
      }
    });
  }

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
      <div>
        <Helmet title="Projects" />
        <div className="content">
          <div className="container-fluid">
            <Loader loaded={this.state.loaded}>
              <div>
                <div className="page-header d-flex flex-wrap align-items-center pb-0">
                  <h1 className="h5 mb-0 mr-auto"><FormattedMessage id="projects" /></h1>
                  <div className="searchBar">
                    <input type="text" className="form-control search-bar border-0" placeholder={intl.formatMessage({ id: 'searchForProjects' })} value={this.state.searchQuery} onChange={e => this.setState({ searchQuery: e.target.value }, () => this.getProjectDebounce())} />
                  </div>
                  <Link to={'/project/new/edit'} ><button type="button" className="btn btn-outline-primary ml-3"><i className="fa fa-plus mr-2" /><FormattedMessage id="createProject" /></button> </Link>
                </div>

                {!(this.state.projects && this.state.projects.length) ? (
                  <div className="mt-md-5">
                    <p className="lead text-center"><FormattedMessage id="noprojectsFound" /></p>
                  </div>
                ) : (
                  <React.Fragment>
                    <div className="list-group-entities">
                      <div className="table-responsive">
                        <table className="table vm no-th-brd pro-of-month mb-0">
                          <tbody>
                            {(this.state.projects || []).map((project, index) => (
                              <tr key={index} className="animated animated-list-item fadeIn" onClick={e => this.redirectTo(e, '/project/' + project._id + '/edit')} >
                                <td>
                                  {project.name}
                                </td>
                                <td className="text-right funnel-list-actions">
                                  <button type="button" id={'edit-' + project._id} onClick={e => this.redirectTo(e, '/project/' + project._id + '/edit')} className="btn btn-link btn-sm"> <i className="fa fa-cog mr-1" /> <FormattedMessage id="edit" /></button> &nbsp;

                                  {Meteor.isClient && Meteor.user() && (Meteor.user().subUser && !(project.createdBySubUser)) ? null :
                                    <Confirm
                                      onConfirm={() => this.removeProject(project._id)}
                                      body={<FormattedMessage id="deleteProjectBodyText" />}
                                      confirmText={<FormattedMessage id="remove" />}
                                      cancelText={<FormattedMessage id="deleteProjectAbortText" />}
                                      title={<FormattedMessage id="deleteProjectTitleText" />}
                                    >
                                      <button type="button" id={'delete-' + project._id} className="btn btn-link btn-sm"><i className="fa fa-trash mr-1" /> <FormattedMessage id="remove" /></button>
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
              </div>

              {(this.state.projects && this.state.projects.length) ?
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
      </div >
    );
  }
}

ListProjects.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default ListProjects;
