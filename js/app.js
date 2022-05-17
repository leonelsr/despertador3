///////////////////////////////////////////////////////////////////////////////////////
//
// TODO: Pelo amor de Deus, refatorar esse ninho de rato todo, de uma vez !!!
//
///////////////////////////////////////////////////////////////////////////////////////


// TODO: ver https://github.com/electron/remote
//       para melhorarar segurança e desempenho aqui
const { BrowserWindow } = require('@electron/remote')
var mainWindow = require('@electron/remote').getCurrentWindow();
const { Titlebar } = require("custom-electron-titlebar");



const { ipcRenderer } = require('electron')
//const { DisableMinimize } = require('electron-disable-minimize');
const { exec, spawn } = require('child_process');
const moment = require('moment')
const { dialog } = require('@electron/remote');
const fs = require('fs')
const ipc = require('electron').ipcRenderer;
const prompt = require('electron-prompt');

const CONFIG = require('./config.json')


var { google } = require('googleapis');
var youtube = google.youtube({ version: 'v3', auth: CONFIG.YouTubeAPIkey })

/*
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {
console.log(arg) // prints "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')
*/

//mainWindow.setAutoHideMenuBar(true)
/*
  Pensar em usar: https://github.com/AlexTorresSk/custom-electron-titlebar
*/
/* 
 const customTitlebar = require('custom-electron-titlebar');

 new customTitlebar.Titlebar({
     backgroundColor: customTitlebar.Color.fromHex('#444')
 });
 */

var audioEl = document.querySelector('#alarmAudio')
/*
if (new Date() > moment('07:05:00','HH:mm:ss')) {
    doSnooze();
}
*/

function fadeAudioIn() {

}


audioEl.src = CONFIG.alarmSoundFile;


function doSetSound() {
    dialog.showOpenDialog({
        properties: ['openFile', 'dontAddToRecent']
    }).then((result) => {
        // result.canceled, result.filePaths
        console.log('result', result);
        if (!result.canceled) {
            audioEl.src = result.filePaths[0];
            CONFIG.alarmSoundFile = result.filePaths[0];
            updateConfig();
            console.log('feito', audioEl);
        }
    }).catch(err => console.error(err));
}

function updateConfig() {
    fs.writeFileSync('./config.json', JSON.stringify(CONFIG, null, 2))
}


toggleBtn.onclick = function () { this.dataset.state = !JSON.parse(this.dataset.state) }

var isSnoozed = false;
var radioVolume = 0.1;

//window.enableSpeak = true;
//var frase = 'Levanta!!! Hoje tem Renata meio-dia e meia!!!';

async function pwshSay(frase, rate = 0, repeat = 1) {
    if (CONFIG.enableSpeak) {
        const spawn = require('await-spawn');
        await spawn("pwsh.exe", ['-Command', `
            $voice = (New-Object -ComObject SAPI.SpVoice);
            $voice.rate = ${rate};
            for ($i = 1; $i -le ${repeat}; $i++) {
                $voice.Speak('${frase}')
            }`]);
    } else {
        return true;
    }
}



async function sayFrase() {
    await $(audioEl).animate({volume: 0.1}, {
        duration: 5000,
        progress: function() {},
        //complete: function () {}
    }).promise()
    await pwshSay(CONFIG.frase, 2, 1)
    await $(audioEl).animate({volume: 1}, {
        duration: 5000,
        progress: function() {},
        //complete: function () {}
    }).promise()
}

async function playFadeIn() {
    if (!JSON.parse(document.getElementById('toggleBtn').dataset.state)) {
        return;
    }
    document.querySelector('#snoozeBtn').style.display = 'block'

    exec('nircmd.exe mutesysvolume 0')
    exec('nircmd.exe changesysvolume 65535')

    //const spawn = require('await-spawn');
    //await spawn("pwsh.exe", ['-Command', "(New-Object -ComObject SAPI.SpVoice).Speak('Tem E-E-G na PUC às 11:30!!!')"]);
    await pwshSay(CONFIG.frase, 2, 1)

    /*
    exec('nircmd.exe changesysvolume 65535', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });
    */


    mainWindow.focus()

    document.querySelector('#snoozeBtn').style.display = 'block'
    document.querySelector('#stopBtn').style.display = 'block'

    var radioEl = document.getElementById('radioAudio')
    if (!radioEl.paused) {
        radioVolume = radioEl.volume
        //radioEl.volume = 0.01
        radioVol.value = 0.01; radioVol.oninput()
    }

    audioEl.volume = 0.01
    audioEl.play()

    
    $(audioEl).animate({volume: 1}, {
        duration: 10000,
        progress: function() {},
        complete: function () {
            setTimeout(async function() {
                await sayFrase()
            }, 10000)
        }
    }).promise();
    
    /*
    var fadeCount = 0
    var fadeTimer = setInterval(function () {
        if (audioEl.volume == 1 || audioEl.paused || audioEl.ended) {
            clearInterval(fadeTimer)
            return
        }
        if (++fadeCount < 99) {
            if (fadeCount % 10 == 0) {
                pwshSay(CONFIG.frase, 2, 2);
            }
            audioEl.volume = (audioEl.volume + 0.01).toFixed(2);
        } else {
            audioEl.volume = 1
            clearInterval(fadeTimer)
        }
        console.log('volume', audioEl.volume)
    }, 2000)
    */
}

