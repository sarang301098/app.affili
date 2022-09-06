import { Meteor } from 'meteor/meteor';
import { addLocaleData } from 'react-intl';
import localeDataDe from 'react-intl/locale-data/de';
import localeDataEn from 'react-intl/locale-data/en';
import de from './de';
import en from './en';

addLocaleData([...localeDataDe, ...localeDataEn]);

const messages = { de, en };
const languages = Object.keys(messages);
const localization = {
  languages,
  fallback: languages[0],
  async: Meteor.settings.public.localization && Meteor.settings.public.localization.async,
  messages,
};
export default localization;
