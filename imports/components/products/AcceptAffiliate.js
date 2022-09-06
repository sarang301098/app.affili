import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';
import Alert from 'react-s-alert';
import { createContainer } from 'meteor/react-meteor-data';
import { FormattedMessage } from 'react-intl';

import Confirm from '../confirm';
import Loader from '../loader';
import ProjectTabs from '../projects/projectTabs';
import ProductTabs from '../products/productTabs';

class AcceptAffiliate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: true
    };

    this.getProductById = this.getProductById.bind(this);
    this.getAffiliateUserList = this.getAffiliateUserList.bind(this);
    this.verifyAffiliateUser = this.verifyAffiliateUser.bind(this);
    this.rejectAffiliateUser = this.rejectAffiliateUser.bind(this);
  }

  componentDidMount() {
    this.getAffiliateUserList();
    this.getProductById();
  }

  /**
   * Get The Product Data By the ProductId
   */
  getProductById() {
    this.setState({ loaded: false });
    Meteor.call('getProductById', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ name: res.name || '', marketPlace: res.marketPlace });
      }
    });
  }

  /**
   * Get All Affiliate USer List Which are assign or underverification of the Project By ProjectId
   */
  getAffiliateUserList() {
    this.setState({ loaded: false });
    Meteor.call('getAffiliateUserList', (this.props.productId || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ affiliateUsers: (res || []) });
      }
    });
  }

  /**
   * Verify The User For the Product
   */
  verifyAffiliateUser(userId, product) {
    const { intl } = this.context;
    this.setState({ loaded: false });
    Meteor.call('verifyAffiliateUserProduct', (userId || ''), (product || {}), (err) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'projectVerifiedToUser' }));
      }
    });
    this.getAffiliateUserList();
  }

  /**
   * Reject Affiliate User For the Project
   */
  rejectAffiliateUser(userId, product) {
    const { intl } = this.context;
    this.setState({ loaded: false });
    Meteor.call('rejectAffiliateUserProduct', (userId || ''), (product || {}), (err) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(intl.formatMessage({ id: 'projectRejectedToUser' }));
      }
    });
    this.getAffiliateUserList();
  }

  render() {
    return (
      <div>
        <Helmet title="Access Affiliate" />
        <div className="content">
          <div className="container-fluid">
            <div className="page-header">
              <h1 className="h5 m-0"><FormattedMessage id="editProduct" />{this.state.name ? `: ${this.state.name}` : ''}</h1>
            </div>
 
            <Loader loaded={this.state.loaded} >
              <ProjectTabs projectId={this.props.projectId} >
                <div className="card-header bg-white">
                  <ProductTabs projectId={this.props.projectId} productId={this.props.productId} />
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush my-n3">
                    {this.state.affiliateUsers && this.state.affiliateUsers.length ? this.state.affiliateUsers.map((user, index) => (
                      <li className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between" key={index}>

                        {user && user.profile ?
                          <div>
                            <div className="d-flex align-items-center">
                              <img src={user.profile && (user.profile || {}).picture ? (user.profile || {}).picture : '/images/default-avatar.png'} height="35" width="35" className="rounded-circle" />
                              <h6 className="mb-0 ml-2"> {user.profile && (user.profile || {}).name ? (user.profile || {}).name : 'N/A'}</h6>
                            </div>
                          </div>
                          :
                          <div className="d-flex align-items-center">
                            <img src={'/images/default-avatar.png'} height="35" width="35" className="rounded-circle" />
                            <h6 className="mb-0 ml-2"> {'N/A'}</h6>
                          </div>
                        }

                        {user.product && ((user.product || {}).isVerified || (user.product || {}).isRejected) ?
                          <div>
                            {(user.product || {}).isVerified ?
                              <span className="badge badge-success text-white ml-auto"><i className="fa fa-check mr-1" /> <FormattedMessage id="verified" /></span>
                              : null}
                            {(user.product || {}).isRejected ?
                              <span className="badge badge-danger text-white ml-auto"><i className="fa fa-close mr-1" /> <FormattedMessage id="rejected" /></span>
                              : null}
                          </div>
                          :
                          <div>
                            <Confirm
                              onConfirm={() => this.verifyAffiliateUser(user.userId, user.product)}
                              body={<FormattedMessage id="approveUserBodyText" />}
                              confirmText={<FormattedMessage id="approve" />}
                              cancelText={<FormattedMessage id="approveUserAbortText" />}
                              title={<FormattedMessage id="approveUserTitleText" />}
                            >
                              <button type="button" className="btn btn-outline-success btn-sm ml-auto mr-2" ><i className="fa fa-check" /></button>
                            </Confirm>

                            <Confirm
                              onConfirm={() => this.rejectAffiliateUser(user.userId, user.product)}
                              body={<FormattedMessage id="rejectUserBodyText" />}
                              confirmText={<FormattedMessage id="remove" />}
                              cancelText={<FormattedMessage id="rejectUserAbortText" />}
                              title={<FormattedMessage id="rejectUserTitleText" />}
                            >
                              <button type="button" className="btn btn-outline-danger btn-sm ml-auto" ><i className="fa fa-close" /></button>
                            </Confirm>
                          </div>}
                      </li>
                    )) :
                    <span className="text-center my-3">
                      <FormattedMessage id="noAffiliateUsers" />
                    </span>}
                  </ul>
                </div>

              </ProjectTabs>
            </Loader>

          </div>
        </div>
      </div>
    );
  }
}

AcceptAffiliate.propTypes = {
  projectId: PropTypes.string.isRequired
};

AcceptAffiliate.contextTypes = {
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
}, AcceptAffiliate);
