import React from 'react';
import PropTypes from 'prop-types';

const EmailLayout = ({ name, body, noSalutation, locale }) => {
  return (
    <html>
    <head>
      <meta charSet="utf-8" />
    </head>
    <body style={{ margin: 0, padding: 0, fontSize: '16px', color: '#555', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
    <div style={{ height: '100px', backgroundColor: '#ffffff', paddingLeft: '20px', marginBottom: '10px' }}>
      <div style={{ background: 'url(' + 'https://app.affilihero.io/images/logo.png' + ') no-repeat center left / 200px auto', width: '100%', height: '100px' }} />
    </div>
    <div style={{ padding: '20px' }}>
      {!noSalutation && (!locale || locale === 'de') ? (
        <div>
          <div>Hallo {name},</div>
          <br />
        </div>
      ) : null}
      {!noSalutation && (locale === 'en') ? (
        <div>
          <div>Hello {name},</div>
          <br />
        </div>
      ) : null}

      {body}

      {!noSalutation && (!locale || locale === 'de') ? (
        <div>
          <br />
          Beste Grüße<br />
          Dein AffiliHero Team
        </div>
      ) : null}

      {!noSalutation && (locale === 'en') ? (
        <div>
          <br />
          Kind regards<br />
          Your AffiliHero Team
        </div>
      ) : null}

      <div>
        <br />
        ___<br />
        <br />
        <div style={{ fontSize: 12, marginTop: 10 }}>
          POST Service & Consulting Limited<br />
          attn: 1BqpGiGu2mduSQvoVGWfQlyE<br />
          Independence Ave, P.1523<br />
          00000 Victoria, Mahe, Seychellen<br />
          E-Mail: support@affilihero.io
        </div>
      </div>
    </div>
    </body>
    </html>
  );
};

EmailLayout.propTypes = {
  body: PropTypes.node,
  name: PropTypes.node,
  locale: PropTypes.string,
  noSalutation: PropTypes.bool
};

export default EmailLayout;
