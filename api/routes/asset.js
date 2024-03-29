// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { Services } from "../services.js"; */

import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { 
  createJSONResourceRoutes, createResourceRoutes,
  readBufferBody, getRequestRange,
  getRangeResponseHead, readStreamBytes
} from "@lukekaalim/http-server";
import { defaultOptions } from './meta.js';

import { assetAPI } from '@astral-atlas/wildspace-models'; 

export const createAssetRoutes = ({ data, asset }/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const assetResourceRoutes = createJSONResourceRoutes(assetAPI['/asset'], {
    ...defaultOptions,
    GET: async ({ query: { assetId } }) => {
      const peekResponse = await asset.peek(assetId);
      if (!peekResponse)
        return { status: HTTP_STATUS.not_found, body: { type: 'not_found' }, headers: {} };
      const { downloadURL, description } = peekResponse;
      return { status: HTTP_STATUS.ok, body: { type: 'found', description, downloadURL } };
    },
    POST: async ({ body: { MIMEType, bytes, name } }) => {
      const { downloadURL, description, uploadURL } = await asset.put(MIMEType, bytes, name);
      return { status: HTTP_STATUS.created, body: { type: 'created', uploadURL, downloadURL, description }};
    }
  });
  const assetDataResoureRoutes = createResourceRoutes({
    path: '/assets/data',
    ...defaultOptions,

    methods: {
      GET: async ({ query, headers }) => {
        const assetId = query.get('assetId');
        const range = getRequestRange(headers);
        if (!assetId)
          return { status: HTTP_STATUS.not_found, body: null, headers: {} };
        const { stream, length } = await asset.getAssetDataStream(assetId);
        const buffer = await readStreamBytes(stream, length);
        const { result: description } = await data.assets.get(assetId);
        if (!buffer || !description)
          return { status: HTTP_STATUS.not_found, body: null, headers: {} };

        const contentHeaders = {
          'content-type': description.MIMEType,
          'cache-control': 'public, max-age=604800, immutable',
          'vary': 'Origin',
        };
        const { status: rangeStatus, headers: rangeHeaders, slice } = getRangeResponseHead(range, description.bytes);

        const responseHeaders = {
          ...rangeHeaders,
          ...contentHeaders,
        }
        const responseBody = slice ? buffer.slice(slice.start, slice.end) : buffer;
        
        return { status: rangeStatus || HTTP_STATUS.ok, headers: responseHeaders, body: responseBody };
      },
      PUT: async ({ query, incoming, headers }) => {
        const assetId = query.get('assetId');
        if (!assetId)
          return { status: HTTP_STATUS.not_found, body: null, headers: {} };
        
        const buffer = await readBufferBody(incoming, headers);
        await data.assetData.set(assetId, buffer);
        return { status: HTTP_STATUS.ok, headers: {}, body: null };
      }
    }
  })

  const ws = [
  ];
  const http = [
    ...assetResourceRoutes,
    ...assetDataResoureRoutes,
  ];

  return { ws, http };
};