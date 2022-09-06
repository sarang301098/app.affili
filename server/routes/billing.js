import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Accounts } from 'meteor/accounts-base';
import moment from 'moment';

import Plans from 'meteor/affilihero-lib/collections/plans';
import Products from 'meteor/affilihero-lib/collections/products';

import { silderPlans } from '../../imports/data/sliderPlans';
import digiStore24Config from '../config/digistore24';
import digistore24Signature from '../../imports/utils/digistore24Signature';

export default {
  '/webhook/digistore24': (req, res) => {
    res.writeHead(200);

    const hash = digistore24Signature(req.body, digiStore24Config.ipnPassphrase);
    if (hash !== req.body.sha_sign) {
      res.end('Wrong signature - CALCULATED: ' + hash + ' - GIVEN: ' + req.body.sha_sign + '\n\n' + JSON.stringify(req.body));
    }

    if (req.body.event === 'on_payment' || req.body.event === 'on_rebill_resumed') {
      let user;
      let custom;
      if (req.body.custom && req.body.custom.length) {
        let userId;

        let bodyCustom = req.body.custom;
        // check if param contains {}: but not " (thx digistore...)
        if (bodyCustom.indexOf('{') > -1 && bodyCustom.indexOf('}') > -1 && bodyCustom.indexOf(':') > -1 && bodyCustom.indexOf('"') < 0) {
          bodyCustom = bodyCustom.replace('{', '{"').replace('}', '"}').replace(':', '":"');
        }

        try {
          custom = JSON.parse(decodeURIComponent(bodyCustom));
          userId = custom.userId;
        } catch (err) {
          console.log('error while parsing custom param: ' + err.message);
          console.log('req.body.custom decoded', decodeURIComponent(req.body.custom));
          userId = req.body.custom;
        }
        user = Meteor.users.findOne(userId);
      }

      let userCreated = false;
      if (!user) {
        const ors = [{ 'billing.digistore24OrderId': req.body.order_id }, {
          'emails.address': {
            $regex: req.body.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            $options: 'i'
          }
        }];
        if (req.body.upgraded_order_id) {
          ors.unshift({ 'billing.digistore24OrderId': req.body.upgraded_order_id });
        }
        user = Meteor.users.findOne({ $or: ors });
        if (!user) {
          userCreated = true;
          Accounts.createUser({
            email: req.body.email,
            profile: {
              firstName: req.body.address_first_name,
              lastName: req.body.address_last_name,
              company: req.body.address_company,
              name: req.body.address_first_name + ' ' + req.body.address_last_name,
              address: req.body.address_street,
              city: req.body.address_city,
              zip: req.body.address_zipcode,
              country: req.body.address_country,
              locale: req.body.language === 'de' ? 'de' : 'en'
            }
          });
          user = Meteor.users.findOne({ 'emails.address': { $regex: req.body.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
          Accounts.sendEnrollmentEmail(user._id);
        }
      }

      if (user) {
        let plan = Plans.findOne({ digistore24ProductIds: req.body.product_id });
        if (!plan && user.plan) {
          plan = Plans.findOne(user.plan.id);
        } else if (!plan) {
          res.end('PLAN NOT FOUND');
          return;
        }

        // const planWasActive = Meteor.users.find({ _id: user._id, 'plan.active': true }).count() > 0;

        let nextCaptureAt = moment().add(1, ((user.billing && user.billing.cycle === 'yearly') || (plan.expiresAfterDays && plan.expiresAfterDays === 365)) ? 'years' : 'months').toDate();
        if (req.body.next_payment_at) {
          nextCaptureAt = moment(req.body.next_payment_at, 'YYYY-MM-DD').toDate();
        }

        const update = !plan.addon ? {
          $set: {
            'plan.id': plan._id,
            'plan.active': true,
            'plan.cancelled': false,
            'plan.nextCaptureAt': nextCaptureAt,
            'billing.digistore24OrderId': req.body.order_id
          }
        } : {
          $push: {
            'plan.addonIds': plan._id
          },
          $addToSet: {
            'billing.digistore24AddonOrderIds': req.body.order_id
          }
        };

        if (plan.expiresAfterDays) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + plan.expiresAfterDays);
          update.$set.expiresAt = expiresAt;
        } else {
          update.$unset = { expiresAt: 1 };
        }

        let cleverpushApiBase = 'https://api.cleverpush.com';
        if (Meteor.isDevelopment) {
          cleverpushApiBase = 'http://localhost:3002';
        }

        if (plan.notifications && !user.cleverpushApiKey) {
          try {
            const cpRes = HTTP.post(cleverpushApiBase + '/users', {
              data: {
                email: user.emails[0].address,
                profile: user.profile,
                planToken: 'c0nv3rt4pp',
                planSubscriptions: 5000
              }
            });

            if (cpRes && cpRes.data && cpRes.data.user) {
              if (!update.$set) {
                update.$set = {};
              }
              update.$set.cleverpushUserId = cpRes.data.user._id;
              update.$set.cleverpushApiKey = cpRes.data.user.apiKeyPrivate;
            }

          } catch (err) {
            // console.error(err);
            // res.end('ERROR: ' + err.message);
            // return;
          }
        }

        if (plan.addon && plan.pushSubscriptions) {
          let planSubscriptions = 0;
          if (user.plan && user.plan.id) {
            const userPlan = Plans.findOne(user.plan.id);
            if (userPlan && typeof userPlan.planSubscriptions === 'number') {
              planSubscriptions = userPlan.planSubscriptions;
              if (planSubscriptions > 0 && user.plan.addonIds) {
                user.plan.addonIds.forEach((addonId) => {
                  const addon = Plans.findOne(addonId);
                  if (addon && typeof addon.planSubscriptions === 'number') {
                    planSubscriptions += addon.planSubscriptions;
                  }
                });
              }
            }
          }

          if (planSubscriptions > 0 && user.cleverpushUserId) {
            try {
              const cpRes = HTTP.post(cleverpushApiBase + '/users', {
                data: {
                  userId: user.cleverpushUserId,
                  planToken: 'c0nv3rt4pp',
                  planSubscriptions
                }
              });
            } catch (err) {
            }
          }
        }

        Meteor.users.update(user._id, update);
      }

      if (req.body.event === 'on_payment' && userCreated && user.services && user.services.password && user.services.password.reset && user.services.password.reset.reason === 'enroll' && user.services.password.reset.token) {
        res.end('OK\nusername: ' + req.body.email + '\nthankyou_url: ' + Meteor.absoluteUrl('enroll-account/' + user.services.password.reset.token) + '\nlogin_url: ' + Meteor.absoluteUrl('login'));
        return;
      }
    } else if (req.body.event === 'on_payment_missed' || req.body.event === 'on_refund' || req.body.event === 'on_chargeback') {
      const user = Meteor.users.findOne({ 'billing.digistore24OrderId': req.body.order_id });
      if (user) {
        const plan = Plans.findOne({ digistore24ProductIds: req.body.product_id });

        if (plan && plan.addon) {
          Meteor.users.update(user._id, { $pull: { 'plan.addonIds': plan._id } });
        } else {
          Meteor.users.update(user._id, { $set: { 'plan.active': false, 'plan.cancelled': false } });
        }
      }
    } else if (req.body.event === 'on_rebill_cancelled') {
      const user = Meteor.users.findOne({ 'billing.digistore24OrderId': req.body.order_id });
      if (user) {
        Meteor.users.update(user._id, { $set: { 'plan.cancelled': true } });
      }
    }

    res.end('OK');
  },
  '/settings/plan/:planId/:cycle/:userId/redirect': (req, res) => {
    const params = req.params;
    const plan = Plans.findOne(params.planId);
    if (!plan) {
      res.writeHead(404).end('No plan available.');
    }

    const user = Meteor.users.findOne(params.userId);
    if (!user) {
      res.writeHead(404).end('No user available.');
    }

    const amount = plan.monthlyCost;
    const interval = '1_month';

    if (plan.digistore24ProductIds && plan.digistore24ProductIds.length) {
      res.writeHead(302, { location: 'https://digistore24.com/product/' + plan.digistore24ProductIds[params.cycle === 'yearly' && plan.digistore24ProductIds.length > 1 ? 1 : 0] + '?custom=' + JSON.stringify({ userId: user._id }) });
      res.end();
      return;
    }

    /*
     if (params.billingCycle === 'yearly') {
     amount = Math.round(amount * 12 * 0.8);
     interval = '12_month';
     }
     */

    let isUpgrade = false;
    let isDowngrade = false;
    if (user.plan && user.plan.active && user.billing && user.billing.digistore24OrderId) {
      const currentPlan = Plans.findOne(user.plan.id);
      if (currentPlan) {
        isUpgrade = true;

        if (currentPlan.monthlyCost > plan.monthlyCost) {
          isDowngrade = true;
        }
      }
    }

    if (amount || true) {
      const apiParams = {
        product_id: typeof plan.digistore24ProductIds === 'object' ? plan.digistore24ProductIds[0] : plan.digistore24ProductIds,
        'buyer[email]': user.emails[0].address,
        'payment_plan[first_amount]': amount,
        'payment_plan[other_amounts]': amount,
        'payment_plan[currency]': 'EUR',
        'payment_plan[first_billing_interval]': interval,
        'payment_plan[other_billing_intervals]': interval,
        'tracking[custom]': JSON.stringify({ userId: user._id })
      };

      if (user.profile.firstName) {
        apiParams['buyer[first_name]'] = user.profile.firstName;
      }

      if (user.profile.lastName) {
        apiParams['buyer[last_name]'] = user.profile.lastName;
      }

      if (apiParams['buyer[email]'] && apiParams['buyer[first_name]'] && apiParams['buyer[last_name]']) {
        apiParams['buyer[readonly_keys]'] = 'email_and_name';
      }

      if (user.profile.company) {
        apiParams['buyer[company]'] = user.profile.company;
      }

      if (user.profile.address) {
        apiParams['buyer[street]'] = user.profile.address;
      }

      if (user.profile.city) {
        apiParams['buyer[city]'] = user.profile.city;
      }

      if (user.profile.zip) {
        apiParams['buyer[zipcode]'] = user.profile.zip;
      }

      if (user.profile.country) {
        apiParams['buyer[country]'] = user.profile.country;
      }

      if (user.referredBy && user.referredBy.indexOf('digistore24') > -1) {
        apiParams['tracking[affiliate]'] = user.referredBy.substr(user.referredBy.indexOf('digistore24') + 'digistore24'.length + 1);
      }

      if (isUpgrade) {
        apiParams['payment_plan[upgrade_order_id]'] = user.billing.digistore24OrderId;
        if (isDowngrade) {
          apiParams['payment_plan[upgrade_type]'] = 'downgrade';
        }
      }

      try {
        const buyRes = HTTP.call('POST', 'https://www.digistore24.com/api/call/' + digiStore24Config.apiKey + '/json/createBuyUrl/', {
          headers: {
            Accept: 'application/json'
          },
          params: apiParams
        });

        if (buyRes.data && buyRes.data.result === 'success') {
          res.writeHead(302, { location: buyRes.data.data.url });
        } else {
          res.write(('Fehler: ' + buyRes.data.message) || JSON.stringify(buyRes.data));
        }
        res.end();
      } catch (err) {
        res.end('Fehler: ' + (err.message || err.reason));
      }

      /*
       const updateData = {
       plan: { id: plan._id, active: false },
       'billing.cycle': params.billingCycle
       };
       Meteor.users.update(params.userId, { $set: updateData });
       */
    } else {
      res.end();
    }
  },
  '/webhook/productSlider/purchase/digistore24': (req, res) => {
    res.writeHead(200);

    const hash = digistore24Signature(req.body, digiStore24Config.ipnPassphrase);

    // if (hash !== req.body.sha_sign) {
    //   res.end('Wrong signature - CALCULATED: ' + hash + ' - GIVEN: ' + req.body.sha_sign + '\n\n' + JSON.stringify(req.body));
    // }

    if (req.body.event === 'on_payment' || req.body.event === 'on_rebill_resumed') {
      let user, product, custom, selectedPlan, selectedSlot;
      if (req.body.custom && req.body.custom.length) {
        let userId, productId, planId;

        let bodyCustom = req.body.custom;
        // check if param contains {}: but not " (thx digistore...)
        if (bodyCustom.indexOf('{') > -1 && bodyCustom.indexOf('}') > -1 && bodyCustom.indexOf(':') > -1 && bodyCustom.indexOf('"') < 0) {
          bodyCustom = bodyCustom.replace('{', '{"').replace('}', '"}').replace(':', '":"');
        }

        try {
          custom = JSON.parse(decodeURIComponent(bodyCustom));
          userId = custom.userId;
          productId = custom.productId;
          selectedSlot = custom.slot;
          planId = custom.planId;
        } catch (err) {
          console.log('error while parsing custom param: ' + err.message);
          console.log('req.body.custom decoded', decodeURIComponent(req.body.custom));
          userId = req.body.custom;
        }
        user = Meteor.users.findOne(userId);
        product = Products.findOne(productId);
        selectedPlan = (silderPlans || []).find(planData => planData.id === parseInt(req.body.product_id, 10));
      }

      let purchaseAt = new Date();
      if (product && product.marketPlaceSettings && (product.marketPlaceSettings || {}).purchaseAt) {
        purchaseAt = (product.marketPlaceSettings || {}).purchaseAt;
      }

      if (user && product) {
        if (!selectedPlan) {
          res.end('PLAN NOT FOUND');
          return;
        }

        const { cycle, time } = selectedPlan;
        let intervalDays;
        if (cycle === 'week') {
          intervalDays = time * 7;
        }
        if (cycle === 'month') {
          intervalDays = time * 30;
        }
        if (cycle === 'year') {
          intervalDays = time * 365;
        }

        let nextCaptureAt = moment().add(intervalDays, 'days').toDate();
        if (req.body.next_payment_at) {
          nextCaptureAt = moment(req.body.next_payment_at, 'YYYY-MM-DD').toDate();
        }

        const update = {
          $set: {
            'marketPlaceSettings.cancelled': false,
            'marketPlaceSettings.purchaseAt': purchaseAt,
            'marketPlaceSettings.expiresAt': new Date(nextCaptureAt),
            'marketPlaceSettings.digistore24OrderId': req.body.order_id
          }
        };

        Products.update((product || {})._id, update);
      }

    } else if (req.body.event === 'on_payment_missed' || req.body.event === 'on_refund' || req.body.event === 'on_chargeback') {
      const product = Products.findOne({ 'marketPlaceSettings.digistore24OrderId': req.body.order_id });

      if (product) {
        const update = {
          $set: {
            'marketPlaceSettings.cancelled': false,
          },
          $unset: {
            'marketPlaceSettings.purchaseAt': 1,
            'marketPlaceSettings.expiresAt': 1
          }
        };

        Products.update(product._id, update);
      }
    } else if (req.body.event === 'on_rebill_cancelled') {
      const product = Products.findOne({ 'billing.digistore24OrderId': req.body.order_id });

      const update = {
        $set: {
          'marketPlaceSettings.cancelled': true,
        },
        $unset: {
          'marketPlaceSettings.purchaseAt': 1,
          'marketPlaceSettings.expiresAt': 1,
          'marketPlaceSettings.digistore24OrderId': 1
        }
      };

      if (product) {
        Products.update(product._id, update);
      }
    }

    res.end('OK');
  },
  '/settings/:productId/:userId/plan/:planId': (req, res) => {
    const params = req.params;

    let selectedPlan;
    if (params.planId && params.planId !== 'undefined') {
      selectedPlan = (silderPlans || []).find(planData => planData.id === parseInt(params.planId, 10));
    } else {
      res.writeHead(404).end('No Plan Selected.');
    }

    let digistore24ProductId;
    if (!selectedPlan) {
      res.writeHead(404).end('No plan available.');
    } else {
      digistore24ProductId = selectedPlan.id;
    }

    const user = Meteor.users.findOne(params.userId);
    if (!user) {
      res.writeHead(404).end('No user available.');
    }

    const amount = selectedPlan.amount;

    if (amount || true) {
      const apiParams = {
        product_id: digistore24ProductId,
        'buyer[email]': user.emails[0].address,
        'payment_plan[first_amount]': amount,
        'payment_plan[currency]': 'EUR',
        'tracking[custom]': JSON.stringify({ ...params })
      };

      // 'payment_plan[other_amounts]': amount,
      // 'payment_plan[first_billing_interval]': '7_days',
      // 'payment_plan[other_billing_intervals]': '1_week',

      if (user.profile.firstName) {
        apiParams['buyer[first_name]'] = user.profile.firstName;
      }

      if (user.profile.lastName) {
        apiParams['buyer[last_name]'] = user.profile.lastName;
      }

      if (apiParams['buyer[email]'] && apiParams['buyer[first_name]'] && apiParams['buyer[last_name]']) {
        apiParams['buyer[readonly_keys]'] = 'email_and_name';
      }

      if (user.profile.company) {
        apiParams['buyer[company]'] = user.profile.company;
      }

      if (user.profile.address) {
        apiParams['buyer[street]'] = user.profile.address;
      }

      if (user.profile.city) {
        apiParams['buyer[city]'] = user.profile.city;
      }

      if (user.profile.zip) {
        apiParams['buyer[zipcode]'] = user.profile.zip;
      }

      if (user.profile.country) {
        apiParams['buyer[country]'] = user.profile.country;
      }

      try {
        const buyRes = HTTP.call('POST', 'https://www.digistore24.com/api/call/' + digiStore24Config.apiKey + '/json/createBuyUrl/', {
          headers: {
            Accept: 'application/json'
          },
          params: apiParams
        });

        if (buyRes.data && buyRes.data.result === 'success') {
          res.writeHead(302, { location: buyRes.data.data.url });
        } else {
          res.write(('Fehler: ' + buyRes.data.message) || JSON.stringify(buyRes.data));
        }
        res.end();
      } catch (err) {
        res.end('Fehler: ' + (err.message || err.reason));
      }
    } else {
      res.end();
    }
  },
};
