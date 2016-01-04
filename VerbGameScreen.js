'use strict';

var React = require('react-native');
var {StyleSheet, Text, TouchableHighlight, View} = React;

var VerbGameScreen = React.createClass({
    render: function() {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text>Verbs! Verbing? Has been being verbed.</Text>
                </View>
                <TouchableHighlight
                    style={styles.backButton}
                    onPress={() => this.props.navigator.pop()}>
                    <Text style={styles.backText}>מסך ראשי</Text>
                </TouchableHighlight>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5fcff'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backButton: {
        alignSelf: 'center',
        marginBottom: 10,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#7a9e2b'
    },
    backText: {
        backgroundColor: '#a9d947',
        color: 'white',
        padding: 5,
        fontWeight: 'bold'
    }
});

module.exports = VerbGameScreen;
