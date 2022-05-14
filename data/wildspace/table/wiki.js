// @flow strict
/*::
import type { TableDataConstructors } from './index.js';
import type { WikiData } from '../../wiki.js';
*/
import { castWikiDoc, castWikiDocConnection, castWikiDocEvent, castWikiDocFocus } from "@astral-atlas/wildspace-models";

export const createTableWikiData = (constructors/*: TableDataConstructors*/)/*: WikiData*/ => {
  const documents = {
    ...constructors.createCompositeTable('wiki_documents', castWikiDoc),
    ...constructors.createTransactable('wiki_documents', castWikiDoc,
      doc => ({ key: 'version', value: doc.version }))
  };
  const documentEvents = constructors.createChannel('wiki_document_events', castWikiDocEvent);
  
  const documentFocus = constructors.createCompositeTable('wiki_focus', castWikiDocFocus)
  const documentConnections = constructors.createCompositeTable('wiki_connections', castWikiDocConnection)

  return {
    documents,
    documentEvents,
    documentConnections,
    documentFocus,
  };
}