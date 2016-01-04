/**
 * Madrasa - learn spoken Arabic
 */
'use strict';

var React = require('react-native');
var {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} = React;

var Madrasa = React.createClass({
    render: function() {
        return (
            <View style={styles.container}>
                <Image source={require('./images/header.png')} style={styles.header}/>
                <TouchableHighlight style={styles.button} onPress={() => console.log('clicked lessons')}>
                    <Image source={require('./images/button1.png')} style={styles.buttonImage}/>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => console.log('clicked 2')} style={styles.button}>
                    <Image source={require('./images/button2.png')} style={styles.buttonImage}/>
                </TouchableHighlight>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    header: {
        width: 147,
        height: 100,
        marginBottom: 20
    },
    button: {
        marginTop: 10
    },
    buttonImage: {
        width: 142,
        height: 50
    }
});

AppRegistry.registerComponent('Madrasa', () => Madrasa);
