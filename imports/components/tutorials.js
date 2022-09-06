import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Alert from 'react-s-alert';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

class Tutorials extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  render() {
    return (
      <div>
        <h2>Tutorials</h2>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>Kampagne bearbeiten: Teil 1</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/ofccwPkfKbZDaDkh4'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>Kampagne bearbeiten: Teil 2</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/djLuAsFoHpzWQvLpT'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>E-Mail Opt-In</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/DkYqdbMgSkYCcydNg'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>Aktionen</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/8XXDEP2vLxNjHTB3E'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>E-Mail Integration</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/YReftqqijwHFJ2uti'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>Pixel</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/b85TH5Sf8kw2rYT3n'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>Digistore24 Integration</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/65pLZYZZm5iNHdbTE'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              <p><strong>Domain Anbindung</strong></p>
              <div className="video-container">
                <iframe scrolling="no" src={'https://embed.funnelcockpit.com/video-player/r8M7HtGgYgi6KF7CM'} allowTransparency allowFullScreen />
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

Tutorials.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default createContainer(() => {

  return {
  };
}, Tutorials);
