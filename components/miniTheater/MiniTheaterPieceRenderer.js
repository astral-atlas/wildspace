// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type {
  Vector3D, BoxBoardArea, Piece,
  BoardPosition,
  Character,
  MonsterActorMask,
  AssetID,
} from "@astral-atlas/wildspace-models";

import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
*/

import { SpriteMaterial, TextureLoader, Vector2, Vector3 } from "three";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";

import { maxSpan, useTimeSpan, useAnimatedNumber, calculateSpanProgress } from "@lukekaalim/act-curve";
import { sprite, useDisposable } from "@lukekaalim/act-three";

import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";

import { calculateBezier2DPoint, useAnimatedVector2 } from "../animation/2d";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";
import { useAnimatedVector3 } from "../animation";
import { MiniTheaterSprite } from "./MiniTheaterSprite";

/*::
export type MiniTheaterPieceRendererProps = {
  controller: MiniTheaterController,

  characters: $ReadOnlyArray<Character>,
  monsters: $ReadOnlyArray<MonsterActorMask>,
  assets: AssetDownloadURLMap,

  piece: Piece,
};
*/

export const getPieceAssetId = (
  represents/*: Piece["represents"]*/,
  characters/*: $ReadOnlyArray<Character>*/,
  monsters/*: $ReadOnlyArray<MonsterActorMask>*/
)/*: ?AssetID*/ => {
  switch (represents.type) {
    case 'character':
      const character = characters.find(c => c.id == represents.characterId)
      if (!character)
        return null;
      return character.initiativeIconAssetId;
    case 'monster':
      const monster = monsters.find(m => m.id === represents.monsterActorId);
      if (!monster)
        return null;
      return monster.initiativeIconAssetId;
    default:
      return null;
  }
}

const usePieceTexture = (piece, characters, monsters, assets) => {
  const material = useDisposable(() => {
    return new SpriteMaterial()
  }, [])
  const assetId = getPieceAssetId(piece.represents, characters, monsters)
  useEffect(() => {
    const info = !!assetId && assets.get(assetId);
    if (!info)
      return;
    
    const texture = new TextureLoader().load(info.downloadURL);
    material.map = texture;

    return () => {
      texture.dispose();
    }
  }, [assetId]);
  return material;
}

export const MiniTheaterPieceRenderer/*: Component<MiniTheaterPieceRendererProps>*/ = ({
  controller,
  assets,
  characters,
  monsters,

  piece,
}) => {
  const material = usePieceTexture(piece, characters, monsters, assets)


  const [selected, setSelected] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const unsubscribeSelection = controller.subscribeSelection((selection) => {
      setSelected(!!selection && selection.pieceRef === piece.id)
    })
    const unsubscribeCursor = controller.subscribeCursor((cursor) => {
      setHover(!!cursor && isBoardPositionEqual(cursor.position, piece.position))
    })
    return () => {
      unsubscribeSelection();
      unsubscribeCursor();
    }
  }, [piece, controller])

  return h(MiniTheaterSprite, { position: piece.position, hover, selected, material })
};