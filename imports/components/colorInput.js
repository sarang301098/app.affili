import React, { Component } from 'react';
import ColorPicker from 'coloreact';
import Alert from 'react-s-alert';
import { createContainer } from 'meteor/react-meteor-data';

class ColorInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.value + '',
      pickerVisible: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.color) {
      this.setState({ color: nextProps.value + '' });
    }
  }

  setRef(ref) {
    if (ref && !this.state.align) {
      let element = ref;
      let top = 0;
      let left = 0;
      do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element && (!element.className || element.className.indexOf('modal-body') < 0));

      if (!this.state.align) {
        this.setState({ top, align: top > 300 ? 'top' : 'bottom' });
      }
    }
  }

  rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
  }

  render() {
    return (
      <div className="color-input-wrap">
        <div className={'color-picker-wrap ' + this.state.align + ' top-' + this.state.top} style={{ display: this.state.pickerVisible ? 'block' : 'none' }}>
          {this.state.pickerVisible ? (
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
              onClick={() => this.setState({ pickerVisible: false })}
            />
          ) : null}

          <ColorPicker
            color={this.state.color}
            onChange={(color) => this.setState({ color: '#' + color.hex })}
            onComplete={(color) => this.props.onChange('#' + color.hex)}
            disableAlpha
          />
        </div>
        <div className="input-group" ref={ref => this.setRef(ref)}>
          <input
            type="text"
            className={this.props.className || 'form-control'}
            onFocus={() => this.setState({ pickerVisible: true })}
            onBlur={() => this.setState({ /*pickerVisible: false*/ })}
            value={this.state.color}
            disabled={this.props.disabled}
            onChange={(e) => this.props.onChange(e.target.value)}
            required={this.props.required}
          />
          <span className="input-group-append">
            <span className="input-group-text"><div style={{ width: 17, height: 17, backgroundColor: this.state.color, cursor: 'pointer' }} onClick={() => this.setState({ pickerVisible: !this.state.pickerVisible })} /></span>
          </span>
        </div>
      </div>
    );
  }
}

export default createContainer(({ match }) => {
  return {
    user: Meteor.user()
  };
}, ColorInput);
