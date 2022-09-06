import React from 'react';
import { Meteor } from 'meteor/meteor';
import Creatable from 'react-select/lib/Creatable';
import { createContainer } from 'meteor/react-meteor-data';

import reactSelectStyle from '../utils/reactSelectStyle';
import PropTypes from 'prop-types';

class CategorySelection extends React.Component {
  render() {
    return (
      <div>
        <Creatable
          value={(this.props.value || []).map(id => (this.props.categories || []).find(category => category._id === id)).filter(category => category && category._id && category.name).map(category => ({ label: category.name, value: category._id }))}
          onChange={options => this.props.onChange(options.map(option => option.value))}
          className="mr-3 w-100"
          options={(this.props.categories || []).map(category => ({ label: category.name, value: category._id }))}
          isMulti
          backspaceToRemoveMessage={''}
          placeholder={this.context.intl.formatMessage({ id: 'selectCategories' })}
          noOptionsMessage={() => this.context.intl.formatMessage({ id: 'noDataAvailable' })}
          formatCreateLabel={input => this.context.intl.formatMessage({ id: 'createCategory' }) + ': "' + input + '"…'}
          onCreateOption={value => this.props.collection.insert({ userId: Meteor.userId(), name: value, createdAt: new Date() }, (err, id) => this.props.onChange([id]))}
          styles={reactSelectStyle.styles}
          theme={reactSelectStyle.theme}
          disabled={!this.props.loaded}
        />
      </div>
    );
  }
}

CategorySelection.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default createContainer(({ publication, collection }) => {
  const sub = Meteor.subscribe(publication);
  return {
    loaded: sub.ready(),
    categories: collection.find({}, { reactive: false }).fetch()
  };
}, CategorySelection);
