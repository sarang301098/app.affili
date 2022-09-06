import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpened: props.visible
    };
    this.onButtonClick = this.onButtonClick.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
  }

  onButtonClick(e) {
    e.stopPropagation();

    // Since the modal is inside the button click events will propagate up.
    if (!this.state.isOpened) {
      this.setState({
        isOpened: true
      });
    }
  }

  onClose(event) {
    if (event) {
      event.stopPropagation();
    }
    this.setState({
      isOpened: false
    });

    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
    }
  }

  onConfirm(event) {
    event.stopPropagation();
    this.setState({
      isOpened: false
    });
    this.props.onConfirm();
  }

  render() {
    const cancelButton = this.props.showCancelButton ? (
      <Button color="default" onClick={this.onClose}>
        {this.props.cancelText}
      </Button>
    ) : null;
    const modal = (
      <Modal isOpen={this.state.isOpened} toggle={this.onClose} modalClassName={this.props.modalClassName}>
        <ModalHeader toggle={this.onClose}>
          {this.props.title}
        </ModalHeader>
        <ModalBody>
          {this.props.body}
          {this.props.enterText ? (
            <div>
              <div className="text-dark mb-2 mt-3">Bitte gib den Text "<strong>{this.props.enterText}</strong>" ein, um das Löschen zu Bestätigen:</div>
              <input type="text" value={this.state.enterTextValue || ''} onChange={e => this.setState({ enterTextValue: e.target.value })} className="form-control" />
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          {cancelButton}
          <Button color={this.props.confirmBSStyle} onClick={this.onConfirm} disabled={this.props.enterText && this.props.enterText !== this.state.enterTextValue}>
            {this.props.confirmText}
          </Button>
        </ModalFooter>
      </Modal>
    );
    let content;
    if (this.state.isOpened) {
      content = [
        modal,
        this.props.children
      ];
    } else {
      if (this.props.children) {
        const btn = React.Children.only(this.props.children);
        content = React.cloneElement(
          btn,
          {
            onClick: this.onButtonClick,
            style: this.props.style
          },
          btn.props.children,
          modal
        );
      } else {
        content = (
          <Button onClick={this.onButtonClick} style={this.props.style}>
            {this.props.buttonText}
            {modal}
          </Button>
        );
      }
    }
    return content;
  }
}

Confirm.propTypes = {
  body: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
  cancelText: PropTypes.node,
  confirmBSStyle: PropTypes.string,
  confirmText: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  showCancelButton: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  visible: PropTypes.bool
};

Confirm.defaultProps = {
  cancelText: 'Abbrechen',
  confirmText: 'Bestätigen',
  confirmBSStyle: 'danger',
  showCancelButton: true
};

Confirm.contextTypes = {
  intl: PropTypes.object.isRequired
};

export { Confirm };
export default Confirm;
