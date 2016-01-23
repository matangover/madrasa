'use strict';

var React = require('react-native');
var {
    Animated,
    PanResponder,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    processColor
} = React;

var CIRCLE_SIZE = 80;

var VerbGameScreen = React.createClass({
    render: function() {
        return (
            <DragAndDropMenu>
                <DragAndDropSubmenu title="עבר" style={{top:100, left: 100}}>
                    <DragAndDropMenuItem />
                    <DragAndDropMenuItem />
                    <DragAndDropMenuItem />
                </DragAndDropSubmenu>
                <DragAndDropSubmenu title="ציווי" style={{top:200, left: 200}}>
                    <DragAndDropMenuItem />
                    <DragAndDropMenuItem />
                    <DragAndDropMenuItem />
                </DragAndDropSubmenu>
                <DragAndDropSubmenu title="הווה/עתיד" style={{top:300, left: 300}}>
                    <DragAndDropMenuItem />
                    <DragAndDropMenuItem />
                    <DragAndDropMenuItem />
                </DragAndDropSubmenu>
            </DragAndDropMenu>
        )
    },
});

var DragAndDropMenu = React.createClass({
    _panResponder: {},

    getInitialState: function() {
        return {
            activeSubmenu: null,
            dragging: false,
            pan: new Animated.ValueXY()
        };
    },

    componentWillMount: function() {
      this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
        onPanResponderGrant: this._handlePanResponderGrant,
        onPanResponderMove: this._handlePanResponderMove,
        onPanResponderRelease: this._handlePanResponderEnd,
        onPanResponderTerminate: this._handlePanResponderEnd,
      });
      this.state.pan.addListener(value => {
         this._currentPan = value;
      });

      this._childLayouts = [];
    },

    render: function() {
        return (
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.circle,
                        this.state.dragging && styles.draggingCircle,
                        {transform: this.state.pan.getTranslateTransform()}]}
                    {...this._panResponder.panHandlers}
                    onLayout={this._onLayout}
                />

                {
                    React.Children.map(
                        this.props.children,
                        function (child, i) {
                            return React.cloneElement(
                                child,
                                {
                                    layoutChanged: this._saveChildLayout.bind(this, i),
                                    active: i == this.state.activeSubmenu
                                });
                        },
                        this)
                }
            </View>
        );
    },

    _onLayout: function(position) {
        this._layout = position.nativeEvent.layout;
    },

    _saveChildLayout: function(childIndex, layout) {
        this._childLayouts[childIndex] = layout;
    },

    _handlePanResponderGrant: function() {
        //this.state.pan.setOffset(this._currentPan);
        this.setState({dragging: true});
    },

    _handlePanResponderMove: function(e: Object, gestureState: Object) {
        this.state.pan.setValue({x: gestureState.dx, y: gestureState.dy});
        this._highlightOverlappingCircle();
    },

    _handlePanResponderEnd: function(e: Object, gestureState: Object) {
        this.setState({dragging: false});
        this.state.pan.setValue({x: 0, y: 0});
        this._highlightOverlappingCircle();
    },

    _highlightOverlappingCircle: function() {
        var overlappingCircleIndex = this._childLayouts.findIndex(submenu => this._hitTest(submenu));
        this.setState({activeSubmenu: overlappingCircleIndex});
    },

    _hitTest: function(submenu) {
        var circle1Center = {
            x: this._currentPan.x + this._layout.x + this._layout.width / 2,
            y: this._currentPan.y + this._layout.y + this._layout.height / 2
        };
        var circle2Center = {
            x: submenu.x + submenu.width / 2,
            y: submenu.y + submenu.height / 2
        };
        var distanceBetweenCenters = Math.sqrt(
            Math.pow(circle1Center.x - circle2Center.x, 2) +
            Math.pow(circle1Center.y - circle2Center.y, 2));
        var circle1Radius = this._layout.width / 2;
        var circle2Radius = submenu.width / 2;
        return distanceBetweenCenters < circle1Radius + circle2Radius;
    },
});

var DragAndDropSubmenu = React.createClass({
    render: function() {
        var children = this.props.active ? this.props.children : null;
        return (
            <View>
                <View
                    style={[
                        styles.submenu,
                        this.props.style,
                        this.props.active && styles.activeSubmenu]}
                    onLayout={this.onLayout} />
                {children}
            </View>
        );
    },

    onLayout: function(position) {
        this.props.layoutChanged(position.nativeEvent.layout);
    }
});

var DragAndDropMenuItem = React.createClass({
    getInitialState: function() {
        return {
            active: false
        };
    },

    render: function() {
        return (
            <View {...this.props} style={styles.menuItem}/>
        );
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5fcff'
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'blue',
        position: 'absolute',
        left: 0,
        top: 0,
    },
    draggingCircle: {
        backgroundColor: 'red'
    },
    submenu: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'black',
        position: 'absolute'
    },
    activeSubmenu: {
        backgroundColor: 'green'
    },
    menuItem: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'black',
        position: 'absolute'
    },
});

module.exports = VerbGameScreen;
