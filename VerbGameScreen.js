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
    _panResponder: {},

    getInitialState: function() {
        return {
            displayedScreen: "/",
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

      this._itemLayouts = {};
      this._refs = {};
    },

    render: function() {
        var menuView;
        if (this.state.displayedScreen == "/") {
            menuView = <View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, borderWidth: 10, borderColor: 'pink'}}>
                <View style={{flex: 1}} />
                <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text name="/future" key="/future" onLayout={this._onItemLayout.bind(this, "/future")} ref={this._saveRef}>הווה/עתיד</Text>
                    <Text name="/past" key="/past" onLayout={this._onItemLayout.bind(this, "/past")} ref={this._saveRef}>עבר</Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text name="/imperative" key="/imperative" onLayout={this._onItemLayout.bind(this, "/imperative")} ref={this._saveRef}>ציווי</Text>
                </View>
            </View>;
        } else if (this.state.displayedScreen.startsWith("/past")) {
            var subItems = null;
            if (this.state.displayedScreen == "/past/1") {
                subItems = [
                    <Text name="/past/1/i" key="/past/1/i" onLayout={this._onItemLayout.bind(this, "/past/1/i")} ref={this._saveRef}>אני</Text>,
                    <Text name="/past/1/we" key="/past/1/we" onLayout={this._onItemLayout.bind(this, "/past/1/we")} ref={this._saveRef}>אנחנו</Text>
                ];
            } else if (this.state.displayedScreen == "/past/2") {
            }
            menuView = <View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, borderWidth: 10, borderColor: 'green', flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    {subItems}
                </View>
                <View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text>גוף</Text>
                    <Text name="/past/1" key="/past/1" onLayout={this._onItemLayout.bind(this, "/past/1")} ref={this._saveRef}>1</Text>
                    <Text name="/past/2" key="/past/2" onLayout={this._onItemLayout.bind(this, "/past/2")} ref={this._saveRef}>2</Text>
                    <Text name="/past/3" key="/past/3" onLayout={this._onItemLayout.bind(this, "/past/3")} ref={this._saveRef}>3</Text>
                </View>
                <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                    <Text>עבר</Text>
                </View>
            </View>;
        }

        return (
            <View style={{flex: 1, justifyContent:'center', borderWidth: 10, borderColor: 'blue'}}>
                {menuView}
                <View style={{flex: 1}}>
                    <View style={{flex: 1 }} />
                    <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                        <Animated.View
                            style={[
                                //styles.circle,
                                //this.props.style,
                                this.state.dragging && styles.draggingCircle,
                                {transform: this.state.pan.getTranslateTransform()}]}
                            {...this._panResponder.panHandlers}>
                            <Text
                                ref={this._saveRef}
                                name="draggable" key="draggable"
                                onLayout={this._onItemLayout.bind(this, "draggable")}>
                                פועל
                            </Text>
                        </Animated.View>
                    </View>
                    <View style={{flex: 1 }} />
                </View>
            </View>
        )
    },

    _saveRef: function(ref) {
        if (ref == null) {
            console.log("Got null ref");
            return;
        }
        if (!ref.props.name) {
            console.log("Got ref without key");
            return;
        }
        console.log("Saving ref:", ref.props.name);
        this._refs[ref.props.name] = ref;
    },

    _onItemLayout: function(path, position) {
        if (!this._refs[path]) {
            console.log("No ref:", path);
            return;
        }
        if (this._itemLayouts[path]) {
            console.log("Layout already saved:", path);
            return;
        }
        //this._itemLayouts[path] = position.nativeEvent.layout;
        this._refs[path].measure((x, y, width, height, pageX, pageY) => { this._itemLayouts[path] = {x, y, width, height, pageX, pageY}; });
    },

    _handlePanResponderGrant: function() {
        this.setState({dragging: true});
    },

    _handlePanResponderMove: function(e: Object, gestureState: Object) {
        this.state.pan.setValue({x: gestureState.dx, y: gestureState.dy});
        this._highlightOverlappingCircle();
    },

    _handlePanResponderEnd: function(e: Object, gestureState: Object) {
        this.setState({dragging: false, displayedScreen: "/"});
        this.state.pan.setValue({x: 0, y: 0});
    },

    _highlightOverlappingCircle: function() {
        var hoveredItem = null;
        console.log("children:", this._getChildren(this.state.displayedScreen));
        console.log("refs:", Object.keys(this._refs));
        for (var path of this._getChildren(this.state.displayedScreen)) {
            if (this._hitTest(path)) {
                //hoveredItem = path;
                //this._displayedScreen = hoveredItem;
                console.log("Found");
                this.setState({displayedScreen: path});
                break;
            }
        }
        //console.log("highlightedItem:", hoveredItem);
        //this.setState({highlightedItem: hoveredItem});
    },

    _getChildren: function(path) {
        if (path == "/") {
            return ["/future", "/past", "/imperative"];
        } else if (path == "/past") {
            return ["/past/1", "/past/2", "/past/3"];
        } else if (path == "/past/1") {
            return ["/past/1/i", "/past/2/we"];
        } else {
            return [];
        }
    },

    _hitTest: function(path) {
        var layout = this._itemLayouts[path];
        if (!layout) {
            // Not loaded yet.
            console.log("Not loaded:", path);
            return false;
        }

        // var mainItemPosition = {
        //     x: this._currentPan.x + this._layout.pageX,
        //     y: this._currentPan.y + this._layout.pageY,
        // };
        var mainLayout = this._itemLayouts["draggable"];
        if (!mainLayout) {
            console.log("No main item position");
            return false;
        }
        var mainItemPosition = {
            pageX: mainLayout.pageX + this._currentPan.x,
            pageY: mainLayout.pageY + this._currentPan.y,
            width: mainLayout.width,
            height: mainLayout.height
        }

        var horizontalOverlapping =
            (mainItemPosition.pageX + mainItemPosition.width >= layout.pageX) &&
            (mainItemPosition.pageX <= layout.pageX + layout.width);

        var verticalOverlapping =
            (mainItemPosition.pageY + mainItemPosition.height >= layout.pageY) &&
            (mainItemPosition.pageY <= layout.pageY + layout.height);

        if (path == "/imperative") {
            console.log("Hori:", horizontalOverlapping, "Ver:", verticalOverlapping);
            console.log("Main:", mainItemPosition.pageX, mainItemPosition.pageY);
            console.log("/imperative:", layout.pageX, layout.pageY);
        }
        return horizontalOverlapping && verticalOverlapping;
    },

});


