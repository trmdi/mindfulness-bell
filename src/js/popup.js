import { debug, getVar, setVar, getTimeSpace, resetTimer } from './utils.js';

let settings = {};
let ringing;

function inviteBell() {
  chrome.runtime.sendMessage({'target': 'background', 'inviteBell' : true});
}

async function changeTimeSpace(){
	let timeSpaceOption = document.getElementById("timespace").selectedIndex;
	await setVar({'timeSpaceOption': timeSpaceOption});
  resetTimer();
}
function changeNumbOfBells() {
  let numbOfBells = document.getElementById("numbOfBells").selectedIndex;
  setVar({'numbOfBells': numbOfBells});
}
async function updateTime() {
  const { timer } = await getVar(['timer']);

  if (timer <= Date.now()) {
    ringing = true;
    inviteBell();
  }
	writeTime();
}

async function writeTime() {
  const { timer } = await getVar(['timer']);
	const remaining = Math.ceil((ringing? await getTimeSpace() : timer - Date.now())/1000);

	var timestr = '';
	var tempstr = '';
	timestr += ''+ Math.floor(remaining/60);
	if (timestr.length == 1)
	timestr = '0' + timestr;
	timestr += ':'
	tempstr += remaining%60;
	if (tempstr.length == 1)
	tempstr = '0' + tempstr;
	timestr += tempstr;
  $('#timeleft').each(function(){
    this.value = timestr;
  });
}
async function changeVolume(){
	document.getElementById("volume_txt").value = '' + document.getElementById("volume").value + '%';
	let volume = document.getElementById("volume").value;
  await setVar({'volume': volume});
  chrome.runtime.sendMessage({'target': 'offscreen', 'setVolume': true});
}

let updateTimer;
async function setBellEnabled(event) {
  // event is sent when clicking the Enable button
  const isBellEnabled = document.getElementById("isBellEnabledSwitch").checked;
  if (isBellEnabled) {
    if (event) await resetTimer();
    updateTime();
    updateTimer = setInterval(() => updateTime(), 1000);
    $('#onLayer').css('display','block');
    $('#offLayer').css('display','none');
  } else {
    clearInterval(updateTimer);
    $('#onLayer').css('display','none');
    $('#offLayer').css('display','block');
  }
  if (event) {
    chrome.runtime.sendMessage({'target': 'background', 'setBellEnabled': isBellEnabled});
  }
}

function updateData() {
  document.getElementById("timespace").selectedIndex = settings.timeSpaceOption;
  document.getElementById("numbOfBells").selectedIndex = settings.numbOfBells;
  document.getElementById("volume").value = settings.volume;
  document.getElementById("volume_txt").value = '' + document.getElementById("volume").value + '%';
  document.getElementById("isBellEnabledSwitch").checked = settings.isBellEnabled;
  document.getElementById('volume').onchange = changeVolume;
  document.getElementById('timespace').onchange = changeTimeSpace;
  document.getElementById('numbOfBells').onchange = changeNumbOfBells;
  document.getElementById('invitebell').onclick = inviteBell;
  document.getElementById('thichNhatHanh').onclick = inviteBell;
  document.getElementById("isBellEnabledSwitch").onclick = setBellEnabled;
  document.getElementById("offLayer").style.height = document.getElementById("onLayer").offsetHeight;
  setBellEnabled();
  // animation only after loaded
  document.body.classList.add("loaded");
}

function setLocalization() {
    var getI18nMsg = chrome.i18n.getMessage;

    document.title = getI18nMsg('bellTitle');
    $('#bellTitle').each(function(){
        this.innerHTML=getI18nMsg('bellTitle');
    });
    $('#RemainingTime').each(function(){
        this.innerHTML=getI18nMsg('RemainingTime');
        this.title = getI18nMsg('RemainingTime_Tooltip');
    });
    $('#TimeBetweenBells').each(function(){
        this.innerHTML=getI18nMsg('TimeBetweenBells');
        this.title = getI18nMsg('TimeBetweenBells_Tooltip');
    });
    $('#_5min_').each(function(){
        this.innerHTML=getI18nMsg('_5min_');
    });
    $('#_10min_').each(function(){
        this.innerHTML=getI18nMsg('_10min_');
    });
    $('#_15min_').each(function(){
        this.innerHTML=getI18nMsg('_15min_');
    });
    $('#_20min_').each(function(){
        this.innerHTML=getI18nMsg('_20min_');
    });
    $('#_30min_').each(function(){
        this.innerHTML=getI18nMsg('_30min_');
    });
    $('#_45min_').each(function(){
        this.innerHTML=getI18nMsg('_45min_');
    });
    $('#_60min_').each(function(){
        this.innerHTML=getI18nMsg('_60min_');
    });
    $('#numbOfBellsLabel').each(function(){
        this.innerHTML=getI18nMsg('NumOfBellsLabel');
        this.title = getI18nMsg('NumOfBells_Tooltip');
    });
    $('#VolumeLabel').each(function(){
        this.innerHTML=getI18nMsg('VolumeLabel');
        this.title = getI18nMsg('Volume_Tooltip');
    });
    $('#invitebell').each(function(){
        this.value=getI18nMsg('InviteBell');
    });
    $('#BellIsOff').each(function(){
        this.innerHTML=getI18nMsg('BellIsOff');
    });
    $('#BellOfMindfulnessPurpose').each(function(){
        this.innerHTML=getI18nMsg('BellOfMindfulnessPurpose');
    });
    $('#Feedback').each(function(){
        this.innerHTML=getI18nMsg('Feedback');
    });
    $('#TranslateCredit').each(function(){
        this.innerHTML=getI18nMsg('TranslateCredit');
    });
    $('#InspirationTxt').each(function(){
        this.innerHTML=getI18nMsg('InspirationTxt');
    });
    $('#InspirationCredit').each(function(){
        this.innerHTML=getI18nMsg('InspirationCredit');
    });

    $('#isBellEnabledSwitch').each(function(){
        this.title = getI18nMsg('isBellEnabledSwitch_Tooltip');
        $(this).children().each(function(){
            this.title = getI18nMsg('isBellEnabledSwitch_Tooltip');
            $(this).children().each(function(){
                this.title = getI18nMsg('isBellEnabledSwitch_Tooltip');
            });
        });
    });
    $('#timeleft').each(function(){
        this.title = getI18nMsg('RemainingTime_Tooltip');
    });
    $('#timespace').each(function(){
        this.title = getI18nMsg('TimeBetweenBells_Tooltip');
    });
    $('#volume').each(function(){
        this.title = getI18nMsg('Volume_Tooltip');
    });
    $('#volume_txt').each(function(){
        this.title = getI18nMsg('Volume_Tooltip');
    });
    $('#invitebell').each(function(){
        this.title = getI18nMsg('InviteBell_Tooltip');
    });
    $('#numbOfBells').each(function(){
        this.title = getI18nMsg('NumOfBells_Tooltip');
    });
}
async function loadData(){
  Object.assign(settings, await getVar());
  chrome.runtime.sendMessage({'target': 'offscreen', 'getRinging': true}, (response) => {
    if (chrome.runtime.lastError) return;
    ringing = response.ringing;
  });
  updateData();
}

document.addEventListener('DOMContentLoaded', function () {
  setLocalization();
  loadData();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.target !== '*' && message.target !== 'popup') return;

  if (message.ringing !== undefined) {
    ringing = message.ringing;
  }
});
