import { WebApp, WebAppInternals } from 'meteor/webapp';
/* eslint-disable no-undef, import/no-extraneous-dependencies, import/no-unresolved, import/extensions, max-len */
import 'farmhash';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-intl-redux';
import Helmet from 'react-helmet';
import { ServerStyleSheet } from 'styled-components';
/* eslint-enable */
import logger from '../../shared/utils/logger';

// Impure function
/* eslint-disable no-param-reassign */
const applicationRendering = (stepResults) => {
  if (stepResults.isFromCache) return;
  let helmetHead = null;
  let bodyMarkup = null;
  const {
    MainApp,
    contextMarkup,
    hasUnwantedQueryParameters,
  } = stepResults;
  const routerContext = {};
  const app = (
    <Provider store={stepResults.store}>
      <StaticRouter location={stepResults.url} context={routerContext}>
        <MainApp hostname={stepResults.req.hostname} />
      </StaticRouter>
    </Provider>
  );

  // If componant caching has been configured for any of the componants in the render
  // tree, then we enable the cache
  /*
  if (stepResults.componentCacheConfig && process.env.NODE_ENV === 'production') {
    const keys = Object.keys(stepResults.componentCacheConfig).join(', ');
    logger.debug(`Component caching enabled for: ${keys}`);
    SSRCaching.enableCaching(true);
    // SSRCaching.setCachingConfig({ components: stepResults.componentCacheConfig });
  } else {
    SSRCaching.enableCaching(false);
  }
  */

  let css = null;
  // Avoid the initial app rendering in case there's an unwanted URL query parameter
  if (!hasUnwantedQueryParameters) {
    // Create and render application main entry point
    const sheet = new ServerStyleSheet();
    bodyMarkup = renderToString(sheet.collectStyles(app));
    css = sheet.getStyleTags();
    helmetHead = Helmet.renderStatic();
  }

  if (stepResults.componentCacheConfig && process.env.NODE_ENV === 'production') {
    logger.debug('Component caching hit report');
    // logger.debug(SSRCaching.cacheHitReport());
  }

  // Redirect case
  if (routerContext.location && routerContext.location.pathname) {
    stepResults.statusCode = 302;
    stepResults.Location = routerContext.location.pathname;
    const queryIndex = stepResults.req.url.indexOf('?');
    if (queryIndex > -1) {
      stepResults.Location += stepResults.req.url.substr(queryIndex);
    }
    return Promise.resolve(stepResults);
  }

  if (hasUnwantedQueryParameters || routerContext.has404) {
    stepResults.statusCode = 404;
    // const platform = stepResults.store.getState().platform;
    // if (cache.has(platform, NOT_FOUND_URL)) {
    //   stepResults.is404fromCache = true;
    //   const cachedPage = cache.get(platform, NOT_FOUND_URL);
    //   stepResults.head = cachedPage.head;
    //   stepResults.body = cachedPage.body;
    // }
  }

  if (stepResults.statusCode === 200 && stepResults.hash === null) {
    stepResults.hash = crypto.createHash('md5')
      .update(stepResults.head + stepResults.body)
      .digest('hex');
  }

  if (stepResults.html === null) {
    // Create body
    stepResults.req.dynamicBody = `<div id="react">${bodyMarkup}</div>${contextMarkup}`;
    // Create head
    stepResults.req.dynamicHead = ['title', 'meta', 'link', 'script']
      .reduce((acc, key) => `${acc}${helmetHead[key].toString()}`, '');
    // Add html attributes
    stepResults.req.htmlAttributes = helmetHead.htmlAttributes;
    WebApp.addHtmlAttributeHook((request) => {
      if (request.htmlAttributes) {
        return request.htmlAttributes.toComponent();
      }
      return {};
    });
    // Add humans.txt link, if required
    if (stepResults.humansTxt) stepResults.req.dynamicHead += '<link rel="author" href="humans.txt" />';
    // Add the css tag for styled components to head if it's not empty
    if (css && css.length > 0) stepResults.req.dynamicHead += css;
    // Create minified HTML payload
    let { stream } = WebAppInternals.getBoilerplate(stepResults.req, WebApp.defaultArch);
    /*
    stepResults.html = htmlMinifier.minify(meteorHtml, {
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      collapseWhitespace: true,
    });
    */

    return new Promise((resolve) => {
      stepResults.html = '';
      stream.on('data', (data) => {
        stepResults.html += data.toString();
      });
      stream.on('end', () => {
        // Load Meteor's bundle asyncrhoneously only in production
        if (process.env.NODE_ENV === 'production') {
          stepResults.html = stepResults.html.replace(/<script src/g, '<script async src').replace(/<script type="text\/javascript" src/g, '<script async src');
        }
        resolve(stepResults);
        stream = null;
      });
      stream.on('error', (err) => {
        logger.error(err);
        resolve(stepResults);
        stream = null;
      });
    });
  } else {
    return Promise.resolve(stepResults);
  }
};
export default applicationRendering;
