import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import ExternalProviders from 'meteor/affilihero-lib/collections/externalProviders';

class ExternalProviderSelectionSingle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  render() {
    return (
      <div className="d-flex align-items-stretch">
        <select value={this.props.value || ''} onChange={e => this.props.onChange(e.target.value)} className={(this.props.className || 'form-control form-control-sm') + ''} disabled={!this.props.loaded}>
          <option value="">Anbieter auswählen…</option>
          {(this.props.items || []).map(tag => (
            <option key={tag._id} value={tag._id}>{tag.name}</option>
          ))}
        </select>
      </div>
    );
  }
}

export default createContainer(({ type }) => {
  const sub = Meteor.subscribe('externalProviders');

  let items = ExternalProviders.find().fetch();
  if (type) {
    items = items.filter(item => item.type === type);
  }

  return {
    loaded: sub.ready(),
    items
  };
}, ExternalProviderSelectionSingle);
