// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { LoopController, RenderLoopConstants } from "./useLoopController";
import type { PerspectiveCamera, Scene } from "three";

import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { KeyboardTrack } from "../keyboard/track";
*/
import { useEffect, useRef } from "@lukekaalim/act";
import { useDisposable, useWebGLRenderer } from "@lukekaalim/act-three";
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

import { WebGLRenderer, sRGBEncoding } from "three";
import { useLoopController } from "./useLoopController";
import { useElementKeyboard, useKeyboardTrack } from "../keyboard";

/*::
export type RenderSetup = {
  canvasRef: Ref<?HTMLCanvasElement>,
  cameraRef: Ref<?PerspectiveCamera>,
  rootRef: Ref<?HTMLElement>,
  sceneRef: Ref<?Scene>,

  loop: LoopController,
  keyboard: KeyboardTrack
};
*/

export const useRenderSetup = (
  overrides/*: {
    canvasRef?:  Ref<?HTMLCanvasElement>,
    cameraRef?: Ref<?PerspectiveCamera>,
    rootRef?: Ref<?HTMLElement>,
    keyboardEmitter?: KeyboardStateEmitter,
  }*/ = {},
  onRendererInit/*: RenderLoopConstants => mixed*/ = _ => {},
  deps/*: mixed[]*/ = []
)/*: RenderSetup*/ => {
  const localCanvasRef = useRef();
  const canvasRef = overrides.canvasRef || localCanvasRef;

  const localCameraRef = useRef();
  const cameraRef = overrides.cameraRef || localCameraRef;
  const sceneRef = useRef();

  const localRootRef = useRef();
  const rootRef = overrides.rootRef || localRootRef;

  const localEmitter = useElementKeyboard(canvasRef);
  const emitter = overrides.keyboardEmitter || localEmitter;

  const keyboard = useKeyboardTrack(emitter);

  const [runLoop, loop] = useLoopController();

  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: camera } = cameraRef;
    const { current: scene } = sceneRef;
    const { current: root } = rootRef;
    if (!canvas || !camera || !scene)
      return;

    const options = {
      canvas,
    }
    const renderer = new WebGLRenderer(options);
    const css2dRenderer = root && new CSS2DRenderer({ element: root });
    renderer.outputEncoding = sRGBEncoding;

    const rendererConstants = {
      css2dRenderer,
      renderer,
      canvas,
      camera,
      scene
    };
    let prevTime = performance.now();
    const onFrame = (now) => {
      const delta = now - prevTime;
      prevTime = now;
      const rendererVariables = {
        now,
        delta
      };
      runLoop(rendererConstants, rendererVariables);
      frameId = requestAnimationFrame(onFrame);
    };
    const onCanvasResize = (entries) => {
      const [entry] = entries;
      if (!entry)
        return;
      const [contentSize] = entry.contentBoxSize;
      renderer.setSize(contentSize.inlineSize, contentSize.blockSize, false);

      camera.aspect = contentSize.inlineSize / contentSize.blockSize;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(onCanvasResize);
    resizeObserver.observe(canvas);
    const cancelRenderSubscription = loop.subscribeRender((c, v) => {
      c.renderer.render(c.scene, c.camera);
      if (c.css2dRenderer)
        c.css2dRenderer.render(c.scene, c.camera);
    })
    let frameId = requestAnimationFrame(onFrame);

    onRendererInit(rendererConstants);

    return () => {
      renderer.dispose();
      resizeObserver.disconnect();
      cancelRenderSubscription();
      cancelAnimationFrame(frameId);
    }
  }, deps)

  return {
    canvasRef,
    cameraRef,
    sceneRef,
    keyboard,
    rootRef,

    loop,
  };
};

