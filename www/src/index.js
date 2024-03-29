// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { WWWConfig } from "@astral-atlas/wildspace-models"; */
import { useRootNavigation, navigationContext } from '@lukekaalim/act-navigation';
import { Boundary, h, useState, useEffect } from "@lukekaalim/act";
import './index.module.css';

import { HomePage } from "./home";
import { RoomPage } from './room';

import { identityContext, IdentityProvider, useIdentity } from '../hooks/identity';
import { loadConfigFromURL } from '../config';
import { useAsync } from '@astral-atlas/wildspace-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';
import { useStoredValue } from '../hooks/storage';
import { identityStore } from '../lib/storage';
import { apiContext } from '../hooks/api';
import { configContext } from '../hooks/config';
import { MagicItemPage } from './magicItem';
import { PrepPage } from "./prep";

const Page = ({ nav }) => {
  switch (nav.location.pathname) {
    default:
    case '/':
      return h(HomePage, { nav })
    case '/magic-item':
      return h(MagicItemPage, { nav })
    case '/room':
      return h(RoomPage)
    case '/prep':
      return h(PrepPage)
  }
}


export const Wildspace/*: Component<{}>*/ = () => {
  const nav = useRootNavigation(document.location.href, window.history);
  const [config] = useAsync(async () => await loadConfigFromURL(), []);
  const [identity, setIdentity] = useStoredValue(identityStore);

  if (!config)
    return 'Loading';

  const api = createWildspaceClient(identity && identity.proof, config.api.wildspace.httpOrigin, config.api.wildspace.wsOrigin);

  return [
    h(configContext.Provider, { value: config },
      h(identityContext.Provider, { value: { identity, setIdentity, messenger: null } },
        h(navigationContext.Provider, { value: nav },
          h(apiContext.Provider, { value: api },
            h(Page, { nav })))))
  ];
};