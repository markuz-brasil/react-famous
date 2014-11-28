'use strict';
import * as assign from 'object-assign'

import * as React from 'react/addons'
import * as PropTypes from 'react/lib/ReactPropTypes'
import * as CSSPropertyOperations from 'react/lib/CSSPropertyOperations'

import * as Engine from 'famous/core/Engine'
import * as Transform from 'famous/core/Transform'

import DOMAdapterMixin from './dom-adapter-mixin'

import getStyleUpdates from './util/getStyleUpdates'
import cloneStyle from './util/cloneStyle'
import createFamous from './util/createFamous'
import applyPropsToModifer from './util/applyPropsToModifer'
import propSugar from './util/propSugar'

var defaultState = {
  transform: Transform.identity,
  opacity: 1,
  origin: [0, 0],
  size: [0, 0],
  align: null
};

// TODO: vendor prefixing
// TODO: only apply if there is children?
var initialStyle = {
  backfaceVisibility: 'hidden',
  transformStyle: 'flat'
};

var base = {
  mixins: [DOMAdapterMixin],

  propTypes: {
    center: PropTypes.bool,
    x: PropTypes.number,
    y: PropTypes.number,

    opacity: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object
    ]),
    transform: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.object
    ]),
    origin: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.object
    ]),
    align: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.object
    ]),
  },

  getDefaultProps () {
    return {
      style: initialStyle
    };
  },

  componentWillMount () {
    this._createFamous();
    this.componentWillReceiveProps(this.props);
    this._tick();
  },

  componentDidMount () {
    this._tick();
    // add our tick to the event loop
    Engine.on('prerender', this._tick);
  },

  componentWillEnter (cb) {
    // TODO: run unmounted -> mounted sequence
    cb();
  },

  componentDidEnter () {},

  componentWillLeave (cb) {
    // TODO: run mounted -> unmounted sequence
    cb();
  },

  componentDidLeave () {
  },

  componentWillUnmount () {
    // remove our tick from the event loop
    Engine.removeListener('prerender', this._tick);
  },

  componentWillReceiveProps (nextProps) {
    // TODO: switch this all out with a sequence

    // some props sugar
    nextProps = propSugar(nextProps);

    // apply our props to the modifier
    applyPropsToModifer(nextProps, this.famous.modifier);
  },
}

var mixinGlue = {
  _createFamous () {
    this.famous = createFamous();
    this.famous.isRoot = !this.props._owner;

    // register with parent famous RenderNode for spec
    if (!this.famous.isRoot) {
      this.props._owner.famous.node.add(this.famous.node);
    }
  },

  _tick () {
    // updates the spec of this node
    // and all child nodes
    if (this.famous.isRoot) {
      this.famous.node.commit(defaultState);
    }

    if (!this.isMounted()) {
      return;
    }

    // diff our faked element with the last run
    // so we only update when stuff changes
    var lastStyle = this.famous.element.lastStyle;
    var nextStyle = this.famous.element.style;

    var styleUpdates = getStyleUpdates(lastStyle, nextStyle);
    if (styleUpdates) {
      CSSPropertyOperations.setValueForStyles(this.getDOMNode(), styleUpdates);
      this.famous.element.lastStyle = cloneStyle(nextStyle);
    }
  },
}

export var Mixin = assign({}, mixinGlue, base);



