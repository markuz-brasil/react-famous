'use strict';

import * as assign from 'object-assign'

import * as PropTypes from 'react/lib/ReactPropTypes'
import * as ReactTransitionChildMapping from 'react/lib/ReactTransitionChildMapping'

var base = {
  propTypes: {
    _owner: PropTypes.object,
    component: PropTypes.func.isRequired
  },

  render() {
    var childrenToRender = {};
    for (var key in this._children) {
      var child = this._children[key];
      if (child) {
        childrenToRender[key] = this._wrapChild(child);
      }
    }
    return this.props.component(this.props, childrenToRender);
  },

  getInitialState () {
    this._children = ReactTransitionChildMapping.getChildMapping(this.props.children)
    return null
  },


  componentWillReceiveProps (nextProps) {
    var nextChildMapping = ReactTransitionChildMapping.getChildMapping(
      nextProps.children
    );
    var prevChildMapping = this._children;

    this.setState({
      children: ReactTransitionChildMapping.mergeChildMappings(
        prevChildMapping,
        nextChildMapping
      )
    });

    var key;

    for (key in nextChildMapping) {
      var hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && !hasPrev &&
        !this.currentlyTransitioningKeys[key]) {
        this.keysToEnter.push(key);
      }
    }

    for (key in prevChildMapping) {
      var hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext &&
        !this.currentlyTransitioningKeys[key]) {
        this.keysToLeave.push(key);
      }
    }

    // If we want to someday check for reordering, we could do it here.
  },

  componentWillMount () {
    this.currentlyTransitioningKeys = {};
    this.keysToEnter = [];
    this.keysToLeave = [];
  },

  componentDidUpdate() {
    var keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(this._performEnter);

    var keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(this._performLeave);
  },
}

var adapterGlue = {
  _wrapChild (child) {
    if ('string' !== typeof child) child.props._owner = this;
    return child;
  },

  _performEnter(key) {
    this.currentlyTransitioningKeys[key] = true;

    var component = this.refs[key];

    if (component.componentWillEnter) {
      component.componentWillEnter(
        this._handleDoneEntering.bind(this, key)
      );
    } else {
      this._handleDoneEntering(key);
    }
  },

  _handleDoneEntering(key) {
    var component = this.refs[key];
    if (component.componentDidEnter) {
      component.componentDidEnter();
    }

    delete this.currentlyTransitioningKeys[key];

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(
      this.props.children
    );

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully entered. Remove it.
      this._performLeave(key);
    }
  },

  _performLeave(key) {
    this.currentlyTransitioningKeys[key] = true;

    var component = this.refs[key];
    if (component.componentWillLeave) {
      component.componentWillLeave(this._handleDoneLeaving.bind(this, key));
    } else {
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      this._handleDoneLeaving(key);
    }
  },

  _handleDoneLeaving(key) {
    var component = this.refs[key];

    if (component.componentDidLeave) {
      component.componentDidLeave();
    }

    delete this.currentlyTransitioningKeys[key];

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(
      this.props.children
    );

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      this._performEnter(key);
    } else {
      var newChildren = Object.assign({}, this._children);
      delete newChildren[key];
      this.setState({
        children: newChildren
      });
    }
  },
}


// BUG
// `export default var` doesn't work
var DOMAdapterMixin = assign({}, base, adapterGlue)
export default DOMAdapterMixin
