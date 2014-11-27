'use strict';
import * as RenderNode from 'famous/core/RenderNode'
import * as ElementOutput from 'famous/core/ElementOutput'
import * as StateModifier from 'famous/modifiers/StateModifier'

export default function createFamous(){
  var el = {
    style: {},
    lastStyle: null
  };
  var mod = new StateModifier();
  var elementOutput = new ElementOutput(el);
  var node = new RenderNode(mod);
  node.add(elementOutput);

  return {
    element: el,
    modifier: mod,
    node: node
  };
}

