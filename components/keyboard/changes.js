// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { KeyboardState } from "./state";

export type KeyboardStateEmitter = {
  subscribe: ((keys: KeyboardState, event: KeyboardEvent) => mixed) => (() => void)
}
*/

import { useEffect, useMemo, useState } from "@lukekaalim/act";

export const isKeyboardStateEqual = (a/*: KeyboardState*/, b/*: KeyboardState*/)/*: boolean*/ => {
  if (a.size !== b.size)
    return false;
  for (const key of a)
    if (!b.has(key))
      return false;
  return true;
}

const whitelist = new Set([
  'ShiftLeft',
  'ShiftRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export const useElementKeyboard = /*:: <T: Element>*/(
  elementRef/*: Ref<?T>*/,
  initKeys/*: string[]*/ = [],
  deps/*: mixed[]*/ = [],
)/*: KeyboardStateEmitter*/ => {

  const [subscribers] = useState(new Set());

  useEffect(() => {
    const { current: element } = elementRef;
    if (!element)
      return;

    const currentKeys = new Set(initKeys);

    const onKeyDown = (event/*: KeyboardEvent*/) => {
      if (event.code === 'CapsLock')
        return;

      if (!whitelist.has(event.code))
        return;
      if (event.repeat)
        return;
      
      currentKeys.add(event.code);
      const keys = new Set(currentKeys);
      
      for (const subscriber of subscribers)
        subscriber(keys, event);
    }
    const onKeyUp = (event/*: KeyboardEvent*/) => {
      if (!whitelist.has(event.code))
        return;

      event.preventDefault();

      currentKeys.delete(event.code);
      const keys = new Set(currentKeys);

      for (const subscriber of subscribers)
        subscriber(keys, event);
    };
  
    element.addEventListener('keydown', onKeyDown);
    element.addEventListener('keyup', onKeyUp);
    return () => {
      element.removeEventListener('keydown', onKeyDown);
      element.removeEventListener('keyup', onKeyUp);
    };
  }, deps);

  const subscribe = (subscriber) => {
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    }
  }
  const emitter = useMemo(() => ({
    subscribe
  }), [])
  
  return emitter;
};
