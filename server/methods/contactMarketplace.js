import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check } from 'meteor/check';
import ReactDOM from 'react-dom/server';
import EmailLayout from '../../imports/components/layout/emailLayout';
import React from 'react';

Meteor.methods({
  contactMarketplace(email, data) {
    check(email, String);
    check(data, Object);

    const subject = 'Affilihero Marketplace: Neue Kontaktanfrage';
    const text = (
      <div>
        <p>es ist eine neue Kontaktanfrage über dein Marketplace Profil eingegangen.</p>
        <p>
          Name: {data.name || ''}<br />
          Firma: {data.company || ''}<br />
          E-Mail: {data.email || ''}<br />
          Telefon: {data.phone || ''}<br />
          Nachricht: {data.message || ''}<br />
        </p>
      </div>
    );
    const html = ReactDOM.renderToStaticMarkup(<EmailLayout body={text} name="" locale="de" />);

    Email.send({
      subject,
      to: email,
      html,
      from: 'Affilihero <support@affilihero.io>'
    });
  }
});
