'use strict';

var _ = require('lodash');
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
            menuView = this.renderMainView();
        } else if (this.state.displayedScreen.startsWith("/past")) {
            menuView = this.renderPastView();
        }

        return (
            <View style={{flex: 1, justifyContent:'center', borderWidth: 10, borderColor: 'blue'}}>
                {menuView}
                <View style={{flex: 1}}>
                    <View style={{flex: 1 }} />
                    <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                        <Animated.View
                            style={[
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

    renderMainView: function() {
        return <View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, borderWidth: 10, borderColor: 'pink'}}>
            <View style={{flex: 1}} />
            <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {this.renderTextElement("/future")}
                {this.renderTextElement("/past")}
            </View>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                {this.renderTextElement("/imperative")}
            </View>
        </View>;
    },

    renderPastView: function() {
        var subItems = null;
        if (this.state.displayedScreen.startsWith("/past/")) {
            subItems = this.renderTextElementsForChildren(this.state.displayedScreen);
        }

        var menuView = <View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, borderWidth: 10, borderColor: 'green', flexDirection: 'row'}}>
            <View style={{flex: 1}}>
                {subItems}
            </View>
            <View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                <Text>גוף</Text>
                {this.renderTextElementsForChildren("/past")}
            </View>
            <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                <Text>עבר</Text>
            </View>
        </View>;

        return menuView;
    },

    renderTextElementsForChildren: function(path) {
        return _.map(
            this._getChildren(path),
            (child, childPath) => this.renderTextElement(childPath, child)
        );
    },

    renderTextElement: function(path, item) {
        if (!item) {
            item = this._getMenuItem(path);
        }

        return <Text
            name={path}
            key={path}
            onLayout={this._onItemLayout.bind(this, path)}
            ref={this._saveRef}
            style={this.state.highlightedItem == path && {backgroundColor: 'blue'}}>
            {item.title}
        </Text>;
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
        //console.log("children:", this._getMenuItem(this.state.displayedScreen).children);
        // console.log("refs:", Object.keys(this._refs));
        var hoveredItem = null;
        var hitCandidates = this._getChildren(this.state.displayedScreen);
        var treeLevel = this.state.displayedScreen.match(/\//g).length;
        if (treeLevel == 2) {
            Object.assign(hitCandidates, this._getSiblings(this.state.displayedScreen));
        }
        console.log("hit candidates:", Object.keys(hitCandidates));
        for (var path in hitCandidates) {
            if (this._hitTest(path)) {
                console.log("Found");
                hoveredItem = path;
                break;
            }
        }

        if (hoveredItem) {
            if (this._isDropTarget(hoveredItem)) {
                this.setState({highlightedItem: hoveredItem});
            } else {
                this.setState({displayedScreen: hoveredItem});
            }
        } else {
            this.setState({highlightedItem: null});
        }
    },

    _getChildren: function(path) {
        var pathPrefix = path == "/" ? "/" : path + "/";
        return _.mapKeys(this._getMenuItem(path).children, (child, key) => pathPrefix + key);
    },

    _getSiblings: function(path) {
        var parentsChildren = this._getChildren(this._getParent(path));
        return _.omit(parentsChildren, path);
    },

    _getParent: function(path) {
        return path.substring(0, path.lastIndexOf("/"));
    },

    _getMenuItem: function(path) {
        if (path == "/") {
            return menuItems;
        }
        var pathParts = path.substring(1).split("/");
        var current = menuItems;
        while (pathParts.length > 0) {
            if (!current) {
                console.log("Can't get:", path, pathParts);
            }
            current = current.children[pathParts.shift()];
        }
        return current;
    },

    _isDropTarget: function(path) {
        return !this._getMenuItem(path).children;
    },

    _hitTest: function(path) {
        var layout = this._itemLayouts[path];
        if (!layout) {
            console.log("Not loaded:", path);
            return false;
        }

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

        // if (path == "/imperative") {
        //     console.log("Hori:", horizontalOverlapping, "Ver:", verticalOverlapping);
        //     console.log("Main:", mainItemPosition.pageX, mainItemPosition.pageY);
        //     console.log("/imperative:", layout.pageX, layout.pageY);
        // }
        return horizontalOverlapping && verticalOverlapping;
    },

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

var menuItems = {
    "children": {
        "past": {
            title: "עבר",
            children: {
                "1": {
                    title: "1",
                    children: {
                        "singular": {title: "אני (/אתה)"},
                        "plural": {title: "אנחנו"}
                    }
                },
                "2": {
                    title: "2",
                    children: {
                        "masculine": {title: "אתה (או אני)"},
                        "feminine": {title: "את"},
                        "plural": {title: "אתם/אתן"}
                    }
                },
                "3": {
                    title: "3",
                    children: {
                        "masculine": {title: "הוא"},
                        "feminine": {title: "היא"},
                        "plural": {title: "הם/הן"}
                    }
                },
            }
        },
        "future": {
            title: "הווה/עתיד",
            children: {
                "1": {
                    title: "1",
                    children: {
                        "singular": {title: "אני"},
                        "plural": {title: "אנחנו"}
                    }
                },
                "2": {
                    title: "2",
                    children: {
                        "masculine": {title: "אתה (או היא)"},
                        "feminine": {title: "את"},
                        "plural": {title: "אתם/אתן"}
                    }
                },
                "3": {
                    title: "3",
                    children: {
                        "masculine": {title: "הוא"},
                        "feminine": {title: "היא (או אתה)"},
                        "plural": {title: "הם/הן"}
                    }
                },
            }
        },
        "imperative": {
            title: "ציווי",
            children: {
                "masculine": {title: "אתה"},
                "feminine": {title: "את"},
                "plural": {title: "אתם/אתן"}
            }
        }
    }
};
