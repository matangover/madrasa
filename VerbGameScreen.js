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
        <View style={styles.container}>
            <Text>Verbs! Verbing? Has been being verbed.</Text>
        </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

module.exports = VerbGameScreen;
