import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';

import Loader from './loader';
import ColorInput from './colorInput';

class Categories extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  saveCategory() {
    this.setState({ showEditModal: false });
    this.props.collection.update(this.state.categoryId, {
      $set: {
        name: this.state.categoryName,
        color: this.state.categoryColor
      }
    }, (err) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(this.context.intl.formatMessage({ id: 'categorySaved' }));
      }
    });
  }

  removeCategory() {
    this.setState({ showEditModal: false });
    this.props.collection.remove(this.state.categoryId, (err) => {
      if (err) {
        Alert.error(err.reason || err.message);
      } else {
        Alert.success(this.context.intl.formatMessage({ id: 'categoryRemoved' }));
      }
    });
  }

  render() {
    const { loaded, categories } = this.props;

    const itemsWithoutCategory = this.props.items.filter(item => !item.categoryIds || !item.categoryIds.length || !item.categoryIds.filter(id => categories.find(c => c._id === id)).length);

    return (
      <div>
        <Loader loaded={loaded}>
          {categories.map(category => {
            const items = this.props.items.filter(item => item.categoryIds && item.categoryIds.indexOf(category._id) > -1);

            if (!items.length) {
              return null;
            }

            return (
              <div>
                <div className="panel panel-default" style={category.color ? { borderLeft: '2px solid ' + category.color } : null}>
                  <div className="panel-heading mb-4 d-flex">
                    <h3 className="mb-0">{category.name}</h3>
                    <button type="button" onClick={() => this.setState({ showEditModal: true, categoryId: category._id, categoryName: category.name, categoryColor: category.color })} className="btn btn-link btn-sm ml-auto"><i className="fa fa-gear" /></button>
                  </div>
                  <div className="panel-body">
                    {this.props.renderItems(items)}
                  </div>
                </div>
              </div>
            );
          })}

          {itemsWithoutCategory.length ? (
            <div>
              <div className="panel panel-default">
                <div className="panel-body">
                  {this.props.renderItems(itemsWithoutCategory)}
                </div>
              </div>
            </div>
          ) : null}

          {!this.props.items.length ? (
            <div className="panel panel-default">
              <div className="panel-body">
                <p className="text-muted text-center"><FormattedMessage id="noDataAvailable" values={{ name: this.props.name || '' }} /></p>
              </div>
            </div>
          ) : null}
        </Loader>

        <Modal isOpen={this.state.showEditModal} toggle={() => this.setState({ showEditModal: false })}>
          <ModalHeader><FormattedMessage id="editCategory" /></ModalHeader>
          <ModalBody>
            <div className="mb-2"><FormattedMessage id="name" />:</div>
            <div className="mb-3"><input type="text" className="form-control" value={this.state.categoryName || ''} onChange={e => this.setState({ categoryName: e.target.value })} /></div>
            <div className="mb-2"><FormattedMessage id="color" />:</div>
            <div className="mb-4"><ColorInput value={this.state.categoryColor || ''} onChange={categoryColor => this.setState({ categoryColor })} /></div>

            <div className="text-right">
              <button type="button" onClick={() => this.removeCategory()} className="btn btn-link btn-sm text-muted"><FormattedMessage id="removeCategory" /></button>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => this.setState({ showEditModal: false })} className="btn btn-secondary mr-3"><FormattedMessage id="cancel" /></button>
            <button type="button" onClick={() => this.saveCategory()} className="btn btn-primary"><FormattedMessage id="save" /></button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

Categories.propTypes = {
  children: PropTypes.node,
  loaded: PropTypes.bool
};

Categories.defaultProps = {
  children: null,
  loaded: false
};

Categories.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default createContainer(({ publication, collection, items }) => {
  const categoriesSub = Meteor.subscribe(publication);

  const categories = collection.find({}, { reactive: false, sort: { name: 1 } }).fetch();

  return {
    loaded: categoriesSub.ready(),
    items,
    categories
  };
}, Categories);
