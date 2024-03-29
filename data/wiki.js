// @flow strict
/*::
import type {
  GameID,

  WikiDocID, WikiDoc, WikiDocUpdate, WikiDocFocus, WikiDocEvent,

  GameConnectionID, GameConnectionState,
  WikiDocConnection, WikiDocFocusAction,
} from '@astral-atlas/wildspace-models';
import type { Table, CompositeTable } from './sources/table.js';
import type { Channel } from './sources/channel.js';
import type { Transactable } from "./sources/table2";
*/

/*::
export type WikiData = {
  documents: {|
    ...CompositeTable<GameID, WikiDocID, WikiDoc>,
    ...Transactable<GameID, WikiDocID, WikiDoc>,
  |},
  documentEvents: Channel<WikiDocID, WikiDocEvent>,

  documentFocus: CompositeTable<WikiDocID, GameConnectionID, WikiDocFocus>,
  documentConnections: CompositeTable<WikiDocID, GameConnectionID, WikiDocConnection>,
};
*/
