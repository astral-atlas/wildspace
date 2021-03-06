// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, Route } from '@lukekaalim/server'; */
const { v4: uuid } = require('uuid');

const { resource, json: { ok, created } } = require('@lukekaalim/server');
const { toPlayerParams } = require('@astral-atlas/wildspace-models');
const { withErrorHandling } = require('./utils');
const e = require('../errors');

const playerRoutes = (services/*: Services*/)/*: Route[]*/  => {
  const read = async ({ query: { playerId }}) => {
    if (!playerId)
      throw new e.MissingParameterError('playerId');

    const player = await services.players.read(playerId);
    return ok(player);
  };
  const update = async ({ query: { playerId }, validateJSON, auth }) => {
    if (!playerId)
      throw new e.MissingParameterError('playerId');

    const user = await services.auth.getUser(auth);
    const params = await validateJSON(toPlayerParams);

    const newPlayer = await services.players.update(playerId, params, user);
    return ok(newPlayer);
  };
  const destroy = async ({ query: { playerId }, auth}) => {
    if (!playerId)
      throw new e.MissingParameterError('playerId');
    const user = await services.auth.getUser(auth);
    const destroyedPlayer = await services.players.destroy(playerId, user);
    return ok(destroyedPlayer);
  };
  return resource('/players', {
    get: withErrorHandling(read),
    put: withErrorHandling(update),
  });
};

module.exports = {
  playerRoutes,
};
