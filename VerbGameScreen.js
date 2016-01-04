'use strict';

var React = require('react-native');
var {
  Image,
  StyleSheet,
  Text,
  View,
} = React;

var VerbGameScreen = React.createClass({
  render: function() {
    return (
        <View style={styles.main}>
            <Text>Verbs! Verbing? Has been being verbed.</Text>
        </View>
    );
  },
});

var styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

module.exports = VerbGameScreen;
