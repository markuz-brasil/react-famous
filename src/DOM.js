'use strict';
import * as React from 'react/addons'
// TODO: fix this file

import {Mixin} from './mixin'

export var DOM = {};
Object.keys(React.DOM).forEach(function(type){
  var Type = type.charAt(0).toUpperCase() + type.slice(1)
  var wrap = createWrapper(type)

  DOM[Type] = DOM[type] || React.createClass({
    render () { return wrap(this.props) },
  })
});

function createWrapper(type){
  return React.createFactory(React.createClass({
    displayName: 'famous-'+type+'-tag',
    mixins: [Mixin],
    getDefaultProps: function(){
      return {
        component: React.DOM[type]
      };
    }
  }));
}

// to override react dom with our dom
// uncomment this and export DOM
// DOM.injection.injectComponentClasses(DOM);
