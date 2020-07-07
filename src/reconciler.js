import * as fc from 'd3fc';
import * as d3 from 'd3';
import React, { useRef, useEffect } from 'react';
import Reconciler from 'react-reconciler';
import omit from 'lodash-es/omit';

const roots = new Map();
const emptyObject = {};

// props
export const data = fc.randomGeometricBrownianMotion().steps(50)(1);

// This config is supposed to explain to React the target platform,
// What elements it has, how they update, how children are added/removed, etc.
const Renderer = Reconciler({
  supportsMutation: true,
  isPrimaryRenderer: false,
  now: () => Date.now(),
  // Turns a string-type into a real object
  createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
    // Here we create the actual d3fc object
    const instance = fc[type]();
    // Apply some properties
    applyProps(instance, props, {});
    // Then pass it back to React, it will keep it from now on
    return instance;
  },
  // Adding children
  appendInitialChild(parentInstance, child) {
    // Both parentInstance and child have already been through "createInstance"
    // React gives us back the original objects here. The ".add()" function comes from Threejs
    // if (child) parentInstance.add(child)
    console.log('appendInitialChild');
  },
  appendChild(parentInstance, child) {
    // if (child) parentInstance.add(child)
    console.log('appendChild');
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
  // Inserting children
  insertBefore(parentInstance, child, beforeChild) {
    // if (child) {
    //   // Threejs doesn't have inserts, so we dig into its internals a little ...
    //   child.parent = parentInstance
    //   child.dispatchEvent({ type: 'added' })
    //   const index = parentInstance.children.indexOf(beforeChild)
    //   parentInstance.children = [...parentInstance.children.slice(0, index), child, ...parentInstance.children.slice(index)]
    // }
    console.log('insertBefore');
  },
  // Removing children
  removeChild(parentInstance, child) {
    // if (child) parentInstance.remove(child)
    console.log('removeChild');
  },
  removeChildFromContainer(parentInstance, child) {
    // if (child) parentInstance.remove(child)
    console.log('removeChildFromContainer');
  },
  // Update children props
  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    // applyProps(instance, newProps, oldProps)
    console.log('commitUpdate');
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
  prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
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

// Works just like ReactDOM.render. "container" is a Threejs object.
export function render(element, container) {
  let root = roots.get(container);
  if (!root) roots.set(container, (root = Renderer.createContainer(container)));
  Renderer.updateContainer(element, root, null, undefined);
  return Renderer.getPublicRootInstance(root);
}

// Same as ReactDOM.unmountComponentAtNode
// export function unmountComponentAtNode(container) {
//   const root = roots.get(container)
//   if (root) Renderer.updateContainer(null, root, null, () => roots.delete(container))
// }

// The entry portal, every child of this component is a Threejs object
// It does not take dom nodes ...
export function Canvas({ children, style, ...props }) {
  const canvasRef = useRef();
  // const renderer = useRef()
  // const camera = useRef()
  // const active = useRef(true)
  // const [bind, measurements] = useMeasure()
  // const [scene] = useState(() => new THREE.Scene())

  useEffect(() => {
    //   // Setting up Threejs in here, renderloop, boilerplate and all ...
    //   renderer.current = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true })
    //   camera.current = new THREE.PerspectiveCamera(75, 0, 0.1, 1000)
    //   renderer.current.setSize(0, 0, false)
    //   camera.current.position.z = 5
    //   const renderLoop = function() {
    //     if (!active.current) return
    //     requestAnimationFrame(renderLoop)
    //     renderer.current.render(scene, camera.current)
    //   }

    // Kick off render-loop ...
    canvasRef.current.requestRedraw();
    //   requestAnimationFrame(renderLoop)

    //   return () => {
    //     active.current = false
    //     unmountComponentAtNode(scene)
    //   }
  }, []);

  useEffect(() => {
    // Renders our reconciler-root if children have changed
    render(children, canvasRef.current);
  }, [children]);

  // useEffect(() => {
  //   // Recalculate camera-matrix on size changes to the container
  //   renderer.current.setSize(measurements.width, measurements.height, false)
  //   const aspect = measurements.width / measurements.height
  //   camera.current.aspect = aspect
  //   camera.current.updateProjectionMatrix()
  //   camera.current.radius = (measurements.width + measurements.height) / 4
  // })

  return (
    // <div {...bind} {...props} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
    <d3fc-canvas ref={canvasRef} use-device-pixel-ratio></d3fc-canvas>
    // </div>
  );
}

// Measures something using ResizeObserver
// export function useMeasure() {
//   const ref = useRef()
//   const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
//   const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
//   useEffect(() => {
//     if (ref.current) ro.observe(ref.current)
//     return () => ro.disconnect()
//   }, [])
//   return [{ ref }, bounds]
// }

// This function takes old and new props, then updates the instance
function applyProps(instance, newProps, oldProps) {
  const sameProps = Object.keys(newProps).filter((key) => newProps[key] === oldProps[key]);
  const filteredProps = omit(newProps, [...sameProps, 'children', 'key', 'ref']);
  if (Object.keys(filteredProps).length > 0) {
    Object.entries(filteredProps).forEach(([key, value]) => {
      instance[key](value);
    });
  }
}
