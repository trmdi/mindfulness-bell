import { getVar, setVar, resetTimer, debug, ensureOffscreen } from './utils.js';

const notificationId = 'MindfulnessBell';
function sendNotification() {
  const getMsg = chrome.i18n.getMessage;
  chrome.notifications.clear(notificationId);
  chrome.notifications.create(notificationId, {
    'type': 'basic',
    'iconUrl': '../icons/icon.png',
    'title': getMsg('BellNotificationTitle'),
    'message': getMsg('BellNotificationMsgIn') + '\n' + getMsg('BellNotificationMsgOut'),
    'silent': true
  });
}

async function inviteBell() {
  if (!(await getVar(['isBellEnabled'])).isBellEnabled) return;

  await ensureOffscreen();
  chrome.runtime.sendMessage({'target': 'offscreen', 'inviteBell': true});
}

async function setBellEnabled(enabled) {
  if (enabled === (await getVar(['isBellEnabled'])).isBellEnabled) {
    return;
  }

  setVar({'isBellEnabled': enabled});

  const alarm = await chrome.alarms.get('inviteBell');
  if (enabled) {
    if (!alarm) {
      chrome.alarms.create('inviteBell', {
        'delayInMinutes': 0,
        'periodInMinutes': 1
      });
      debug('create alarm');
    }
    chrome.action.setIcon({'path': '../icons/icon48.png'});
  } else {
    chrome.runtime.sendMessage({'target': 'offscreen', 'stopBell': true});
    chrome.notifications.clear(notificationId);
    if (alarm) {
      chrome.alarms.clear('inviteBell', (wasCleared) => debug(`alarm cleared ${wasCleared}`));
    }
    chrome.action.setIcon({'path': '../icons/icon48-grayscale.png'});
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== '*' && message.target !== 'background') return;

  if (message.inviteBell) {
    inviteBell();
  } else if (message.hasOwnProperty('getVar')) {
    (async () => {
      sendResponse(await getVar(message.getVar));
    })();
    return true;
  } else if (message.ringing !== undefined) {
    if (!message.ringing) {
      resetTimer();
    }
  } else if (message.sendNotification) {
    sendNotification();
  } else if (message.hasOwnProperty('setBellEnabled')) {
    setBellEnabled(message.setBellEnabled);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  (async () => {
    const { timer } = await getVar(['timer']);
    if (Date.now() >= timer) {
      inviteBell();
    }
  })();
});

chrome.runtime.onStartup.addListener(async () => {
  const { isBellEnabled } = await getVar(['isBellEnabled']);
  if (isBellEnabled) {
    chrome.action.setIcon({'path': '../icons/icon48.png'});
  } else {
    chrome.action.setIcon({'path': '../icons/icon48-grayscale.png'});
  }
})
