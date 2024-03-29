// @flow strict

/*::
import type {
  SceneContent, GamePage,
  LibraryData,
  MagicItem,
  NonPlayerCharacter,
} from "@astral-atlas/wildspace-models";
import type {
  SceneContentBackgroundRenderData,
  SceneContentForegroundRenderData,
  SceneContentRenderData,
} from "../SceneRenderer2";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../../miniTheater/useMiniTheaterController2";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { KeyboardStateEmitter } from "../../keyboard/changes";
*/
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
} from "../../utils/miniVector";

export const getBackgroundRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
  assets/*: AssetDownloadURLMap*/,
  keys/*: ?KeyboardStateEmitter*/,
)/*: ?SceneContentBackgroundRenderData*/ => {
  switch (content.type) {
    case 'mini-theater':
      if (!miniTheaterState)
        return null;
      return {
        type: 'mini-theater',
        cameraMode: { type: 'interactive', bounds: null },
        controller,
        keys,
        state: miniTheaterState
      }

    case 'exposition':
      const { background } = content.exposition;
      switch (background.type) {
        case 'image':
          const imageAsset = assets.get(background.assetId);
          if (!imageAsset)
            return null;
          return { type: 'image', imageURL: imageAsset.downloadURL };
        case 'color':
          return { type: 'color', color: background.color }
        case 'mini-theater':
          if (!miniTheaterState)
            return null;
          const position = miniVectorToThreeVector(background.position);
          const quaternion = miniQuaternionToThreeQuaternion(background.rotation);
          return {
            type: 'mini-theater',
            cameraMode: { type: 'fixed', position, quaternion },
            controller: null,
            state: miniTheaterState,
            keys,
          }
        default:
          return null;
      }
    case 'none':
    default:
      return { type: 'color', color: 'white' }
  }
};

export const getForegroundRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
  keys/*: ?KeyboardStateEmitter*/,
  magicItems/*: $ReadOnlyArray<MagicItem>*/
)/*: ?SceneContentForegroundRenderData*/ => {
  switch (content.type) {
    case 'exposition':
      const { description, subject } = content.exposition;
      switch (subject.type) {
        default:
          return { type: 'simple-exposition', subject };
        case 'magic-item':
          const magicItem = magicItems.find(m => m.id === subject.magicItemId);
          if (!magicItem)
            return null;
          return { type: 'magic-item', magicItem }
      }
    case "mini-theater":
      if (!controller || !miniTheaterState)
        return null;
      return { type: 'mini-theater-controls', controller, state: miniTheaterState };
    default:
      return { type: 'none' };
  }
}

export const getContentRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
  assets/*: AssetDownloadURLMap*/,
  keys/*: ?KeyboardStateEmitter*/,
  gamePage/*: GamePage*/
)/*: ?SceneContentRenderData*/ => {

  const background = getBackgroundRenderData(content, miniTheaterState, controller, assets, keys);
  const foreground = getForegroundRenderData(content, miniTheaterState, controller, keys, gamePage.magicItems);
  if (!background || !foreground) 
    return null;

  return {
    background,
    foreground,
  }
};

export const getLibraryContentRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
  assets/*: AssetDownloadURLMap*/,
  keys/*: ?KeyboardStateEmitter*/,
  library/*: LibraryData*/
)/*: ?SceneContentRenderData*/ => {
  const background = getBackgroundRenderData(content, miniTheaterState, controller, assets, keys);
  const foreground = getForegroundRenderData(
    content,
    miniTheaterState,
    controller,
    keys, library.magicItems
  );
  if (!background || !foreground) 
    return null;

  return {
    background,
    foreground,
  }
};