var DragAndDropMenu = React.createClass({
    render: function() {
        var children = null;
        if (this.state.activeSubmenu != null) {
            var submenu = this.props.children[this.state.activeSubmenu];
            children = React.cloneElement(
                submenu,
                {
                    active: true,
                    menuItemLayoutChanged: this._saveItemLayout,
                    activeItem: this.state.activeMenuItem
                });
        } else {
            children = React.Children.map(
                this.props.children,
                function (child, i) {
                    return React.cloneElement(
                        child,
                        {
                            layoutChanged: this._saveChildLayout.bind(this, i),
                            active: false
                        });
                },
                this);
        }
        return (
            <View style={this.props.containerStyle}>
                {children}

                <Animated.View
                    style={[
                        styles.circle,
                        this.props.style,
                        this.state.dragging && styles.draggingCircle,
                        {transform: this.state.pan.getTranslateTransform()}]}
                    {...this._panResponder.panHandlers}
                    onLayout={this._onLayout}>
                    <Text>{this.props.title}</Text>
                </Animated.View>
            </View>
        );
    },

    _onLayout: function(position) {
        this._layout = position.nativeEvent.layout;
    },

    _saveChildLayout: function(childIndex, layout) {
        this._childLayouts[childIndex] = layout;
    },

    _saveItemLayout: function(itemIndex, layout) {
        this._itemLayouts[itemIndex] = layout;
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
        this.setState({dragging: false, activeSubmenu: null, activeMenuItem: null});
        this.state.pan.setValue({x: 0, y: 0});
        //this._highlightOverlappingCircle();
    },

    _highlightOverlappingCircle: function() {
        if (this.state.activeSubmenu != null) {
            var hoveredItem = this._itemLayouts.findIndex(item => this._hitTest(item));
            if (hoveredItem == -1) {
                hoveredItem = null;
            }
            this.setState({activeMenuItem: hoveredItem});
        } else {
            var hoveredSubmenu = this._childLayouts.findIndex(submenu => this._hitTest(submenu));
            if (hoveredSubmenu == -1) {
                hoveredSubmenu = null;
            }
            this.setState({activeSubmenu: hoveredSubmenu});
        }
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
        if (this.props.active) {
            var children = React.Children.map(this.props.children, (child, i) => {
                return React.cloneElement(child, {
                    active: i == this.props.activeItem,
                    layoutChanged: this.props.menuItemLayoutChanged.bind(null, i)
                });
            });
        } else {
            var children = null;
        }
        return (
            <View style={this.props.containerStyle}>
                <View
                    style={[
                        styles.submenu,
                        this.props.style,
                        this.props.active && styles.activeSubmenu]}
                    onLayout={this.onLayout}>
                    <Text>{this.props.title}</Text>
                </View>
                {children}
            </View>
        );
    },

    onLayout: function(position) {
        this.props.layoutChanged && this.props.layoutChanged(position.nativeEvent.layout);
    }
});

