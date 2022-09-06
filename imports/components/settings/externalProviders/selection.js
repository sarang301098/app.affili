import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';

class ExternalProviderSelection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <select value={this.props.value || ''} onChange={e => this.props.onChange(e.target.value)} className={this.props.className || 'form-control'}>
        <option value="">Anbieter auswählen...</option>
        {(this.props.externalProviders || []).map(tag => (
          <option key={tag._id} value={tag._id}>{tag.name}</option>
        ))}
      </select>
    );
  }
}

export default createContainer(({ search, additionalOptions }) => {
  const sub = Meteor.subscribe('externalProviders');

  let externalProviders = ExternalProviders.find(search || {}).fetch();
  if (additionalOptions && additionalOptions.length) {
    externalProviders = externalProviders.concat(additionalOptions);
  }

  return {
    loaded: sub.ready(),
    externalProviders
  };
}, ExternalProviderSelection);
