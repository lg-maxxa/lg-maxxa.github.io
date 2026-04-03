// Mock for SVG files in Jest tests
const React = require('react');
const {View} = require('react-native');
module.exports = {
  default: (props) => React.createElement(View, props),
  __esModule: true,
};
