let DEBUG = true;
const DEFAULTS = {
  'isBellEnabled': true,
  'timeSpaceOption': 2,
  'volume': 30,
  'numbOfBells': 3,
  'timer': 0 // this is the time remaining
};

export function debug(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

export async function getVar(query) {
  let keys = query || Object.keys(DEFAULTS);
  let vars = await chrome.storage.local.get(keys);
  for (const key of keys) {
    if (vars[key] === undefined) {
      vars[key] = DEFAULTS[key];
    }
  }

  //debug(`getVar ${query} -> ${JSON.stringify(vars)}`);
  return vars;
}

export async function setVar(obj) {
  await chrome.storage.local.set(obj);
}

export async function getTimeSpace() {
  const timeSpaces = [5, 10, 15, 20, 30, 45, 60];
  const { timeSpaceOption = DEFAULTS.timeSpaceOption } = await getVar(['timeSpaceOption']);
  return 60000 * timeSpaces[timeSpaceOption];
}

async function getNextTimer() {
  return Date.now() + await getTimeSpace();
}

export async function resetTimer() {
  await setVar({'timer': await getNextTimer()});
}

let creating; // A global promise to avoid concurrency issues
export async function ensureOffscreen() {
  //  Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path

  const hasOffscreenDocument = await (async () => {
    if ('getContexts' in chrome.runtime) {
      // chromium 116+
      const contexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });
      return Boolean(contexts.length);
    } else {
      const matchedClients = await clients.matchAll();
      return matchedClients.some(client => {
        return client.url.includes(chrome.runtime.id);
      });
    }
  })();

  if (hasOffscreenDocument) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: '../views/offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'for playing sound',
    });
    await creating;
    creating = null;
  }
}
