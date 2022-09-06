import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Alert from 'react-s-alert';
import numeral from 'numeral';
import { FormattedMessage } from 'react-intl';

import Plans from 'meteor/affilihero-lib/collections/plans';

import Loader from '../loader';

class PlanSelection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yearlyPricing: true
    };
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

  selectPlan(plan) {
    if (plan.addon && Meteor.user() && Meteor.user().plan && !Meteor.user().plan.active) {
      Alert.error('Bitte wähle zunächst einen Tarif aus, bevor du ein Addon wählst.');
      return;
    }
    this.popupCenter('/settings/plan/' + plan._id + '/' + (this.state.yearlyPricing ? 'yearly' : 'monthly') + '/' + Meteor.userId() + '/redirect' + (window.location.search || ''));
  }

  render() {
    const addons = this.props.plans.filter(p => p.addon);
    addons.forEach((plan) => {
      if (this.props.currentUser && this.props.currentUser.plan && this.props.currentUser.plan.addonIds && this.props.currentUser.plan.addonIds.indexOf(plan._id) > -1) {
        addons.push(Object.assign({}, plan, { notSelected: true }));
      }
    });

    return (
      <Loader loaded={this.props.loaded}>
        {/*
        <div className="text-center mb-3">
          <div className="toggle-wrap">
            <div className="yearly-info">Spare bis zu 60%!</div>

            <label className="toggler toggler--is-active" id="filt-monthly">Monatlich</label>

            <div className="toggle">
              <input type="checkbox" id="switcher" className="check" onChange={e => this.setState({ yearlyPricing: e.target.checked })} checked={this.state.yearlyPricing} />
              <b className="d-block switch" />
            </div>

            <label className="toggler" id="filt-yearly">Jährlich</label>
          </div>
        </div>
        */}

        <div className="row pricing-plan mb-3">
          {this.props.plans.filter(p => !p.addon).map((plan, i) => {
            const planSelected = this.props.currentUser && this.props.currentUser.plan && this.props.currentUser.plan.active && !this.props.currentUser.plan.cancelled && this.props.currentUser.plan.id === plan._id;
            let selectButton;
            if (Meteor.userId()) {
              selectButton = <button type="button" onClick={this.selectPlan.bind(this, plan)} className="btn btn-primary font-weight-bold mt-4" disabled={planSelected}>{planSelected ? <FormattedMessage id="selected" /> : <FormattedMessage id="select" />}</button>;
            }

            return (
              <div key={plan._id} className="col-md-3 col-xs-12 col-sm-6 no-padding d-md-flex align-items-center">
                <div className={'panel panel-default pricing-box w-100' + (planSelected ? ' featured-plan' : '')}>
                  <div className={'panel-body pt-4 pb-4'}>
                    <div className="">
                      <h4 className="text-center text-primary">{plan.name}</h4>
                      <h3 className="text-center">
                        {planSelected ? (
                          <span>&nbsp;</span>
                        ) : (
                          <span>{numeral(this.state.yearlyPricing && plan.yearlyCost ? plan.yearlyCost : (plan.onetimeCost || plan.monthlyCost)).format('0,0')}€ {!plan.onetimeCost ? <small>/ {this.state.yearlyPricing && plan.yearlyCost ? 'Jahr' : 'Monat'}</small> : null}</span>
                        )}
                      </h3>
                    </div>
                    <div className="price-table-content">
                      <div className="price-row text-center text-primary">{plan.maximumProjects >= 0 ? plan.maximumProjects : '∞'} {plan.maximumProjects === 1 ? 'Projekt' : 'Projekte'}</div>
                      <div className="price-row text-center text-primary">{plan.maximumSubUsers >= 0 ? plan.maximumSubUsers : '∞'} {plan.maximumSubUsers === 1 ? 'Unterbenutzer' : 'Unterbenutzer'}</div>
                      <div className="price-row text-center text-primary">{plan.maximumToplists >= 0 ? plan.maximumToplists : '∞'} {plan.maximumToplists === 1 ? 'Bestenliste' : 'Toplisten'}</div>
                      <div className="price-row text-center">
                        {selectButton}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Loader>
    );
  }
}

PlanSelection.contextTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const data = { plans: [], currentPlan: {}, loaded: false };
  data.currentUser = Meteor.user();
  Meteor.subscribe('userData');
  const plansSub = Meteor.subscribe('plans');

  data.plans = Meteor.user() ? Plans.find({ $or: [{ visible: { $ne: false } }, { _id: (Meteor.user().plan || {}).id }, { _id: { $in: (Meteor.user().plan || {}).addonIds || [] } }] }, { sort: { monthlyCost: 1 } }).fetch() : [];

  if (plansSub.ready()) {
    data.loaded = true;
    if (data.currentUser && typeof Meteor.user().plan !== 'undefined') {
      data.currentPlan = Plans.findOne(Meteor.user().plan.id);
    }
  }
  return data;
}, PlanSelection);
