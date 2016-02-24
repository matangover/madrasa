'use strict';

var _ = require('lodash');
var TimerMixin = require('react-timer-mixin');
var Subscribable = require('Subscribable');
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
    mixins: [Subscribable.Mixin, TimerMixin],

    getInitialState: function() {
        return {
            displayedScreen: "/",
            dragging: false,
            dropped: false,
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

      this.addListenerOn(this.props.navigator.navigationContext, 'didfocus', this._didFocus);
      //this.props.navigator.navigationContext.addListener('didfocus', this._didFocus);
    },

    render: function() {
        if (this.state.dropped) {
            return this.renderDroppedView();
        }

        var menuView;
        if (this.state.displayedScreen == "/") {
            menuView = this.renderMainView();
        } else if (this.state.displayedScreen.startsWith("/past")) {
            menuView = this.renderPastView();
        } else if (this.state.displayedScreen.startsWith("/future")) {
            menuView = this.renderFutureView();
        } else if (this.state.displayedScreen == "/imperative") {
            menuView = this.renderImperativeView();
        }

        var circleColor = this.state.displayedScreen == "/" ? "rgb(174, 200, 245)" : "transparent";

        return (
            <View style={styles.gameContainer}>
                <View style={{height: 400, marginHorizontal: 20}}>
                    {menuView}
                    <View style={{flex: 1, backgroundColor: 'transparent'}}>
                        <View style={{flex: 1 }} />
                        <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{backgroundColor: circleColor, borderRadius: 40, width: 80, height: 80, justifyContent: 'center', alignItems: 'center'}}>
                                <Animated.View
                                    style={[
                                        this.state.dragging && styles.draggingCircle,
                                        {transform: this.state.pan.getTranslateTransform()}]}
                                    {...this._panResponder.panHandlers}>
                                        <Text
                                            style={{color: 'rgb(41, 108, 182)', fontSize: 30, fontWeight: 'bold', fontFamily: 'Palatino'}}
                                            ref={this._saveRef}
                                            name="draggable" key="draggable"
                                            onLayout={this._onItemLayout.bind(this, "draggable")}>
                                            פועל
                                        </Text>
                                </Animated.View>
                            </View>
                        </View>
                        <View style={{flex: 1 }} />
                    </View>
                </View>
            </View>
        )
    },

    renderDroppedView: function() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{backgroundColor: 'rgb(174, 200, 245)', borderRadius: 60, width: 120, height: 120, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'rgb(41, 108, 182)', fontSize: 30, fontWeight: 'bold', fontFamily: 'Palatino'}}>מצוין!</Text>
                </View>
            </View>
        );
    },

    renderMainView: function() {
        return <View style={[styles.menuLevel1Container, {flexDirection: 'column'}]}>
            <View style={{flex: 1}} />
            <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {this.renderTextElement("/future", null, null, styles.menuItemLevel1)}
                {this.renderTextElement("/past", null, null, styles.menuItemLevel1)}
            </View>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                {this.renderTextElement("/imperative", null, null, styles.menuItemLevel1)}
            </View>
        </View>;
    },

    renderPastView: function() {
        var subItems = null;
        if (this.state.displayedScreen.startsWith("/past/")) {
            subItems = this.renderTextElementsForChildren(this.state.displayedScreen, styles.menuItemLevel3Container, styles.menuItemLevel3Text);
        }

        var menuView = <View style={styles.menuLevel1Container}>
            <View style={styles.menuLevel3Container}>
                <View style={{flex: 1}} />
                <View style={{flex: 3, justifyContent: 'space-around', alignItems: 'center'}}>
                    {subItems}
                </View>
            </View>
            <View style={styles.menuLevel2Container}>
                <Text style={styles.menuTitleLevel2}>גוף</Text>
                {this.renderTextElementsForChildren("/past", styles.menuItemLevel2Container, styles.menuItemLevel2Text)}
            </View>
            <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                <Text style={styles.menuItemLevel1}>עבר</Text>
            </View>
        </View>;

        return menuView;
    },

    renderFutureView: function() {
        var subItems = null;
        if (this.state.displayedScreen.startsWith("/future/")) {
            subItems = this.renderTextElementsForChildren(this.state.displayedScreen, styles.menuItemLevel3Container, styles.menuItemLevel3Text);
        }

        var menuView = <View style={styles.menuLevel1Container}>
            <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center'}}>
                <Text style={styles.menuItemLevel1}>הווה/עתיד</Text>
            </View>
            <View style={styles.menuLevel2Container}>
                <Text style={styles.menuTitleLevel2}>גוף</Text>
                {this.renderTextElementsForChildren("/future", styles.menuItemLevel2Container, styles.menuItemLevel2Text)}
            </View>
            <View style={styles.menuLevel3Container}>
                <View style={{flex: 1}} />
                <View style={{flex: 3, justifyContent: 'space-around', alignItems: 'center'}}>
                    {subItems}
                </View>
            </View>
        </View>;

        return menuView;
    },

    renderImperativeView: function() {
        return (
            <View style={[styles.menuLevel1Container, {flexDirection: 'column'}]}>
                <View style={{flex: 1}} />
                <View style={{flex: 2, flexDirection: 'row', alignItems: 'center'}}>
                    {
                        this.renderTextElementsForChildren(
                            "/imperative",
                            styles.menuItemLevel3ContainerHorizontal,
                            styles.menuItemLevel3Text
                        ).reverse()
                    }
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    {this.renderTextElement("/imperative", null, null, styles.menuItemLevel1)}
                </View>
            </View>
        );
    },

    renderTextElementsForChildren: function(path, containerStyle, textStyle) {
        var textElements = _.map(
            this._getChildren(path),
            (child, childPath) => this.renderTextElement(childPath, child, containerStyle, textStyle)
        );
        if (textElements.length == 2) {
            textElements.push(<Text key="spacer" />);
        }
        return textElements;
    },

    renderTextElement: function(path, item, containerStyle, textStyle) {
        if (!item) {
            item = this._getMenuItem(path);
        }

        return (
            <View
                style={[
                    containerStyle,
                    this.state.highlightedItem == path && styles.highlightedMenuItem
                ]}
                key={path + ":container"}>
                <Text
                    name={path}
                    key={path}
                    onLayout={this._onItemLayout.bind(this, path)}
                    ref={this._saveRef}
                    style={textStyle}>
                    {item.title}
                </Text>
            </View>
        );
    },

    _didFocus: function(event) {
        if (event.target.currentRoute.name == 'verb_game') {
            console.log("didfocus");
            this._saveItemLayout("draggable");
            _.map(this._getChildren("/"), (child, key) => this._saveItemLayout(key));
        }
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
        if (this._itemLayouts[path]) {
            console.log("Layout already saved:", path);
            return;
        }
        this._saveItemLayout(path);
    },

    _saveItemLayout: function(path) {
        if (!this._refs[path]) {
            console.log("No ref:", path);
            return;
        }
        //if (path == "draggable") {
        //    console.log("Position:", position.nativeEvent);
        //}
        // if (this._itemLayouts[path]) {
        //     console.log("Layout already saved:", path);
        //     return;
        // }
        this._refs[path].measure(
            (x, y, width, height, pageX, pageY) => {
                // var prev = this._itemLayouts[path];
                // if (prev) {
                //     console.log(path, "Prev:", prev.pageX, prev.pageY, "Curr:", pageX, pageY);
                // }
                this._itemLayouts[path] = {x, y, width, height, pageX, pageY};
            }
        );
        //if (path=="draggable") console.log("Measured Position:", x, y, width, height, pageX, pageY);});
    },

    _handlePanResponderGrant: function() {
        this.setState({dragging: true});
    },

    _handlePanResponderMove: function(e: Object, gestureState: Object) {
        this.state.pan.setValue({x: gestureState.dx, y: gestureState.dy});
        this._highlightOverlappingCircle();
    },

    _handlePanResponderEnd: function(e: Object, gestureState: Object) {
        if (this.state.highlightedItem) {
            this.setState(
                {dragging: false, displayedScreen: "/", dropped: true},
                () => {
                    this.setTimeout(() => { this.setState({dropped: false}) }, 2000);
                });
        } else {
            this.setState({dragging: false, displayedScreen: "/"});
        }
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
        backgroundColor: 'rgb(174, 200, 245)',
        opacity: 0.8,
        borderRadius: 10,
        padding: 5
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

    gameContainer: {
        flex: 1,
        justifyContent:'center',
        //borderWidth: 10,
        //borderColor: 'blue',
        backgroundColor: 'rgb(255, 255, 248)'
    },
    menuItemLevel1: {
        fontFamily: 'Palatino',
        fontWeight: 'bold',
        fontSize: 22,
        color: 'rgb(13, 64, 120)'
    },
    menuTitleLevel2: {
        fontFamily: 'Palatino',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgb(60, 30, 5)'
    },
    menuItemLevel2Container: {
        borderRadius: 10,
        backgroundColor: '#c0b3af',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menuItemLevel2Text: {
        fontFamily: 'Palatino',
        fontSize: 20,
        color: 'rgb(60, 30, 5)'
    },
    menuItemLevel3Container: {
        padding: 5
    },
    menuItemLevel3ContainerHorizontal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    menuItemLevel3Text: {
        fontFamily: 'Palatino',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgb(60, 30, 5)'
    },
    menuLevel1Container: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        //borderWidth: 10,
        //borderColor: 'green',
        flexDirection: 'row'
    },
    menuLevel2Container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 40,
        marginHorizontal: 40,
        backgroundColor: '#e2dcda',
        borderRadius: 10,
        paddingVertical: 10
    },
    menuLevel3Container: {
        flex: 1,
        marginVertical: 40
    },
    highlightedMenuItem: {
        backgroundColor: 'blue',
        borderRadius: 5,
        padding: 5,
        backgroundColor: '#e2dcda'
    }
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
                        "masculine": {title: "אתה (/אני)"},
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
                        "masculine": {title: "אתה (/היא)"},
                        "feminine": {title: "את"},
                        "plural": {title: "אתם/אתן"}
                    }
                },
                "3": {
                    title: "3",
                    children: {
                        "masculine": {title: "הוא"},
                        "feminine": {title: "היא (/אתה)"},
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
