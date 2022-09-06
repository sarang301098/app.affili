import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import numeral from 'numeral';
import moment from 'moment';

class DateStatisticsChart extends Component {
  data() {
    const { intl } = this.context;
    const projectStatistics = this.props.statistics;

    const step = 24 * 60 * 60 * 1000;

    const visits = [intl.formatMessage({ id: 'projectVisit' })];
    const keys = [];

    const map = {};
    for (let i = 0, len = projectStatistics.length; i < len; i += 1) {
      const date = new Date(new Date(projectStatistics[i].date).getTime());
      const dateMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
      const key = dateMidnight.getTime().toString();
      if (Object.keys(map).indexOf(key) > -1) {
        if (projectStatistics[i].visits) {
          map[key].visits += projectStatistics[i].visits;
        }
      } else {
        map[key] = {
          visits: projectStatistics[i].visits || 0,
        };
      }
    }

    const days = this.props.endDate.diff(this.props.startDate, 'days');
    let completionsMax = 0;
    for (let key = this.props.startDate.valueOf(), x = 0; x <= days; x += 1) {
      const date = new Date(key);
      const dateMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
      const keyStr = dateMidnight.getTime().toString();
      keys.push(dateMidnight.getTime());
      if (Object.keys(map).indexOf(dateMidnight.getTime().toString()) < 0) {
        visits.push([dateMidnight.getTime(), 0]);
      } else {
        visits.push([dateMidnight.getTime(), map[keyStr].visits || 0]);
      }
      key += step;
    }

    return [visits];
  }

  chartParams() {
    if (Meteor.isServer) {
      return null;
    }

    let columns = this.data();

    return {
      options: {
        grid: {
          borderColor: window.nightMode ? '#666' : '#f5f5f5',
          show: true,
          padding: {

          }
        },
        chart: {
          id: 'date-statistics-chart-' + this.props.type,
          type: 'line',
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          }
        },
        markers: {
          size: 0
        },
        tooltip: {
          x: {
            format: 'dd.MM.yyyy'
          },
          y: {
            formatter: (value) => {
              return numeral(Math.abs(value)).format('0,0');
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: columns.length === 3 ? [4, 0, 0] : 4,
          curve: 'smooth'
        },
        legend: {
          position: 'top',
          show: true,
          fontSize: '10px',
          fontFamily: '"Source Sans Pro", sans-serif',
          labels: {
            colors: ['#999', '#999', '#999']
          }
        },
        xaxis: {
          type: 'datetime',
          tickAmount: 5,
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          tooltip: {
            enabled: false
          },
          labels: {
            hideOverlappingLabels: true,
            formatter: (val, timestamp) => moment(timestamp).format('DD.MM.YYYY'),
            style: {
              colors: ['#999', '#999', '#999', '#999', '#999', '#999'],
              fontSize: '10px',
              fontFamily: '"Source Sans Pro", sans-serif'
            },
          }
        },
        yaxis: columns.length === 3 ? [
          {
            seriesName: columns[0][0],
            tickAmount: 4,
            axisTicks: {
              color: '#eee'
            },
            labels: {
              style: {
                color: '#999',
                fontSize: '10px',
                fontFamily: '"Source Sans Pro", sans-serif'
              },
              formatter: (val) => numeral(val).format('0,0')
            }
          },
          {
            seriesName: columns[0][0],
            tickAmount: 4,
            show: false,
            axisTicks: {
              color: '#eee'
            },
            labels: {
              style: {
                color: '#999',
                fontSize: '10px',
                fontFamily: '"Source Sans Pro", sans-serif'
              },
              formatter: (val) => numeral(val).format('0,0')
            }
          },
          {
            seriesName: columns[2][0],
            tickAmount: 4,
            opposite: true,
            axisTicks: {
              color: '#eee'
            },
            labels: {
              style: {
                color: '#999',
                fontSize: '10px',
                fontFamily: '"Source Sans Pro", sans-serif'
              },
              formatter: (val) => numeral(val).format('0,0')
            }
          }
        ] : {
          min: 0,
          tickAmount: 4,
          labels: {
            style: {
              color: '#999',
              fontSize: '10px',
              fontFamily: '"Source Sans Pro", sans-serif'
            },
            formatter: (val) => numeral(val).format('0,0')
          },
        },
        colors: ['#000000', '#999', '#ddd'],
        // fill: {
        //   type: 'gradient',
        //   gradient: {
        //     shadeIntensity: 1,
        //     opacityFrom: 0.4,
        //     opacityTo: 0.7,
        //     stops: [0, 90, 100]
        //   }
        // }
      },
      type: 'line',
      series: columns.map((col, i) => ({
        name: col[0],
        data: col.slice(1),
        type: 'line'
      })),
      height: 300,
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

    const loaded = this.props.loaded;
    return (
      <div style={{ margin: 0, minHeight: 300 }}>
        <div style={{ position: 'relative' }}>
          <div className={'date-statistics-chart date-statistics-chart-' + this.props.size}>
            <div style={{ position: 'relative' }}>
              {chart}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DateStatisticsChart.propTypes = {
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  type: PropTypes.string
};

DateStatisticsChart.defaultProps = {
  startDate: null,
  endDate: null,
  type: null
};

DateStatisticsChart.contextTypes = {
  intl: PropTypes.object.isRequired
};

export default DateStatisticsChart;
