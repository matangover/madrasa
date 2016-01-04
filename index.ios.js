/**
 * Madrasa - learn spoken Arabic
 */
'use strict';

var React = require('react-native');
var {
    AppRegistry,
    Image,
    Navigator,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} = React;

var VerbGameScreen = require('./VerbGameScreen');

var renderScene = function(route, navigator) {
    if (route.name === 'main') {
        return (
            <View style={styles.container}>
                <Image source={require('./images/header.png')} style={styles.header}/>
                <TouchableHighlight style={styles.button} onPress={() => console.log('clicked lessons')}>
                    <Image source={require('./images/button1.png')} style={styles.buttonImage}/>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={() => navigator.push({name: 'verb_game'})}
                    style={styles.button}>
                    <Image source={require('./images/button2.png')} style={styles.buttonImage}/>
                </TouchableHighlight>
            </View>
        );
    } else if (route.name === 'verb_game') {
        return (
            <VerbGameScreen navigator={navigator} />
        );
    }
};


var Madrasa = React.createClass({
    render: function() {
        var initialRoute = {name: 'main'};
        return (
              <Navigator
                  style={styles.container}
                  initialRoute={initialRoute}
                  configureScene={() => Navigator.SceneConfigs.FadeAndroid}
                  renderScene={renderScene}
                />
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
