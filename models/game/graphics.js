// @flow strict

import { c } from "@lukekaalim/cast";
import { castAssetID } from "../asset";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { AssetID } from "../asset.js";

export type ImageGraphicID = string;
export type ImageGraphic = {
  id: ImageGraphicID,
  title: string,
  imageAssetId: AssetID,
};
export type SolidColorGraphicID = string;
export type SolidColorGraphic = {
  id: SolidColorGraphicID,
  title: string,
  color: string,
}

export type Graphic2DRef =
  | { type: 'image', id: ImageGraphicID }
  | { type: 'color-solid', id: SolidColorGraphicID }
*/

export const castImageGraphicId/*: Cast<ImageGraphicID>*/ = c.str;
export const castImageGraphic/*: Cast<ImageGraphic>*/ = c.obj({
  id: castImageGraphicId,
  title: c.str,
  imageAssetId: castAssetID,
})

export const castSolidColorGraphicId/*: Cast<SolidColorGraphicID>*/ = c.str;
export const castSolidColorGraphic/*: Cast<SolidColorGraphic>*/ = c.obj({
  id: castSolidColorGraphicId,
  title: c.str,
  color: c.str,
})

export const castGraphic2DRef/*: Cast<Graphic2DRef>*/ = c.or('type', {
  'color-solid': c.obj({ type: c.lit('color-solid'), id: castSolidColorGraphicId }),
  'image': c.obj({ type: c.lit('image'), id: castImageGraphicId }),
})