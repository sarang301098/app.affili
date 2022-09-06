import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

class RatingChart extends Component {
  chartParams() {
    if (Meteor.isServer) {
      return null;
    }

    return {
      series: [parseInt(((this.props.ratings * 2 || 0) * 10), 10) || 0],
      options: {
        chart: {
          height: 100,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '70%',
            },
            track: {
              background: '#f12732',
              strokeWidth: '10%',
            },
            dataLabels: {
              showOn: 'always',
              name: {
                show: true,
                fontSize: '17px',
                fontWeight: 100,
                color: '#f12732',
                offsetY: 0
              },
              value: {
                show: true,
                fontSize: '12px',
                fontWeight: 100,
                color: '#f12732',
                offsetY: 0
              },
            }
          },

        },
        fill: {
          type: 'solid',
          colors: ['#f12732']
        },
        stroke: {
          lineCap: 'round',
        },
        labels: ['Rating'],
      },
      type: 'radialBar',
      height: 150,
      width: 150,
    };
  }

  render() {
    let chart;
    if (Meteor.isClient) {
      import Chart from 'react-apexcharts';

      chart = (
        <Chart {...this.chartParams()} />
      );
    }

    return (
      <div>
        <div style={{ position: 'relative' }}>
          {chart}
        </div>
      </div>
    );
  }
}

RatingChart.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default RatingChart;
