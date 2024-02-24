// Global variable to store the YouTube player
var player;
let englishLyrics = [];
let frenchLyrics = [];
let learnedWords = [];

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

function onPlayerReady(event) {
    const songSelector = document.getElementById('songSelector').value;
    var startTime = songDetails[songSelector].startTime;
    var endTime = songDetails[songSelector].endTime;

    var interval = setInterval(function() {
        var currentTime = player.getCurrentTime();
        if (currentTime > endTime) {
            player.pauseVideo();
            player.seekTo(startTime);
            resetHighlighting();
        }
    }, 100);
    setInterval(highlightLyrics, 100);
}

function creatingSpansForWords(lyrics, language) {
    const container = document.getElementById(`${language}Lyrics`);
    for (var i = 0; i < lyrics.length; i++) {
        if (lyrics[i].word === '\n') {
            container.appendChild(document.createElement('br'));
        } else {
            const newElement = document.createElement('span');
            newElement.classList.add('word');
            newElement.innerText = lyrics[i].word;
            (function(word, language) {
              newElement.onclick = function() {
                  handleWordClick(this, word, language);
              };
          })(lyrics[i].word, language);
            container.appendChild(newElement);
        }
    }
}

async function selectSong() {
    document.getElementById('englishLyrics').innerHTML = '';
    document.getElementById('frenchLyrics').innerHTML = '';
    var songId = document.getElementById("songSelector").value;
    const song = songDetails[songId];
    englishLyrics = await loadLyrics(song.name, 'english');
    frenchLyrics = await loadLyrics(song.name, 'french');

    // Fill the learned words div with all the French words
    learnedWords = frenchLyrics.map(item => {
        return { word: item.word, translation: 'Translation here' }; // Replace 'Translation here' with actual translation logic
    });
    updateLearnedWordsList();
}

async function loadLyrics(name, language) {
    const response = await fetch(`./${name}_${language}_timestamps.json`);
    const lyrics = await response.json();
    creatingSpansForWords(lyrics, language);
    return lyrics;
}

function highlightLyrics() {
    const currentTime = player.getCurrentTime();
    const englishWords = document.querySelectorAll('#englishLyrics .word');
    const frenchWords = document.querySelectorAll('#frenchLyrics .word');

    englishWords.forEach(word => word.classList.remove('highlight'));
    frenchWords.forEach(word => word.classList.remove('highlight'));

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

function handleWordClick(element, word, language) {
    // Highlight the clicked word
    resetHighlighting();
    element.classList.add('highlight');

    if (language === 'french') {
      const msg = new SpeechSynthesisUtterance();
      msg.text = word;
      msg.lang = 'fr-FR';
      window.speechSynthesis.speak(msg);
  }
}

function updateLearnedWordsList() {
    const learnedWordsList = document.getElementById('learnedWords');
    learnedWordsList.innerHTML = '';

    learnedWords.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerText = `${item.word} - ${item.translation}`;
        learnedWordsList.appendChild(listItem);
    });
}
