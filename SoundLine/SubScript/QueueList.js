function updateQueueDisplay() {
    const queueListElement = document.getElementById('queue-list');
    queueListElement.innerHTML = '';
  
    queue.forEach((track) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
      listItem.classList.add('queue-item');
      queueListElement.appendChild(listItem);
    });
  }
  