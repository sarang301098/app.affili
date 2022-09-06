import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ionicons from '../utils/ionicons';
import FontIconPicker from './fontIconPicker/FontIconPicker';

class IconSelection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false
    };

    this.select = this.select.bind(this);
  }

  select(icon) {
    this.setState({ dropdownOpen: false });
    if (this.props.onChange) {
      this.props.onChange(icon.replace('ion-', ''));
    }
  }

  render() {
    const { t } = this.props;

    /*
    const fontAwesomeDropdown = (
      <div className="icon-dropdown">
        <Dropdown toggle={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })} isOpen={this.state.dropdownOpen}>
          <DropdownToggle color={this.props.color || 'secondary'} size="sm" id="icon-dropdown-btn" className="btn-block" caret>
            {this.state.value ? <i className={this.state.value} /> : <small>{this.props.selectText || 'Wählen…'}</small>}
          </DropdownToggle>
          <DropdownMenu className={this.state.dropdownOpen ? 'show' : null}>
            <DropdownItem active={!this.state.value} onClick={() => this.select(null)} className="no-icon">Kein Icon</DropdownItem>
            {this.icons().map((icon, i) => (
              <DropdownItem active={this.state.value === icon} key={i} onClick={() => this.select(icon)}><i className={icon} /></DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
    */

    const fontAwesomeDropdown = (
      <FontIconPicker
        icons={Object.keys(ionicons).map(key => 'ion-' + key)}
        value={'ion-' + this.props.value}
        onChange={value => this.select(value)}
        allCatPlaceholder="Alle Kategorien"
        searchPlaceholder="Icons suchen…"
        noIconPlaceholder="Keine Icons gefunden"
        noSelectedPlaceholder="Icon auswählen"
        btnTheme={this.props.color}
        theme={this.props.color}
      />
    );

    return fontAwesomeDropdown;
  }
}

IconSelection.propTypes = {
  icons: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func,
  imageValue: PropTypes.string,
  onImageChange: PropTypes.func
};

export default IconSelection;
