const clientId = 'Your Own ClientID';
const clientSecret = 'Your Own ClientSecret';

let queue = [];
let isPlaying = false;
let audioElement = null;


const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
});


async function authenticate() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    console.log('Authentication successful:', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error;
  }
}


async function searchTracks(query) {
  try {
    const accessToken = await authenticate();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });
    const data = await response.json();
    console.log('Search results:', data.tracks.items);
    return data.tracks.items;
  } catch (error) {
    console.error('Error searching for tracks:', error);
    throw error;
  }
}


async function search() {
  try {
    const searchInput = document.getElementById('search-input').value;
    if (searchInput.trim() === '') {
      clearResults();
      return;
    }
    const tracks = await searchTracks(searchInput);
    displayResults(tracks);
  } catch (error) {
    console.error('Error during search:', error);
  }
}


function displayResults(tracks) {
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = '';
  searchResults.style.display = 'block';

  if (tracks.length > 0) {
    const track = tracks[0];
    const listItem = document.createElement('div');
    listItem.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
    listItem.classList.add('search-result');
    listItem.addEventListener('click', () => addToQueue(track));
    searchResults.appendChild(listItem);
  } else {
    const noResults = document.createElement('div');
    noResults.textContent = 'No results found';
    noResults.classList.add('search-result');
    searchResults.appendChild(noResults);
  }
}


function addToQueue(track) {
  queue.push(track);
  updateQueueDisplay();
  if (!isPlaying) {
    playNextInQueue();
  }
}


function updateQueueDisplay() {
  const queueElement = document.getElementById('queue');
  const queueListElement = document.getElementById('queue-list');
  queueElement.innerHTML = '';
  queueListElement.innerHTML = '';

  queue.forEach((track, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
    listItem.classList.add('queue-item');

    if (index === 0) {
      queueElement.appendChild(listItem);
    } else {
      queueListElement.appendChild(listItem);
    }
  });
}


function clearResults() {
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = '';
  searchResults.style.display = 'none';
}


function updateAlbumArtwork(imageUrl) {
  const containerBox = document.querySelector('.Container.Box');
  containerBox.innerHTML = `<img src="${imageUrl}" alt="Album Artwork">`;
}


function clearAlbumArtwork() {
  const containerBox = document.querySelector('.Container.Box');
  containerBox.innerHTML = '';
}


function toggleProgressBar(isVisible) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.display = isVisible ? 'block' : 'none';
}


async function playNextInQueue() {
  if (queue.length === 0) {
    isPlaying = false;
    clearAlbumArtwork();  
    toggleProgressBar(false);  
    return;
  }

  isPlaying = true;
  const track = queue[0];


  updateAlbumArtwork(track.album.images[0].url);

  if (track.preview_url) {
    if (audioElement) {
      audioElement.pause();
    }

    audioElement = new Audio(track.preview_url);
    audioElement.play();

    toggleProgressBar(true);  

    audioElement.addEventListener('timeupdate', () => {
      const progress = (audioElement.currentTime / audioElement.duration) * 100;
      const progressBar = document.getElementById('progress-bar');
      progressBar.value = progress;
    });

    const progressBar = document.getElementById('progress-bar');
    progressBar.addEventListener('input', () => {
      const seekTime = (progressBar.value * audioElement.duration) / 100;
      audioElement.currentTime = seekTime;
    });

    audioElement.addEventListener('ended', () => {
      queue.shift();
      updateQueueDisplay();
      setTimeout(playNextInQueue, 1200);
    });
  } else {
    console.log('No preview available for this track. Skipping to the next track.');
    queue.shift();
    updateQueueDisplay();
    playNextInQueue();
  }
}


function stopTrack() {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0; 

    clearAlbumArtwork(); 
    queue = []; 
    updateQueueDisplay(); 

    audioElement = null; 

    document.getElementById('play').textContent = 'play_circle'; 
    toggleProgressBar(false); 
  }
}


function skipTrack() {
  if (audioElement) {
    audioElement.pause();
  }

  if (queue.length > 0) {
    queue.shift();
    updateQueueDisplay();
    playNextInQueue();
  } else {
    clearAlbumArtwork();
    toggleProgressBar(false);
  }
}


function toggleClearIcon() {
  const searchInput = document.getElementById('search-input').value;
  const clearSearch = document.getElementById('clear-search');
  clearSearch.style.display = searchInput.trim() !== '' ? 'block' : 'none';
}


document.getElementById('search-input').addEventListener('input', () => {
  toggleClearIcon();
  search();
});


document.getElementById('clear-search').addEventListener('click', () => {
  document.getElementById('search-input').value = '';
  clearResults();
  toggleClearIcon();
});

document.addEventListener('DOMContentLoaded', () => {
  
  const stopBtn = document.getElementById('stop');
  const playPauseBtn = document.getElementById('play');
  const skipNextBtn = document.getElementById('skip-next');

  
  stopBtn.addEventListener('click', stopTrack);
  playPauseBtn.addEventListener('click', togglePlayPause);
  skipNextBtn.addEventListener('click', skipTrack);
});


function pauseTrack() {
  if (audioElement) {
    audioElement.pause();
    document.getElementById('play').textContent = 'play_circle';
  }
}


function togglePlayPause() {
  if (audioElement) {
    if (audioElement.paused) {
      audioElement.play();
      document.getElementById('play').textContent = 'pause_circle';
    } else {
      pauseTrack();
    }
  } else if (queue.length > 0) {
    playNextInQueue();
  }
}
