// @flow strict

import { useState } from "@lukekaalim/act";
import { useConnection } from "./connect.js";

/*::
import type { GameID } from "@astral-atlas/wildspace-models";
import type { GameClient } from "@astral-atlas/wildspace-client2";

export type GameUpdateTimes = {
  tracks: number,
}
*/

export const useGameUpdateTimes = (
  gameClient/*: GameClient*/,
  gameId/*: GameID*/
)/*: GameUpdateTimes*/ => {
  const [updateTimes, setUpdateTimes] = useState/*:: <GameUpdateTimes>*/({
    tracks: 0,
  });
  useConnection(async () => gameClient.connectUpdates(gameId, update => {
    switch (update.type) {
      case 'tracks':
        return setUpdateTimes(t => ({ ...t, tracks: Date.now() }))
    }
  }).close)
  return updateTimes;
};