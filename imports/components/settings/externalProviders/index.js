import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Loader from '../../loader';
import SettingsTab from '../settingsTab';

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };

    this.getExternalProviders = this.getExternalProviders.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    this.getExternalProviders();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  /**
   * Get All External Providers Data
   */
  getExternalProviders() {
    this.setState({ loaded: false });
    Meteor.call('getExternalProviders', (err, res) => {
      this.setState({ loaded: true });
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        this.setState({ externalProviders: res || [] });
      }
    });
  }

  render() {
    const { loaded } = this.state;
    return (
      <SettingsTab>
        <React.Fragment>
          <Loader loaded={loaded}>
            <div className="card common-box mb-4 px-4 py-2" >
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <h2 className="h5 font-weight-600 mb-0">DigiStore24</h2>
                  <Link to="/settings/external-provider/new?type=digistore24" className="btn btn-primary">
                    <i className="fa fa-link font-size-12 mr-1 fa-fw" />
                    <FormattedMessage id="connect" />
                  </Link>
                </div>
                {this.state.externalProviders && this.state.externalProviders.length ? (
                  <table className="table mt-3 mb-0">
                    <tbody>
                      {this.state.externalProviders.filter(gateway => gateway.type === 'digistore24').map(provider => (
                        <tr key={provider._id}>
                          <td>{provider.name || provider.type}</td>
                          <td className="text-right">
                            <button type="button" className="btn btn-dark btn-sm" onClick={() => this.props.history.push('/settings/external-provider/' + provider._id)}><i className="fa fa-pencil font-size-12 fa-fw" />&nbsp; <FormattedMessage id="edit" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </div>
            </div >
          </Loader>
        </React.Fragment>
      </SettingsTab>
    );
  }
}

export default withRouter(Index);
