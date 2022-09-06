import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FormattedMessage } from 'react-intl';

import HtmlEditor from '../htmlEditor';
import UploadInput from '../uploadInput';
import ColorInput from '../colorInput';

class DesignEditorSingle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.elementContentSettings = this.elementContentSettings.bind(this);
  }

  elementContentSettings() {
    const { template, field, index, type, element } = this.props;

    const settingsData = [];

    if (type === 'links') {
      settingsData.push(
        <React.Fragment>
          <div className="form-horizontal">
            <div className="alert alert-info" role="alert">
              <FormattedMessage id="affiliateInfo" />
            </div>
            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="enterLink" />
              </label>
              <div className="col-md-5 share-button">
                <input type="text" value={(template || {})[field] || ''} onChange={e => this.updateElementChange(type, e.target.value, index, field)} className="form-control" />
              </div>
            </div>
            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="placeholder" /></label>
              <div className="col-md-5"> <code className="d-block mt-2" dangerouslySetInnerHTML={{ __html: '{{AFFILIATE}}' }} /></div>
              <div className="col-md-2 pl-0">
                <CopyToClipboard

                  text="{{AFFILIATE}}"
                  onCopy={() => Alert.success('Code in Zwischenablage kopiert.')}
                >
                  <button type="button" className="btn btn-primary btn-xs"><i className="fas fa-copy mr-2" /><FormattedMessage id="copy" /></button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (type === 'emailTemplates') {
      settingsData.push(
        <React.Fragment>
          <div className="form-horizontal">
            <div className="alert alert-info" role="alert">
              <FormattedMessage id="affiliateInfo" />
            </div>
            <div className="form-group">
              <HtmlEditor
                content={(template || {})[field] || ''}
                onChange={content => this.updateElementChange(type, content, index, field)}
                config={{
                  toolbar1: 'insertfile undo redo | styleselect fontsizeselect | bold italic underline strikethrough removeformat forecolor backcolor textshadow alignleft aligncenter alignright alignjustify bullist numlist outdent indent | link ',
                  fontsize_formats: '6px 8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px',
                  autoresize_max_height: undefined
                }}
              />
            </div>
            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="placeholder" /></label>
              <div className="col-md-5"> <code className="d-block mt-2" dangerouslySetInnerHTML={{ __html: '{{AFFILIATE}}' }} /></div>
              <div className="col-md-2 pl-0">
                <CopyToClipboard

                  text="{{AFFILIATE}}"
                  onCopy={() => Alert.success('Code in Zwischenablage kopiert.')}
                >
                  <button type="button" className="btn btn-primary btn-xs"><i className="fas fa-copy mr-2" /><FormattedMessage id="copy" /></button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (type === 'banners') {
      settingsData.push(
        <React.Fragment>
          <div className="modal-edit-image text-center">
            <img src={(template || {})[field] || ''} alt="Banner" width="250" className="mb-4 mt-3" />
            <UploadInput isEdit noEditor onChange={content => this.updateElementChange(type, content, index, field)} />
          </div>
        </React.Fragment>
      );
    }

    if (type === 'projectLogo') {
      settingsData.push(
        <React.Fragment>
          <div className="modal-edit-image text-center">
            <img src={element[type]} alt="Header Logo" width="250" className="mb-4 mt-3" />
            <UploadInput isEdit noEditor onChange={content => this.props.onChange(type, content)} />
          </div>
        </React.Fragment>
      );
    }

    if (type === 'affiliateLinkHeader' || type === 'affiliateLinkInfo' || type === 'digistore24IdInfo' || type === 'emailTemplatesHeading' || type === 'emailTemplatesInfo' || type === 'bannersHeading' || type === 'bannersInfo' || type === 'redirectToDigistoreText' || type === 'affiliateToplistHeading' || type === 'affiliateToplistInfo') {
      let template;

      if (type === 'affiliateLinkHeader') {
        template = this.props.template || 'COPYWRITER COMPLETE PACKAGE';
      }
      if (type === 'affiliateLinkInfo') {
        template = this.props.template || 'Here are your affiliate links:';
      }
      if (type === 'digistore24IdInfo') {
        template = this.props.template || 'Enter your DigiStore24 ID to create your affiliate links:';
      }
      if (type === 'emailTemplatesHeading') {
        template = this.props.template || 'EMAIL TEMPLATES';
      }
      if (type === 'emailTemplatesInfo') {
        template = this.props.template || 'Here are some email templates you can use with this product. You are cordially invited to make changes. Do not forget to include your affiliate links.';
      }
      if (type === 'bannersHeading') {
        template = this.props.template || 'PROMOTIONAL BANNERS';
      }
      if (type === 'bannersInfo') {
        template = this.props.template || 'Use these banner ads on your blog, website, or in emails to get your target audience attention.';
      }
      if (type === 'affiliateToplistHeading') {
        template = this.props.template || 'AFFILIATE TOPLIST';
      }
      if (type === 'affiliateToplistInfo') {
        template = this.props.template || 'Affiliates who object to a publication are not included in this list and do not take part in the championship!';
      }
      if (type === 'redirectToDigistoreText') {
        template = this.props.template || 'More information about the affiliate link:';
      }

      settingsData.push(
        <React.Fragment>
          <div>
            <HtmlEditor
              content={template}
              onChange={content => this.props.onChange(type, content)}
              config={{
                menu: {
                },
                toolbar1: 'undo redo | styleselect fontsizeselect | bold italic underline strikethrough removeformat alignleft aligncenter alignright alignjustify outdent indent ',
                fontsize_formats: '6px 8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px',
                autoresize_max_height: undefined
              }}
            />
          </div>
        </React.Fragment>
      );
    }

    if (type === 'colorssettings') {
      settingsData.push(
        <React.Fragment>
          <div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="headerColor" />
              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.headerColor || ''} onChange={color => this.props.onChange('headerColor', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="buttonColor" />
              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.buttonColor || ''} onChange={color => this.props.onChange('buttonColor', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="textColorOne" />

              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.textColorOne || ''} onChange={color => this.props.onChange('textColorOne', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="textColorTwo" />

              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.textColorTwo || ''} onChange={color => this.props.onChange('textColorTwo', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="backgroundColorOne" />

              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.backgroundColorOne || ''} onChange={color => this.props.onChange('backgroundColorOne', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="backgroundColorTwo" />

              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.backgroundColorTwo || ''} onChange={color => this.props.onChange('backgroundColorTwo', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="footerColor" />

              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.footerColor || ''} onChange={color => this.props.onChange('footerColor', color)} />
              </div>
            </div>

            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id="templateColor" />

              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element.templateColor || ''} onChange={color => this.props.onChange('templateColor', color)} />
              </div>
            </div>

          </div>
        </React.Fragment>
      );
    }

    if (type === 'backgroundColorOne' || type === 'backgroundColorTwo' || type === 'footerColor' || type === 'templateColor' || type === 'headerColor') {
      settingsData.push(
        <React.Fragment>
          <div>
            <div className="form-group row">
              <label className="control-label col-md-3 text-md-right">
                <FormattedMessage id={type} />
              </label>
              <div className="col-md-5 share-button">
                <ColorInput value={element[type] || ''} onChange={color => this.props.onChange(type, color)} />
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (type === 'shareButtons') {
      settingsData.push(
        <React.Fragment>

          <div className="form-group row">
            <label className="control-label col-md-3 text-md-right">
              <FormattedMessage id="shareButtons" />
            </label>
            <div className="col-md-9">
              <div className="d-flex flex-wrap align-items-center mt-1">
                <label className="checkbox-container mr-3">Facebook
                  <input type="checkbox" checked={!!element.shareFacebook} onChange={e => this.props.onChange('shareFacebook', e.target.checked)} />
                  <span className="checkmark" />
                </label>
                <label className="checkbox-container mr-3">Whatsapp
                  <input type="checkbox" id="shareWhatsapp" checked={!!element.shareWhatsapp} onChange={e => this.props.onChange('shareWhatsapp', e.target.checked)} />
                  <span className="checkmark" />
                </label>
                <label className="checkbox-container mr-3">Twitter
                  <input type="checkbox" id="shareTwitter" checked={!!element.shareTwitter} onChange={e => this.props.onChange('shareTwitter', e.target.checked)} />
                  <span className="checkmark" />
                </label>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label className="control-label col-md-3 text-md-right">
              <FormattedMessage id="backgroundColorOne" />
            </label>
            <div className="col-md-5 share-button">
              <ColorInput value={element.backgroundColorOne || ''} onChange={color => this.props.onChange('backgroundColorOne', color)} />
            </div>
          </div>

        </React.Fragment>
      );
    }

    if (type === 'privacyPolicy' || type === 'imprint' || type === 'digistoreLinkText') {
      let alertText;
      let template;

      if (type === 'privacyPolicy') {
        alertText = 'Edit Privacy Text and Attach the Url through the Editor Below';
        template = this.props.template || 'PRIVACY';
      }
      if (type === 'imprint') {
        alertText = 'Edit Imprint Text and Attach the Url through the Editor Below';
        template = this.props.template || 'IMPRINT';
      }
      if (type === 'digistoreLinkText') {
        alertText = 'Edit Digistore24 Redirect Text and Attach the Url through the Editor Below';
        template = this.props.template || 'To Digistore24';
      }

      settingsData.push(
        <React.Fragment>
          <div className="alert alert-info" role="alert">
            {alertText}
          </div>
          <div>
            <HtmlEditor
              content={template}
              onChange={content => this.props.onChange(type, content)}
              config={{
                menu: {
                },
                toolbar1: 'undo redo | styleselect fontsizeselect | bold italic underline strikethrough removeformat alignleft aligncenter alignright alignjustify outdent indent | link ',
                fontsize_formats: '6px 8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px',
                autoresize_max_height: undefined
              }}
            />
          </div>
        </React.Fragment>
      );
    }

    return (settingsData || []).map((setting, i) => <div key={i}>{setting}</div>);
  }

  updateElementChange(type, value, index, name) {
    const { element } = this.props;

    let updatedField;
    updatedField = element[type];
    updatedField[index][name] = value;

    this.props.onChange(type, updatedField);
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {this.elementContentSettings()}
        </div>
      </React.Fragment>
    );
  }
}

DesignEditorSingle.contextTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default DesignEditorSingle;
