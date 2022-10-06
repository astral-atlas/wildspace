// @flow strict

import { h, useEffect, useRef, useState, useContext } from "@lukekaalim/act";
import { calculateCubicBezierAnimationPoint, useAnimatedNumber } from "@lukekaalim/act-curve";
import { MiniTheaterScene2 } from "../../miniTheater/MiniTheaterScene2";
import { RenderCanvas, renderCanvasContext, useSimulateLoop } from "../../three";
import { FreeCamera } from "../../camera/FreeCamera";
import { Quaternion, Vector3 } from "three";
import styles from './miniTheater.module.css';
import { MiniTheaterCamera } from "../../camera/MiniTheaterCamera";
import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";
import { perspectiveCamera } from "@lukekaalim/act-three";
import { getBasicTransformationPoint, interpolateBasicTransformAnimation } from "../../animation";
import { createInitialBasicTransformAnimation } from "../../animation/transform";
import { v4 } from "uuid";

/*::
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../../miniTheater/useMiniTheaterController2";
import type { MiniTheaterRenderResources } from "../../miniTheater/useMiniTheaterResources";
import type { MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { SceneContentMiniTheaterCameraMode } from "../SceneRenderer2";
import type {
  BasicTransform,
  BasicTransformAnimation,
} from "../../animation/transform";
*/

/*::
export type SceneMiniTheaterRendererProps = {
  state: MiniTheaterLocalState,
  controller: ?MiniTheaterController2,
  cameraMode: SceneContentMiniTheaterCameraMode
}
*/

export const SceneMiniTheaterRenderer/*: Component<SceneMiniTheaterRendererProps>*/ = ({
  state,
  controller,
  cameraMode,
}) => {
  const act = (action) => {
    if (!controller)
      return;
    controller.act(action);
  }

  const onOverFloor = (point) => {
    const roundedPoint = point.clone()
      .multiplyScalar(1/10)
      .round()
      .multiplyScalar(10);
    act({ type: 'move-cursor', cursor: {
      x: roundedPoint.x / 10,
      y: roundedPoint.z / 10,
      z: roundedPoint.y / 10
    } })
  };
  const onExitFloor = () => {
    act({ type: 'move-cursor', cursor: null })
  }
  const canvasProps = controller && {
    onContextMenu(e) {
      e.preventDefault();
      const { cursor, selection, layer, tool } = state;
      if (!cursor)
        return;
      switch (selection.type) {
        case 'terrain-prop':
          if (tool.type !== 'place')
            return;
          const { terrainId } = selection;
          act({
            type: 'remote-action', remoteAction: {
              type: 'set-terrain',
              terrain: state.miniTheater.terrain.map(t => t.id === terrainId
                ? { ...t, position: { x: cursor.x * 10, y: cursor.z * 10, z: cursor.y * 10 } }
                : t)
            }
          })
          return;
        case 'piece':
          act({
            type: 'remote-action',
            remoteAction: { type: 'move-piece', movedPiece: selection.pieceId, position: cursor }
          })
          return;
        case 'placement':
          if (!layer)
            return;
          switch (selection.placement.type) {
            case 'piece':
              act({ type: 'remote-action', remoteAction: {
                type: 'place-piece',
                position: cursor,
                layer,
                pieceRepresents: selection.placement.represents,
              } })
              return;
            case 'terrain':
              const terrainPropId = selection.placement.terrain;
              act({
                type: 'remote-action', remoteAction: {
                  type: 'set-terrain',
                  terrain: [
                    ...state.miniTheater.terrain,
                    {
                      terrainPropId,
                      id: v4(),
                      layer,
                      position: { x: cursor.x * 10, y: cursor.z * 10, z: cursor.y * 10 },
                      quaternion: { x: 0, y: 0, z: 0, w: 1 },
                    }
                  ]
                }
              })
              return;
            default:
              return;
          }
      }
    },
    onClick() {
      const { cursor, terrainCursor, miniTheater, selection } = state;
      const selectedPiece = cursor && miniTheater
        .pieces
        .find(p => isBoardPositionEqual(p.position, cursor) && p.layer === state.layer);
      const selectedTerrain = terrainCursor && miniTheater
        .terrain
        .find(t => t.id === terrainCursor) || null;

      if (selectedPiece) {
        act({ type: 'select', selection: { type: 'piece', pieceId: selectedPiece.id } })
      }
      else if (selectedTerrain) {
        act({ type: 'select', selection: { type: 'terrain-prop', terrainId: selectedTerrain.id } })
      }
      else {
        if (selection.type === 'terrain-prop')
          return;
        act({ type: 'select', selection: { type: 'none' } });
      }
    }
  } || {};
 
  return h(RenderCanvas, { className: styles.miniTheater, canvasProps }, [
    h(MiniTheaterScene2, { miniTheaterState: state, onOverFloor, onExitFloor, controller }),
    h(SceneMiniTheaterCamera, { cameraMode }),
  ]);
}

const SceneMiniTheaterCamera = ({ cameraMode }) => {
  const render = useContext(renderCanvasContext)
  if (!render)
    return null;

  const influence = cameraMode.type === 'fixed' ? 1 : 0;
  const [influenceAnim] = useAnimatedNumber(influence, influence, { duration: 1000, impulse: 3 });

  const [fixedPositionAnim, setFixedPositionAnim] = useState/*:: <?BasicTransformAnimation>*/(null)
  useEffect(() => {
    if (cameraMode.type !== 'fixed')
      return;
    const transform = {
      position: cameraMode.position,
      rotation: cameraMode.quaternion,
    }
    setFixedPositionAnim(prev => {
      if (!prev)
        return createInitialBasicTransformAnimation(transform);

      return interpolateBasicTransformAnimation(prev, transform, performance.now(), 1000)
    })
  }, [cameraMode])

  useSimulateLoop(render.loop, () => {
    const { current: mainCam } = render.cameraRef;
    const { current: miniCam } = miniTheaterCamRef;
    if (!mainCam || !miniCam)
      return;

    return (c, v) => {
      const influencePoint = calculateCubicBezierAnimationPoint(influenceAnim, v.now)
      const fixedCameraPoint = fixedPositionAnim ? getBasicTransformationPoint(fixedPositionAnim, v.now) : { position: new Vector3(), rotation: new Quaternion() };

      mainCam.position.lerpVectors(miniCam.position, fixedCameraPoint.position, influencePoint.position);
      mainCam.quaternion.slerpQuaternions(miniCam.quaternion, fixedCameraPoint.rotation, influencePoint.position);
    };
  }, [cameraMode, influenceAnim, fixedPositionAnim])

  const miniTheaterCamRef = useRef()

  return [
    h(perspectiveCamera, { ref: render.cameraRef }),
    h(MiniTheaterCamera, { ref: miniTheaterCamRef })
  ]
}