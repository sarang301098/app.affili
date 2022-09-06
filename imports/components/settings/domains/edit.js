import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Alert from 'react-s-alert';
import { withRouter } from 'react-router-dom';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import { FormattedMessage } from 'react-intl';
import domainRegex from 'domain-regex';
import punycode from 'punycode';

import Domains from 'meteor/affilihero-lib/collections/domains';

import SettingsTab from '../settingsTab';

class Edit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saving: false,
      tld: ''
    };

    this.getDomainById = this.getDomainById.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    this.initialStateSet = true;
    this.setInitialState();
  }

  componentWillReceiveProps(nextProps) {
    const create = !nextProps.match.params.id || nextProps.match.params.id === 'new';
    this.setState({ create });
    this.initialStateSet = true;
    this.setInitialState();
  }

  /**
   * Get Domain By the DomainId
   */
  getDomainById() {
    Meteor.call('getDomainById', (this.props.id || ''), (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ ...res });
      }
    });
  }

  /**
   * Set the Initial State
   */
  setInitialState() {
    this.getDomainById();
  }

  /**
   * Save or Update the Domains
   */
  save(e) {
    const { intl } = this.context;
    e.preventDefault();

    const isNew = !this.props.id || this.props.id === 'new';

    const doc = omit(cloneDeep(this.state), ['createdAt', '_id', 'userId']);
    doc.tld = punycode.toASCII(doc.tld.toLowerCase());

    if (!domainRegex().test(doc.tld)) {
      Alert.error(intl.formatMessage({ id: 'domainRegxError' }));
      return;
    }

    this.setState({ saving: true });

    const callback = (err, id) => {
      const { intl } = this.context;

      if (err) {
        this.setState({ saving: false });
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ saving: false });
        if (isNew) {
          Alert.success(intl.formatMessage({ id: 'domainAdded' }));
        } else {
          Alert.success(intl.formatMessage({ id: 'domainSaved' }));
        }
        this.props.history.push('/settings/domains');
      }
    };

    if (isNew) {
      doc.createdAt = new Date();
      doc.userId = Meteor.userId();
      const insert = {};

      for (const key in doc) {
        if (typeof doc[key] !== 'number' || !isNaN(doc[key])) {
          insert[key] = doc[key];
        }
      }

      Domains.insert(insert, callback);
    } else {
      const update = { $set: {}, $unset: {} };

      for (const key in doc) {
        if (typeof doc[key] === 'number' && isNaN(doc[key])) {
          update.$unset[key] = doc[key];
        } else {
          update.$set[key] = doc[key];
        }
      }

      if (!Object.keys(update.$unset).length) {
        delete update.$unset;
      }

      Domains.update(this.props.id, update, callback);
    }
  }

  render() {
    return (
      <SettingsTab>
        <Helmet title={this.context.intl.formatMessage({ id: 'domain' })} />
        <div className="card-body domain">
          <div className="row">
            <div className="col-md-6">
              <fieldset disabled={this.state.saving}>
                <form onSubmit={e => this.save(e)}>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="form-group">
                        <label><FormattedMessage id="domain" /></label>
                        <input type="text" value={this.state.tld || ''} onChange={e => this.setState({ tld: e.target.value })} className="form-control" required />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary"><FormattedMessage id="save" /></button>
                </form>
              </fieldset>
            </div>
            <div className="col-md-6">
              <h5 className="font-weight-600 mb-3"><FormattedMessage id="connectDomain" /></h5>
              <p><FormattedMessage id="connectDomainInfo" /></p>
              {this.state.showSetup ? (
                <div>
                  <p><FormattedMessage id="setDnsEntry" /></p>
                  <table className="table table-condensed">
                    <thead>
                      <tr>
                        <th><FormattedMessage id="type" /></th>
                        <th><FormattedMessage id="name" /></th>
                        <th><FormattedMessage id="value" /></th>
                      </tr>
                    </thead>
                    {this.state.subdomain ? (
                      <tbody>
                        <tr>
                          <td>CNAME</td>
                          <td>{this.state.tld}</td>
                          <td>app.affilihero.io</td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        <td>A</td>
                        <td>{this.state.tld}</td>
                        <td>116.203.145.39</td>
                      </tbody>
                    )}
                  </table>
                </div>
              ) : (
                <div>
                  <div className="mb-2"><FormattedMessage id="useOne" /> <strong><FormattedMessage id="subdomain" /></strong>?</div>
                  <div className="d-flex mt-3">
                    <button type="button" onClick={() => this.setState({ showSetup: true, subdomain: true })} className="btn btn-success text-white w-60 mr-2"><FormattedMessage id="yes" /></button>
                    <button type="button" onClick={() => this.setState({ showSetup: true, subdomain: false })} className="btn btn-danger w-60"><FormattedMessage id="no" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SettingsTab>
    );
  }
}

Edit.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(createContainer(({ match }) => {
  const id = match.params.id;
  return {
    id
  };
}, Edit));