document.querySelector('#stopBtn').onclick = event => {
    audioEl.pause();
    document.querySelector('#snoozeBtn').style.display = 'none'
    toggleBtn.dataset.state = false;
}

audioEl.onpause = event => {
    document.querySelector('#snoozeBtn').style.display = 'none'
    document.querySelector('#stopBtn').style.display = 'none'
    audioEl.currentTime = 0
    var radioEl = document.getElementById('radioAudio')
    if (!radioEl.paused) {
        //radioEl.volume = radioVolume;
        radioVol.value = radioVolume; radioVol.oninput()
    }
}
audioEl.addEventListener("play", event => {
    document.querySelector('#snoozeBtn').style.display = 'block'
    document.querySelector('#stopBtn').style.display = 'block'

});
audioEl.addEventListener("ended", event => {
    document.querySelector('#snoozeBtn').style.display = 'none'
    doSnooze(5 * 60 * 1000)
});

function doSnooze(param) {
    document.querySelector('#snoozeBtn').style.display = 'none'
    audioEl.pause();
    audioEl.currentTime = 0;
    pwshSay(CONFIG.frase, 2, 1);
    let snoozeTime = typeof param == "undefined" ? 10 * 60 * 1000 : param;
    isSnoozed = {
        timer: setTimeout(function () {
            // audioEl.play();
            playFadeIn()
            isSnoozed = false;
        }, snoozeTime)
    }
}



async function getYoutubeVideo() {
    var searchParams = {
        "part": [
            "snippet"
        ],
        "channelId": "UCWijW6tW0iI5ghsAbWDFtTg", // BandNews
        //"channelId": "UCoa-D_VfMkFrCYodrOC9-mA", // Band Jornalismo
        //"channelId": "UCLgti7NuK0RuW9wty-fxPjQ", // TV Senado
        //"channelId": "UCN64HjXppbMaFrRLRfMHaoA", // Mix
        "eventType": "live",
        "maxResults": 25,
        "type": [
            "video"
        ]
    }
    var result = await youtube.search.list(searchParams);
    console.log('results', result);

    // "sleep"
    //await new Promise(r => setTimeout(r, 2000));
    
    // [AO VIVO] Jornal BandNews FM - 17/05/2022

    if (result.data.items.length == 0) {
        console.log('Band Jornalismo');
        searchParams.channelId = 'UCoa-D_VfMkFrCYodrOC9-mA';
        result = await youtube.search.list(searchParams);
    }
    if (result.data.items.length == 0) {
        console.log('TV Senado');
        searchParams.channelId = 'UCLgti7NuK0RuW9wty-fxPjQ';
        result = await youtube.search.list(searchParams);
    }
    if (result.data.items.length == 0) {
        delete searchParams.channelId;
        console.log('params', searchParams);
        result = await youtube.search.list(searchParams);
        console.log('result', result);
    }


    return result.data.items[0].id.videoId
}

//async function lgtvRequest(endpoint, payload)

//videoId = await getYoutubeVideo();

var loudness = require('loudness')

function fadeSystemVolume() {
    var fadeCount = 0
    var fadeTimer = setInterval(function () {
        if (++fadeCount < 99) {
            if (fadeCount % 10 == 0) {
                pwshSay(CONFIG.frase, 2, 2);
            }
            //audioEl.volume = (audioEl.volume + 0.01).toFixed(2);
            loudness.setVolume(fadeCount);
        } else {
            loudness.setVolume(100);
            clearInterval(fadeTimer)
        }
        console.log('volume', fadeCount)
    }, 1000);
}

