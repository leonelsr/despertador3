videoid = await getYoutubeVideo();
videoURL = 'https://youtube.com/watch?v='+videoid

ytdl = require('ytdl-core');
videoInfo = await ytdl.getInfo(videoURL)


var radioEl = document.getElementById('radioAudio');
radioEl.style.display = 'block'
radioEl.volume = 0.1


var hls = new Hls({
    debug: true,
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