var DragAndDropMenuItem = React.createClass({
    render: function() {
        return (
            <View {...this.props}
                style={[
                    styles.menuItem,
                    this.props.style,
                    this.props.active && styles.activeMenuItem]}
                onLayout={this._onLayout}>
                <Text>{this.props.title}</Text>
            </View>
        );
    },

    _onLayout: function(position) {
        this.props.layoutChanged(position.nativeEvent.layout);
    }
});

var styles = StyleSheet.create({
    container: {
        borderColor: 'green',
        borderWidth: 10,
        flex: 1,
        backgroundColor: '#f5fcff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'blue',
        //position: 'absolute',
        //left: 0,
        //top: 0,
    },
    draggingCircle: {
        backgroundColor: 'red'
    },
    submenu: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'gray',
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
    activeMenuItem: {
        backgroundColor: 'pink',
    },
    submenuContainer: {
        borderColor: 'red',
        borderWidth: 10,
        //flex: 1,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

module.exports = VerbGameScreen;


var menuItems = [
    {
        title: "עבר",
        children: [
            {
                title: "1",
                children: [
                    {title: "אני (/אתה)"},
                    {title: "אנחנו"}
                ]
            },
            {
                title: "2",
                children: [
                    {title: "אתה (או אני)"},
                    {title: "את"},
                    {title: "אתם/אתן"}
                ]
            },
            {
                title: "3",
                children: [
                    {title: "הוא"},
                    {title: "היא"},
                    {title: "הם/הן"}
                ]
            },
        ]
    },
    {
        title: "הווה/עתיד",
        children: [
            {
                title: "1",
                children: [
                    {title: "אני"},
                    {title: "אנחנו"}
                ]
            },
            {
                title: "2",
                children: [
                    {title: "אתה (או היא)"},
                    {title: "את"},
                    {title: "אתם/אתן"}
                ]
            },
            {
                title: "3",
                children: [
                    {title: "הוא"},
                    {title: "היא (או אתה)"},
                    {title: "הם/הן"}
                ]
            },
        ]
    },
    {
        title: "ציווי",
        children: [
            {title: "אתה"},
            {title: "את"},
            {title: "אתם/אתן"}
        ]
    }
];
