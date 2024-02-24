// Things we will keep stored in memory:
// 1. all the english and french lyrics and their timestamps for every song

// Global variable to store the YouTube player
var player;
let englishLyrics = [];
let frenchLyrics = [];

const songDetails = {
  "fmdLsdmYzTo": {
    name: "i_know",
    startTime: 90,
    endTime: 115
  },
  "Sv5yCzPCkv8": {
    name: "snooze",
    startTime: 39,
    endTime: 55
  }
  // Add more songs as needed
};

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('songSelector').selectedIndex = 0; // Select the first song by default
  selectSong();
});

function onYouTubeIframeAPIReady() {
  const songSelector = document.getElementById('songSelector');
  loadVideo(songSelector.value);

  songSelector.addEventListener('change', () => {
      loadVideo(songSelector.value);
  });
}

function loadVideo(videoId) {
  const song = songDetails[videoId];
  if (player) {
      player.loadVideoById({
        videoId: videoId,
        startSeconds: song.startTime,
        endSeconds: song.endTime,
      });
  } else {
      player = new YT.Player('youtubePlayer', {
          height: '400',
          width: '400',
          videoId: videoId,
          playerVars: {
              controls: 0,
              rel: 0,
              disablekb: 1,
              loop: 1,
              start: song.startTime,
              end: song.endTime
          },
          events: {
              'onReady': onPlayerReady,
          }
      });
  }
}

// Function called when the player is ready
function onPlayerReady(event) {

    const songSelector = document.getElementById('songSelector').value;
    var startTime = songDetails[songSelector].startTime;
    var endTime = songDetails[songSelector].endTime;

    // Monitor the player's current time and reset it if it goes beyond the limits
    var interval = setInterval(function() {
        var currentTime = player.getCurrentTime();
        if (currentTime > endTime) {
            player.pauseVideo();
            player.seekTo(startTime);
            resetHighlighting();
        }
    }, 100); // Check every second
    setInterval(highlightLyrics, 100);
}

function creatingSpansForWords(lyrics, language) {
    const container = document.getElementById(`${language}Lyrics`);
    for (var i = 0; i < lyrics.length; i++) {
        // Will be needed when we do proper line breaks
        if (lyrics[i].word === '\n'){
            container.appendChild(document.createElement('br'));
        }
        else {
            const newElement = document.createElement('span');
            newElement.classList.add('word');
            newElement.innerText = lyrics[i].word;
            container.appendChild(newElement);
        }
    }
}

async function selectSong(){
  document.getElementById('englishLyrics').innerHTML = '';
  document.getElementById('frenchLyrics').innerHTML = '';
  var songId = document.getElementById("songSelector").value;
  const song = songDetails[songId];
  englishLyrics = await loadLyrics(song.name, 'english');
  frenchLyrics = await loadLyrics(song.name, 'french');
}

// Need to account for multiple songs
async function loadLyrics(name, language) {
  const response = await fetch(`./${name}_${language}_timestamps.json`);
  const lyrics = await response.json();
  console.log(lyrics);
  creatingSpansForWords(lyrics, language);
  return lyrics;
}

function highlightLyrics() {
    const currentTime = player.getCurrentTime();
    const englishWords = document.querySelectorAll('#englishLyrics .word');
    const frenchWords = document.querySelectorAll('#frenchLyrics .word');

    // Remove existing highlights
    englishWords.forEach(word => word.classList.remove('highlight'));
    frenchWords.forEach(word => word.classList.remove('highlight'));

    // Find and highlight the current word in the lyrics
    englishLyrics.forEach((item, index) => {
        if (currentTime >= item.time && (index === englishLyrics.length - 1 || currentTime < englishLyrics[index + 1].time)) {
            englishWords[index].classList.add('highlight');
        }
    });

    frenchLyrics.forEach((item, index) => {
        if (currentTime >= item.time && (index === frenchLyrics.length - 1 || currentTime < frenchLyrics[index + 1].time)) {
            frenchWords[index].classList.add('highlight');
        }
    });
}

function resetHighlighting() {
    const englishWords = document.querySelectorAll('#englishLyrics .word');
    const frenchWords = document.querySelectorAll('#frenchLyrics .word');

    englishWords.forEach(word => word.classList.remove('highlight'));
    frenchWords.forEach(word => word.classList.remove('highlight'));
}