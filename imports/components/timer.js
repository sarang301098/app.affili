import React, { Component } from 'react';
import PropTypes from 'prop-types';

let SecondsTohhmmss = function (totalSeconds) {
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  let seconds = totalSeconds - (hours * 3600) - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds)

  let result = (hours < 10 ? '0' + hours : hours);
  result += ':' + (minutes < 10 ? '0' + minutes : minutes);
  result += ':' + (seconds < 10 ? '0' + seconds : seconds);
  return result;
};

export default class Timer extends Component {
  static get propTypes() {
    return {
      options: PropTypes.object
    };
  }

  constructor(props) {
    super(props);

    this.state = { clock: props.initialTime || 0, time: '' };

    this.offset = null;
    this.interval = null;
  }

  componentDidMount() {
    if (!this.interval) {
      this.offset = Date.now();
      this.interval = setInterval(this.update.bind(this), 250);
      this.update();
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  update() {
    let clock = this.state.clock;
    clock += this.calculateOffset();
    this.setState({ clock });
    const time = SecondsTohhmmss(clock / 1000);
    this.setState({ time });
  }

  calculateOffset() {
    let now = Date.now();
    let newOffset = now - this.offset;
    this.offset = now;
    return newOffset;
  }

  render() {
    return this.state.time;
  }
}