async function playYTonTV() {
    return new Promise(async function (resolveYT, rejectYT) {
        exec('WakeMeOnLan.exe /wakeup 58:FD:B1:AF:DA:3E');


        // LG clientKey: ...
        lgtv = require("lgtv2")({
            url: 'ws://192.168.0.13:3000',
            //clientKey: '...',
            keyFile: './keyfile.txt'
        });
        videoId = await getYoutubeVideo();
        videoURL = 'https://youtube.com/watch?v=' + videoId

        //exec('nircmd.exe mutesysvolume 0')
        //exec('nircmd.exe setsysvolume 0')

        //require("electron").shell.openExternal('https://youtube.com/watch?v='+videoId);
        //ytBWin = window.open(videoURL, 'ytframe', 'frame=true,nodeIntegration=no,top=10,left=10,width=700,height=520');

        // setTimeout(function() { playYTaudio(videoURL); },500);
        playYTaudio(videoURL);

        lgtv.on('connect', async function (connecterr, connectres) {
            if (connecterr) {
                console.log('connectecd error', connecterr);
            }
            console.log('connected', connectres);

            lgtv.request('ssap://system.launcher/launch', { id: 'youtube.leanback.v4', contentId: "https://www.youtube.com/tv?v=" + videoId }, (err, result) => {
                RES = result;
                console.log(result);
                setTimeout(() => lgtv.getSocket('ssap://com.webos.service.networkinput/getPointerInputSocket',
                    function (err, sock) {
                        if (!err) {
                            sock.send('button', { name: 'ENTER' }); // ok = ENTER
                            resolveYT('OK');
                        }
                        else {
                            rejectYT(err);
                        }
                    }
                ), 15000);
            }) // lgtv.request(... (err,result)
        }); // lgtv.on('connect',
    })
} // new Promise((resolveYT, rejectYT) => {



//window.open('https://www.youtube.com/embed/'+videoid+'?autoplay=true', '_blank', 'frame=true,nodeIntegration=false');
//var BrowserWindow = require('electron').remote.BrowserWindow;
/*
let ytwin = new BrowserWindow({
    title: 'YouTube',
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
});
ytwin.loadURL(`file://${__dirname}/ytindex.html`);

ytwin.webContents.on('did-finish-load', async () => {
    var videoId = await getYoutubeVideo();
    ytwin.webContents.send('loadvideo', videoId);
    // ytwin.webContents.send('loadvideo', 'M7lc1UVf-VE');
});
*/

/*
ipc.on('message', (event, message) => {
    console.log(message); // logs out "Hello second window!"
})
*/

async function playYTaudio(videoURL) {
    ytdl = require('ytdl-core');
    videoInfo = await ytdl.getInfo(videoURL)

    var radioEl = document.getElementById('radioAudio');
    radioEl.style.display = 'block'
    radioEl.volume = 0.1

    var hls = new Hls({
        //debug: true,
        xhrSetup: function (xhr, url) {
            //xhr.withCredentials = true; // do send cookie
            //xhr.setRequestHeader("Referer", videoURL);
        }
    });

    hls.loadSource(videoInfo.formats[0].url);
    hls.attachMedia(radioEl);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
        radioEl.play();
    });
}

function playRadio() {
    exec('nircmd.exe mutesysvolume 0')
    exec('nircmd.exe setsysvolume 65535')
    //exec('nircmd.exe setsysvolume 32768')

    playYTonTV();
}

function playBandNewsHLS() {
    var radioEl = document.getElementById('radioAudio');
    radioEl.style.display = 'block'
    radioEl.volume = 0.1

    exec('nircmd.exe mutesysvolume 0')
    exec('nircmd.exe setsysvolume 65535')
    //exec('nircmd.exe setsysvolume 32768')

    if (Hls.isSupported()) {
        var hls = new Hls({
            debug: true,
            xhrSetup: function (xhr, url) {
                xhr.withCredentials = true; // do send cookie
                // xhr.setRequestHeader("Referer", "https://evpp.mm.uol.com.br/band/bandnewsfm_poa/");
                xhr.setRequestHeader("Referer", "https://evpp.mm.uol.com.br/band/bandnewsfm_sp/");
            }
        });

        // hls.loadSource('https://evpp.mm.uol.com.br/band/bandnewsfm_poa/playlist.m3u8');
        hls.loadSource('https://evpp.mm.uol.com.br/band/bandnewsfm_sp/playlist.m3u8');
        hls.attachMedia(radioEl);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            radioEl.play();
        });
    }
    else if (radioEl.canPlayType('application/vnd.apple.mpegurl')) {
        // radioEl.src = 'https://evpp.mm.uol.com.br/band/bandnewsfm_poa/playlist.m3u8';
        radioEl.src = 'https://evpp.mm.uol.com.br/band/bandnewsfm_sp/playlist.m3u8';
        radioEl.addEventListener('loadedmetadata', function () {
            radioEl.play();
        });
    }
}


