// @flow strict

import { h, useContext, useEffect } from "@lukekaalim/act"
import { perspectiveCamera } from "@lukekaalim/act-three"
import { renderCanvasContext } from "../three";
import { createMiniTheaterCameraController } from "../miniTheater/useMiniTheaterCamera";
import { calculateKeyVelocity, getVector2ForKeyboardState } from "../keyboard";


/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { PerspectiveCamera } from "three";
export type MiniTheaterCameraProps = {
  ref?: ?Ref<?PerspectiveCamera>
}
*/

const getDeltaMultiplier = (event) => {
  switch (event.deltaMode) {
    default:
    case WheelEvent.DOM_DELTA_PIXEL:
      return 1;
    case WheelEvent.DOM_DELTA_PAGE:
      return 0.01;
    case WheelEvent.DOM_DELTA_LINE:
      return 1;
  }
}

export const MiniTheaterCamera/*: Component<MiniTheaterCameraProps>*/ = ({
  ref = null,
}) => {
  const render = useContext(renderCanvasContext);
  if (!render)
    return null;

  useEffect(() => {
    const { cameraRef, loop, keyboard, canvasRef } = render;
    const { current: camera } = ref || cameraRef;
    const { current: canvas } = canvasRef;
    if (!camera || !canvas)
      return;
    const controller = createMiniTheaterCameraController();
    const stopInput = loop.subscribeInput((c, v) => {
      const { prev, next } = keyboard.readDiff();
      const acceleration = getVector2ForKeyboardState(next.value);
      const kv = calculateKeyVelocity(prev.value, next.value)
      if (kv.get('KeyQ') === 1)
        controller.rotate(v.now, -1/8);
      if (kv.get('KeyE') === 1)
        controller.rotate(v.now, 1/8);
      controller.setAcceleration(v.now, acceleration);
    });
    const stopSim = loop.subscribeSimulate((c, v) => {
      controller.simulateCamera(v.delta);
      const t = controller.getControllerTransform(v.now)
      camera.position.copy(t.position);
      camera.quaternion.copy(t.rotation);
    });
    const onMouseWheel = (event/*: WheelEvent*/) => {
      event.preventDefault();
      const deltaMultiplier = getDeltaMultiplier(event);
      controller.moveZoom(event.deltaY * deltaMultiplier)
    };
    canvas.addEventListener('wheel', onMouseWheel)

    return () => {
      stopInput();
      stopSim();
      canvas.removeEventListener('wheel', onMouseWheel)
    }
  }, [render, ref])

  return h(perspectiveCamera, { ref: ref || render.cameraRef })
}