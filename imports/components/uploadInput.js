import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import { FormattedMessage } from 'react-intl';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import AvatarEditor from 'react-avatar-editor';

class UploadInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      dataUrl: null
    };

    this.selectFile = this.selectFile.bind(this);
  }

  upload() {
    const dataUrl = this.props.noEditor ? this.state.dataUrl : this.avatarEditor.getImage().toDataURL();
    this.setState({ dataUrl });
    const base64 = dataUrl.split(',')[1];

    this.setState({ loading: true });

    Meteor.call('uploadImage', this.props.collection, 'image/jpeg', base64, (err, res) => {
      this.setState({ loading: false, showModal: false });
      if (err) {
        Alert.error(err.reason);
      } else {
        if (this.props.onChange) {
          this.props.onChange(res.iconUrl);
        }
      }
    });
  }

  selectFile(e) {
    if (e.target.files && e.target.files[0] && !this.state.loading) {
      const file = e.target.files[0];
      if (file.size > 5e+6) {
        Alert.error('Bild ist größer als 5MB');
      } else if (!file.type.startsWith('image')) {
        Alert.error('Dateityp nicht unterstützt');
      } else {
        const reader = new FileReader();
        const fileType = file.type;
        reader.addEventListener('load', () => {
          this.setState({ dataUrl: reader.result, showModal: !this.props.noEditor }, () => {
            if (this.props.noEditor) {
              this.upload();
            }
          });
        }, false);
        reader.readAsDataURL(e.target.files[0]);
      }
    }
  }

  render() {
    return (
      <div className="input-group">
        {!(this.props.isEdit) ?
          <React.Fragment>
            <input
              type="url"
              className={this.props.className || 'input-sm form-control'}
              disabled={this.state.loading}
              placeholder={this.props.placeholder}
              value={this.props.value || ''}
              onChange={e => this.props.onChange(e.target.value)}
            />
            <div className="input-group-append">
              <label className={(this.props.btnClassName || 'btn btn-outline-primary') + ' btn-file mb-0' + (this.state.loading ? ' disabled' : '')}><FormattedMessage id="selectFile" /> <input type="file" accept="image/*" onChange={this.selectFile} disabled={this.state.loading} style={{ display: 'none' }} placeholder={this.state.loading ? this.context.intl.formatMessage({ id: 'uploading' }) : ''} /></label>
            </div>
          </React.Fragment> :
          <React.Fragment>
            <label className='btn btn-primary w-100'>
              <i className="fa fa-pencil font-size-12 mr-1"></i>
              <FormattedMessage id="edit" />
              <input type="file" accept="image/*" onChange={this.selectFile} disabled={this.state.loading} style={{ display: 'none' }} placeholder={this.state.loading ? this.context.intl.formatMessage({ id: 'uploading' }) : ''} />
            </label>
          </React.Fragment>
        }

        <Modal isOpen={this.state.showModal} toggle={() => this.setState({ showModal: false })}>
          <ModalHeader toggle={() => this.setState({ showModal: false })}>
            Bild hochladen
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              <AvatarEditor
                ref={ref => this.avatarEditor = ref}
                image={this.state.dataUrl}
                width={300}
                height={300}
                border={0}
                scale={1.0}
                rotate={0}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => this.setState({ showModal: false })} className="btn btn-secondary mr-2">Abbrechen</button>
            <button type="button" disabled={this.state.loading} onClick={() => this.upload()} className="btn btn-primary">Bild hochladen</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

UploadInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onImageSizeChange: PropTypes.func,
  placeholder: PropTypes.string
};

UploadInput.defaultProps = {
  value: null,
  onImageSizeChange: null,
  placeholder: null
};

UploadInput.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default UploadInput;
