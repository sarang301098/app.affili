import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';

export default ({ children, id, style, className }) => (
  <small className={className || 'ml-2'} style={style}>
    <i id={'info-tooltip-' + id} className="fa fa-info-circle" />
    <UncontrolledTooltip target={'info-tooltip-' + id} delay={0}>{children}</UncontrolledTooltip>
  </small>
);
