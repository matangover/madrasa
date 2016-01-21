'use strict';

var React = require('react-native');
var {
    PanResponder,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    processColor
} = React;

var CIRCLE_SIZE = 80;
var CIRCLE_COLOR = 'blue';
var CIRCLE_HIGHLIGHT_COLOR = 'green';


var VerbGameScreen = React.createClass({

    _panResponder: {},
    _previousLeft: 0,
    _previousTop: 0,
    _circleStyles: {},
    circle: (null : ?{ setNativeProps(props: Object): void }),
    _hightlightedCircle: null,

    getInitialState: function() {
        return {
            showSubmenu: false
        };
    },

    componentWillMount: function() {
      this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => this._highlight(),
        onPanResponderMove: this._handlePanResponderMove,
        onPanResponderRelease: this._handlePanResponderEnd,
        onPanResponderTerminate: this._handlePanResponderEnd,
      });
      this._previousLeft = 20;
      this._previousTop = 84;
      this._circleStyles = {
        style: {
          left: this._previousLeft,
          top: this._previousTop
        }
      };
    },

    componentDidMount: function() {
        this._updatePosition();
    },


    render: function() {
        // return (
        //     <View style={styles.container}>
        //         <View style={styles.content}>
        //             <Text>Verbs! Verbing? Has been being verbed.</Text>
        //         </View>
        //         <TouchableHighlight
        //             style={styles.backButton}
        //             onPress={() => this.props.navigator.pop()}>
        //             <Text style={styles.backText}>מסך ראשי</Text>
        //         </TouchableHighlight>
        //     </View>
        // );

        var submenu = this.state.showSubmenu ?
            <View style={[{left:100, top:300}, styles.genericCircle]} /> :
                null;

        return (
            <View style={styles.container}>
                <View
                    ref={(circle) => {this.circle = circle;}}
                    style={styles.circle}
                    {...this._panResponder.panHandlers}
                />
                <View
                    ref={(circle) => {this.circle1 = circle;}}
                    style={[{left: 100, top: 100}, styles.genericCircle]}
                />
                <View
                    ref={(circle) => {this.circle2 = circle;}}
                    style={[{left: 200, top: 200}, styles.genericCircle]}
                />
                <View
                    ref={(circle) => {this.circle3 = circle;}}
                    style={[{left: 300, top: 300}, styles.genericCircle]}
                />
            {submenu}
            </View>
        );

    },

    _highlight: function() {
        const circle = this.circle;
        circle && circle.setNativeProps({
            style: {
                backgroundColor: processColor(CIRCLE_HIGHLIGHT_COLOR)
            }
        });
    },

    _unHighlight: function() {
        const circle = this.circle;
        circle && circle.setNativeProps({
            style: {backgroundColor: processColor(CIRCLE_COLOR)}
        });
    },

    _updatePosition: function() {
        this.circle && this.circle.setNativeProps(this._circleStyles);
    },

    _handlePanResponderMove: function(e: Object, gestureState: Object) {
        this._circleStyles.style.left = this._previousLeft + gestureState.dx;
        this._circleStyles.style.top = this._previousTop + gestureState.dy;
        this._updatePosition();
        this._highlightOverlappingCircle(this._circleStyles.style);
    },

    _handlePanResponderEnd: function(e: Object, gestureState: Object) {
        this._unHighlight();
        this._previousLeft += gestureState.dx;
        this._previousTop += gestureState.dy;
        // TODO: calculate again with new coordinates from this event.
        if (this._hightlightedCircle) {
            this._hightlightedCircle.setNativeProps({
                style: { backgroundColor: processColor("black") }
            });
        }
    },

    _highlightOverlappingCircle: function(draggedCircleStyles) {
        var circles = [
            {ref: this.circle1, position: {left:100,top:100}},
            {ref: this.circle2, position: {left:200,top:200}},
            {ref: this.circle3, position: {left:300,top:300}}];
        var overlappingCircle = circles.find(circle => this._hitTest(draggedCircleStyles, circle.position));
        if (overlappingCircle == this._hightlightedCircle) {
            return;
        }

        if (this._hightlightedCircle) {
            this._hightlightedCircle.setNativeProps({
                style: { backgroundColor: processColor("black") }
            });
        }
        if (overlappingCircle) {
            overlappingCircle.ref.setNativeProps({
                style: { backgroundColor: processColor("yellow") }
            });
        }
        this._hightlightedCircle = overlappingCircle ? overlappingCircle.ref : null;

        this.setState({showSubmenu: overlappingCircle != null});
    },

    _hitTest: function(circle1, circle2) {
        var circle1Center = {left: circle1.left + CIRCLE_SIZE/2, top: circle1.top + CIRCLE_SIZE/2};
        var circle2Center = {left: circle2.left + CIRCLE_SIZE/2, top: circle2.top + CIRCLE_SIZE/2};
        var distanceBetweenCenters = Math.sqrt(
            Math.pow(circle1Center.left - circle2Center.left, 2) +
            Math.pow(circle1Center.top - circle2Center.top, 2));
        return distanceBetweenCenters < CIRCLE_SIZE;
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
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: CIRCLE_COLOR,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    genericCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'black',
        position: 'absolute'
    },

});

module.exports = VerbGameScreen;