/* 
 
var sched = later.parse.recur()
//.on('02:22:30').time().and()
//.on('02:47:00').time().and()
.on('08:05:00').time()
 
*/


var later = require('later');
later.date.localTime();

var alarmSched = later.parse.recur()
    //.on('02:19:50').time().and()
    //.on('06:45:00').time().and()
    .on('07:15:00').time().and()
    .on('08:35:00').time().and()
    .on('09:05:00').time()


var timer = later.setInterval(function () {
    console.log('executed')
    if (isSnoozed) {
        clearTimeout(isSnoozed.timer)
        isSnoozed = false
    }
    playFadeIn()
}, alarmSched);


var radioSched = later.parse.recur()
    .on('07:00:45').time().and()
    .on('07:30:00').time().and()
    .on('08:20:00').time()

var radioTimer = later.setInterval(function () {
    let now = new Date();
    if (now.getDay() == 6 || now.getDay() == 0) {
        return // sem rádio
    }
    console.log('executed radioTimer')
    if (isSnoozed) {
        clearTimeout(isSnoozed.timer)
        isSnoozed = false
    }
    playRadio()
}, radioSched);


function sair() {
    return prompt({
        title: 'Sair?',
        label: 'Para fechar, digite "Fechar"',
        value: '',
        //inputAttrs: {
        //    type: 'url'
        //},
        alwaysOnTop: true,
        type: 'input',
        resizable: true
    })
        .then((res) => {
            if (res === null) {
                console.log('user cancelled');
            } else if (res == "Fechar") {
                console.log('result', res);
                global.allowExit = true;
                require('@electron/remote').app.exit();
            } else {
                console.log(res);
            }
        })
        .catch(console.error);
}


// npm i -S node-powershell

async function exitBtn() {
    //const spawn = require('await-spawn');
    //spawn("pwsh.exe", ['-Command', "(New-Object -ComObject SAPI.SpVoice).Speak('Tem médico às 8 e meia')"]);
    dialog.showMessageBox({
        title: 'Sair?',
        type: 'none',
        buttons: [
            "&SONECA - VOU DORMIR MAIS",
            "&DESLIGA ALARME - Já acordei",
            "SA&IR (FECHAR)"
        ],
        message: "Quer SAIR mesmo?",
        noLink: false,
        cancelId: -1
    }).then((res) => {
        //spawn("pwsh.exe", ['-Command', "(New-Object -ComObject SAPI.SpVoice).Speak('Tem médico às 8 e meia')"]);
        console.log(res.response)
        console.log(res.checkboxChecked) //true or false
        if (res.response == 2) {
            sair();
            //global.allowExit = true;
            //require('electron').remote.app.exit();
        } else if (res.response == 0) {
            doSnooze();
        } else if (res.response == 1) {
            audioEl.pause();
            toggleBtn.dataset.state = false;
        }
    })

}


mainWindow.on('close', function (e) {
    e.preventDefault();
    pwshSay('Só depois que levantar! Agora só aperta soneca', 2, 2)
    exitBtn();
    console.log('mainWindow.on(close)');
});


            // document.querySelector('#radioVol').onmousewheel = function (event) {
            //     console.log(event);
            //     this.value = (Number(this.value) + (event.wheelDelta > 0 ? 0.01 : -0.01)).toFixed(2);
            //     this.oninput()
            // }





            // get the native HWND handle
/*
             let handle = mainWindow.getNativeWindowHandle();

            // Disable Minimize Perfectly!
            setTimeout(() => {
                console.log('DisableMinimize', DisableMinimize(handle)); // boolean
            }, 10000);
            
            mainWindow.on('minimize', function(event) {
                setTimeout(() => {
                    mainWindow.restore();
                    mainWindow.once('restore', function (restoreEvent) {
                        mainWindow.blur();
                    });
                }, 5000);
            });

            var resizeTimeout;
            mainWindow.on('resize', (e)=>{
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function(){
                    var size = mainWindow.getSize();
                    mainWindow.setSize(size[0], parseInt(size[0] * 0.3));
                }, 100);
            });
 */
