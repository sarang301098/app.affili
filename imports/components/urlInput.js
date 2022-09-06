import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';
import * as qs from 'qs';
import Creatable from 'react-select/lib/Creatable';
import reactSelectStyle from '../utils/reactSelectStyle';
import { Random } from 'meteor/random';
import Select from 'react-select';

class UrlInput extends Component {
  constructor(props) {
    super(props);

    this.id = Random.id();

    this.state = {
      utmEnabled: false,
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
      defaultUtmSources: [
        'facebook',
        'instagram',
        'adwords',
        'youtube'
      ],
      defaultUtmMediums: [
        'cpc',
        'ads',
        'email',
        'social',
        'seo'
      ],
      defaultUtmCampaigns: [
        'retargeting'
      ]
    };
  }

  componentDidMount() {
    this.parseValue(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    this.parseValue(nextProps.value);
  }

  parseValue(value) {
    if (!value || value.indexOf('?') < 0) {
      return;
    }

    const query = qs.parse(value.substr(value.indexOf('?') + 1));

    if (query.utm_campaign || query.utm_source || query.utm_medium || query.utm_term || query.utm_content) {
      query.utmEnabled = true;
    }

    this.setState(query);
  }

  updateQuery(update) {
    this.setState(update, () => {
      let url = this.props.value;

      let queryObj = {};

      if (url.indexOf('?') > -1) {
        queryObj = qs.parse(url.substr(url.indexOf('?') + 1));
        delete queryObj.utm_source;
        delete queryObj.utm_medium;
        delete queryObj.utm_campaign;
        delete queryObj.utm_term;
        delete queryObj.utm_content;

        url = url.substr(0, url.indexOf('?'));
      }

      if (this.state.utm_source) {
        queryObj.utm_source = this.state.utm_source;
      }
      if (this.state.utm_medium) {
        queryObj.utm_medium = this.state.utm_medium;
      }
      if (this.state.utm_campaign) {
        queryObj.utm_campaign = this.state.utm_campaign;
      }
      if (this.state.utm_term) {
        queryObj.utm_term = this.state.utm_term;
      }
      if (this.state.utm_content) {
        queryObj.utm_content = this.state.utm_content;
      }

      const query = qs.stringify(queryObj);
      if (query) {
        url += '?' + query;
      }

      this.props.onChange({ target: { value: url } });
    });
  }

  setUtmEnabled(checked) {
    const state = {
      utmEnabled: checked
    };

    const queryUpdate = {};
    if (!checked) {
      queryUpdate.utm_source = '';
      queryUpdate.utm_medium = '';
      queryUpdate.utm_campaign = '';
      queryUpdate.utm_term = '';
      queryUpdate.utm_content = '';
      this.updateQuery(queryUpdate);
    }

    this.setState(state);
  }

  render() {
    return (
      <div>
        <input
          type="url"
          className={this.props.className || 'form-control'}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
          value={this.props.value || ''}
          onChange={e => this.props.onChange(e)}
        />

        <div className="form-check mt-2 mb-1">
          <input className="form-check-input" type="checkbox" id={'utmEnabled-' + this.id} checked={!!this.state.utmEnabled} onChange={e => this.setUtmEnabled(e.target.checked)} />
          <label className="form-check-label" htmlFor={'utmEnabled-' + this.id}>
            <small><FormattedMessage id="useUtmParameters" /></small>
          </label>
        </div>

        {this.state.utmEnabled ? (
          <div className="ml-3 pl-2 card p-2 px-3 pb-3 mt-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            <div className="row">
              <div className="col-md-4">
                <div className="mb-1"><small>UTM Source</small></div>
                <Creatable
                  value={this.state.utm_source ? { label: this.state.utm_source, value: this.state.utm_source } : null}
                  onChange={option => this.updateQuery({ utm_source: option ? option.value : null })}
                  className="w-100"
                  options={this.state.defaultUtmSources.map(item => ({ label: item, value: item }))}
                  backspaceToRemoveMessage={''}
                  placeholder={''}
                  noOptionsMessage={() => ''}
                  formatCreateLabel={input => '"' + input + '" erstellen…'}
                  onCreateOption={val => this.setState({ defaultUtmSources: [...this.state.defaultUtmSources, val] }, () => this.updateQuery({ utm_source: val }))}
                  styles={reactSelectStyle.styles}
                  theme={Meteor.isClient && window.nightMode ? reactSelectStyle.themeDark : reactSelectStyle.theme}
                  isClearable
                />
              </div>
              <div className="col-md-4">
                <div className="mb-1"><small>UTM Medium</small></div>
                <Creatable
                  value={this.state.utm_medium ? { label: this.state.utm_medium, value: this.state.utm_medium } : null}
                  onChange={option => this.updateQuery({ utm_medium: option ? option.value : null })}
                  className="w-100"
                  options={this.state.defaultUtmMediums.map(item => ({ label: item, value: item }))}
                  backspaceToRemoveMessage={''}
                  placeholder={''}
                  noOptionsMessage={() => ''}
                  formatCreateLabel={input => '"' + input + '" erstellen…'}
                  onCreateOption={val => this.setState({ defaultUtmMediums: [...this.state.defaultUtmMediums, val] }, () => this.updateQuery({ utm_medium: val }))}
                  styles={reactSelectStyle.styles}
                  theme={Meteor.isClient && window.nightMode ? reactSelectStyle.themeDark : reactSelectStyle.theme}
                  isClearable
                />
              </div>
              <div className="col-md-4">
                <div className="mb-1"><small>UTM Campaign</small></div>
                <Creatable
                  value={this.state.utm_campaign ? { label: this.state.utm_campaign, value: this.state.utm_campaign } : null}
                  onChange={option => this.updateQuery({ utm_campaign: option ? option.value : null })}
                  className="w-100"
                  options={this.state.defaultUtmCampaigns.map(item => ({ label: item, value: item }))}
                  backspaceToRemoveMessage={''}
                  placeholder={''}
                  noOptionsMessage={() => ''}
                  formatCreateLabel={input => '"' + input + '" erstellen…'}
                  onCreateOption={val => this.setState({ defaultUtmCampaigns: [...this.state.defaultUtmCampaigns, val] }, () => this.updateQuery({ utm_campaign: val }))}
                  styles={reactSelectStyle.styles}
                  theme={Meteor.isClient && window.nightMode ? reactSelectStyle.themeDark : reactSelectStyle.theme}
                  isClearable
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-4">
                <div className="mb-1"><small>UTM Term</small></div>
                <input type="text" value={this.state.utm_term || ''} onChange={e => this.updateQuery({ utm_term: e.target.value })} className="form-control input-sm" />
              </div>
              <div className="col-md-4">
                <div className="mb-1"><small>UTM Content</small></div>
                <input type="text" value={this.state.utm_content || ''} onChange={e => this.updateQuery({ utm_content: e.target.value })} className="form-control input-sm" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

UrlInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

UrlInput.defaultProps = {
  value: null,
  onChange: null
};

UrlInput.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default UrlInput;
