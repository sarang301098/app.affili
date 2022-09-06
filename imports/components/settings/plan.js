import React from 'react';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import { Modal, ModalFooter, ModalBody, ModalHeader } from 'reactstrap';
import { createContainer } from 'meteor/react-meteor-data';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import Plans from 'meteor/affilihero-lib/collections/plans';

import PlanSelection from './planSelection';
import SettingsTab from './settingsTab';

class ManagePlan extends React.Component {
  constructor() {
    super();

    this.state = {
      showCancellationModal: false
    };

    this.cancelPlan = this.cancelPlan.bind(this);
  }

  cancelPlan() {
    const { intl } = this.context;

    Meteor.call('cancelPlan', (err) => {
      if (err) {
        Alert.error(err.reason);
      } else {
        this.setState({ showCancellationModal: false });
        Alert.success(intl.formatMessage({ id: 'planCancleSuccess' }));
      }
    });
  }

  popupCenter(url, title, w, h) {
    const dualScreenLeft = typeof window.screenLeft !== 'undefined' ? window.screenLeft : screen.left;
    const dualScreenTop = typeof window.screenTop !== 'undefined' ? window.screenTop : screen.top;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const left = ((width / 2) - (w / 2)) + dualScreenLeft;
    const top = ((height / 2) - (h / 2)) + dualScreenTop;
    const newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    if (window.focus) {
      newWindow.focus();
    }

    return newWindow;
  }

  render() {
    let planInfo;
    let cancelPlan;
    if (Meteor.user() && Meteor.user().plan) {
      let upgradeDowngradePlan;
      if (Meteor.user().plan.active && !Meteor.user().plan.cancelled && this.props.userPlan && !this.props.userPlan.defaultPlan) {
        /*
        cancelPlan = (
          <div className="mt-5">
            <hr />

            <div className="mb-4 mt-5 font-weight-normal">
              <div className="mb-2"><strong>Tarif kündigen</strong></div>
              <div>
                <button className="btn btn-danger btn-xs" onClick={() => this.setState({ showCancellationModal: true })}>Tarif jetzt kündigen</button>
              </div>
            </div>
          </div>
        ); */
        upgradeDowngradePlan = (
          <div className="font-weight-normal mb-3" />
        );
      }

      let planStatus;
      if (Meteor.user().plan.cancelled) {
        planStatus = <strong className="text-warning"><FormattedMessage id="cancelled" /></strong>;
      } else if (Meteor.user().plan.active) {
        planStatus = <strong className="text-success"><FormattedMessage id="active" /></strong>;
      } else {
        planStatus = <strong className="text-danger"><FormattedMessage id="inactive" /></strong>;
      }

      planInfo = (
        <div>
          <div className="mb-5">
            <div className="row mb-3 justify-content-center text-center">
              <div className="col-md-6">
                <div className="text-muted mb-2" style={{ textTransform: 'uppercase' }}><FormattedMessage id="yourPlan" /></div>
                <h4>{this.props.userPlan.name}</h4>
              </div>
              <div className="col-md-6">
                <div className="text-muted mb-2" style={{ textTransform: 'uppercase' }}>Status</div>
                <h4>{planStatus}</h4>
              </div>
            </div>

            <hr />
          </div>

          {upgradeDowngradePlan}
        </div>
      );
    }

    return (
      <SettingsTab>
        {planInfo}

        <div className="mt-md-3">
          {Meteor.user() && Meteor.user().plan && !Meteor.user().plan.active ? (
            <div className="mb-4 alert alert-primary">
              <FormattedMessage id="planAlertText" />
            </div>
          ) : null}
          <PlanSelection />
        </div>

        <Modal
          isOpen={this.state.showCancellationModal} toggle={() => this.setState({ showCancellationModal: false })}
          size="lg" className="cancelPlanModal"
        >
          <ModalHeader toggle={() => this.setState({ showCancellationModal: false })}>
            <FormattedMessage id="cancleTarrif" />
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              <div>
                <h3 className="font-bold text-light" style={{ fontSize: '20px' }}>Tarif kündigen</h3>
                <p><FormattedMessage id="cancleTarrifHere" /></p>
                <br />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="text-center">
              <button
                type="button" className="btn btn-default"
                onClick={() => this.setState({ showCancellationModal: false })}
              ><FormattedMessage id="cancel" />
              </button>
              <button type="button" className="btn btn-danger" onClick={() => this.cancelPlan()}>Jetzt kündigen</button>
            </div>
          </ModalFooter>
        </Modal>
      </SettingsTab>
    );
  }
}

ManagePlan.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default createContainer(() => {
  const plansHandle = Meteor.subscribe('plans');

  return {
    userPlan: Meteor.user() && Meteor.user().plan && plansHandle.ready() ? Plans.findOne(Meteor.user().plan.id) || {} : { defaultPlan: false }
  };
}, ManagePlan);
