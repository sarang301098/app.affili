import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Alert from 'react-s-alert';
import _ from 'lodash';
import qs from 'qs';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';
import Plans from 'meteor/affilihero-lib/collections/plans';

import SettingsTab from '../settingsTab';
import Confirm from '../../confirm';

class EditExternalProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isNew: !props.id || props.id === 'new',
      name: '',
      type: props.query.type || ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.testData = this.testData.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(Object.assign({}, nextProps.externalProvider, {
      isNew: !nextProps.id || nextProps.id === 'new',
      type: nextProps.query.type || (nextProps.externalProvider || {}).type
    }));
  }

  /**
   * Save the Data
   */
  handleSubmit(e) {
    e.preventDefault();
    this.save();
  }

  /**
   * Save/Update the External Provider Data
   */
  save(callbackParam) {
    const { intl } = this.context;

    const doc = _.pick(this.state, ['name', 'type', 'username', 'password', 'apiKey', 'apiBaseUrl']);

    let callback;
    if (typeof callbackParam === 'function') {
      callback = callbackParam;
    } else {
      callback = (err) => {
        if (err) {
          Alert.error(err.reason || err.message);
        } else {
          Alert.success(intl.formatMessage({ id: 'providerSavesSuccess' }));
          this.props.history.push('/settings/external-providers');
        }
      };
    }

    if (this.state.isNew) {
      doc.createdAt = new Date();
      doc.userId = Meteor.userId();
      ExternalProviders.insert(doc, { removeEmptyStrings: false }, callback);
    } else {
      ExternalProviders.update(this.props.id, { $set: doc }, { removeEmptyStrings: false }, callback);
    }
  }

  /**
   * Manage The State Change
   */
  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  /**
   * Manage CheckBox Data Change
   */
  handleCheckboxChange(e) {
    const state = {};
    state[e.target.name] = e.target.checked;
    this.setState(state);
  }

  /**
   * Test The ApiKey Correct or Not Based on the How many products This Apikey Has
   */
  testData() {
    const { intl } = this.context;
    this.setState({ testingData: true });

    if (this.state.type === 'digistore24') {
      Meteor.call('checkDigistore24apiKey', (this.state.type || ''), (this.state.apiKey || ''), (err, res) => {
        this.setState({ testingData: false });
        if (!res || err) {
          Alert.error(intl.formatMessage({ id: 'dataNotCorrectAlert' }));
        } else {
          Alert.success(intl.formatMessage({ id: 'dataCorrectAlert' }));
        }
      });
    } else {
      Meteor.call('testExternalProvider', {
        type: this.state.type,
        username: this.state.username,
        password: this.state.password,
        apiKey: this.state.apiKey,
        apiBaseUrl: this.state.apiBaseUrl
      }, (err, res) => {
        this.setState({ testingData: false });
        if (err) {
          Alert.error(err.reason || err.message);
        } else if (!res) {
          Alert.error(intl.formatMessage({ id: 'dataNotCorrectAlert' }));
        } else {
          Alert.success(intl.formatMessage({ id: 'dataCorrectAlert' }));
        }
      });
    }
  }

  /**
   * REmove External Provider
   */
  remove() {
    ExternalProviders.remove(this.props.id, (err) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(this.context.intl.formatMessage({ id: 'integrationRemoveSuccess' }));
        this.props.history.push('/settings/external-providers');
      }
    });
  }

  render() {
    const { userPlan } = this.props;

    return (
      <SettingsTab>
        <Helmet title="Edit Provider" />
        <div className="card">
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className="card-body">
              <div className="mt-3">
                <div className="form-group row">
                  <label className="control-label col-md-3 text-md-right"><FormattedMessage id="name" /></label>
                  <div className="col-md-5">
                    <input type="text" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} className="form-control" required />
                  </div>
                </div>

                <div className="form-group row">
                  <label className="control-label col-md-3 text-md-right">API Key</label>
                  <div className="col-md-5">
                    <input type="text" className="form-control" name="apiKey" value={this.state.apiKey || ''} onChange={this.handleChange} />
                  </div>
                </div>

              </div>
            </div>
            <div className="card-footer text-right">
              <Confirm
                onConfirm={() => this.remove()}
                body="Möchtest du diese Integration wirklich löschen?"
                confirmText="Integration löschen"
                cancelText="Abbrechen"
                title="Integration löschen"
              >
                <button type="button" className="btn btn-primary mr-2"><i className="fa fa-trash fa-fw align-middle font-size-12 mr-1" /> <FormattedMessage id="remove" /></button>
              </Confirm>
              <button type="button" onClick={() => this.testData()} disabled={this.state.testingData} className="btn btn-secondary mr-2"><FormattedMessage id="checkData" /></button>
              <button type="submit" className="btn btn-primary"><FormattedMessage id="save" /></button>
            </div>
          </form>
        </div>
      </SettingsTab>
    );
  }
}

EditExternalProvider.propTypes = {
  id: PropTypes.string,
  externalProvider: PropTypes.object,
  loaded: PropTypes.bool
};

EditExternalProvider.defaultProps = {
  id: null,
  externalProvider: null,
  loaded: false
};

EditExternalProvider.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export default createContainer(({ match }) => {
  const id = match.params.id;
  let loaded = true;
  let externalProvider = null;

  const query = typeof location !== 'undefined' && location.search ? qs.parse(location.search.substr(1)) : {};

  if (id && id !== 'new') {
    const externalProviderHandle = Meteor.subscribe('externalProvider', id);
    loaded = loaded && externalProviderHandle.ready();
    externalProvider = ExternalProviders.findOne(id);
  }

  const user = Meteor.user();
  let userPlan = {};
  if (user && user.plan) {
    userPlan = Object.assign({}, Plans.findOne(user.plan.id), user.plan);
  }

  return {
    id,
    externalProvider,
    loaded,
    userPlan,
    query
  };
}, EditExternalProvider);
