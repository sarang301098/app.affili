// Impure function
const speakForeignLanguages = (stepResults) => {
  const { localization, req } = stepResults;
  if (localization) {
    if (req.cookies && req.cookies.locale && localization.languages.indexOf(req.cookies.locale) > -1) {
      // eslint-disable-next-line no-param-reassign
      stepResults.userLocale = req.cookies.locale;
    } else {
      // eslint-disable-next-line no-param-reassign
      stepResults.userLocale = req.acceptsLanguages(localization.languages);
      const match = req.url.match(/^\/([a-z]{2})([/?].*)?$/i);
      if (match) {
        const lang = match[1];
        if (localization.languages.indexOf(lang) > -1) {
          // eslint-disable-next-line no-param-reassign
          stepResults.userLocale = lang;
        }
      }
    }
  }
};
export default speakForeignLanguages;
