import * as fc from 'd3fc';
import * as d3 from 'd3';
import React, { useRef, useEffect } from 'react';
import Reconciler from 'react-reconciler';
import omit from 'lodash-es/omit';

const roots = new Map();
const emptyObject = {};

// TODO: Handle data better
let data;

const Renderer = Reconciler({
  supportsMutation: true,
  isPrimaryRenderer: false,
  now: () => Date.now(),
  createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    const instance = fc[type]();

    applyProps(instance, props, {});

    return instance;
  },
  appendInitialChild(parentInstance, child) {
    // TODO
  },
  appendChild(parentInstance, child) {
    // TODO
  },
  appendChildToContainer(parentInstance, child) {
    if (child) {
      d3.select(parentInstance)
        .on('draw', () => {
          child(data);
        })
        .on('measure', () => {
          const { width, height } = d3.event.detail;
          child.xScale().range([0, width]);
          child.yScale().range([height, 0]);

          const ctx = parentInstance.querySelector('canvas').getContext('2d');
          child.context(ctx);
        });
    }
  },
  insertBefore(parentInstance, child, beforeChild) {
    // TODO
  },
  removeChild(parentInstance, child) {
    // TODO
  },
  removeChildFromContainer(parentInstance, child) {
    // TODO
  },
  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    // TODO
  },
  // The rest are just stubs ...
  getPublicInstance(instance) {
    return instance;
  },
  getRootHostContext(rootContainerInstance) {
    return emptyObject;
  },
  getChildHostContext(parentHostContext, type) {
    return emptyObject;
  },
  createTextInstance() {},
  finalizeInitialChildren(instance, type, props, rootContainerInstance) {
    return false;
  },
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    hostContext
  ) {
    return emptyObject;
  },
  shouldDeprioritizeSubtree(type, props) {
    return false;
  },
  prepareForCommit() {},
  resetAfterCommit() {},
  shouldSetTextContent(props) {
    return false;
  },
  schedulePassiveEffects(callback) {
    callback();
  },
  cancelPassiveEffects(callback) {}
});

export function render(element, container) {
  let root = roots.get(container);
  if (!root) roots.set(container, (root = Renderer.createContainer(container)));
  Renderer.updateContainer(element, root, null, undefined);
  return Renderer.getPublicRootInstance(root);
}

export function Canvas({ children, style, ...props }) {
  const canvasRef = useRef();

  useEffect(() => {
    // Kick off render-loop ...
    canvasRef.current.requestRedraw();
  }, []);

  useEffect(() => {
    render(children, canvasRef.current);
  }, [children]);

  return <d3fc-canvas ref={canvasRef} use-device-pixel-ratio></d3fc-canvas>;
}

function applyProps(instance, newProps, oldProps) {
  const sameProps = Object.keys(newProps).filter(
    (key) => newProps[key] === oldProps[key]
  );
  const filteredProps = omit(newProps, [
    ...sameProps,
    'data',
    'children',
    'key',
    'ref'
  ]);
  if (Object.keys(filteredProps).length > 0) {
    Object.entries(filteredProps).forEach(([key, value]) => {
      instance[key](value);
    });
  }
  data = newProps.data;
}
