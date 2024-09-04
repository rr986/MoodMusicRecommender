const moodInput = document.getElementById('moodInput');
const recommendButton = document.getElementById('recommendButton');
const albumsContainer = document.getElementById('albums');
const savedAlbumsContainer = document.getElementById('savedAlbums');

recommendButton.addEventListener('click', () => {
  const mood = moodInput.value;

  fetch(`/recommend?mood=${encodeURIComponent(mood)}`)
    .then(response => response.json())
    .then(data => {
      albumsContainer.innerHTML = '';

      if (data.albums) {
        data.albums.forEach(album => {
          const albumWidget = createAlbumWidget(album);
          albumsContainer.appendChild(albumWidget);
        });
      } else {
        albumsContainer.innerHTML = `<p>No recommendations for this mood. Try a different mood.</p>`;
      }
    })
    .catch(error => {
      console.error('Error fetching recommendations:', error);
      albumsContainer.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    });
});

function createAlbumWidget(album) {
  const albumDiv = document.createElement('div');
  albumDiv.classList.add('album');

  const albumDetails = document.createElement('div');
  albumDetails.innerHTML = `<p class="album-title">${album.title}</p><p>by ${album.artist}</p>`;

  const tagButton = document.createElement('button');
  tagButton.innerText = "Tag for Later";
  tagButton.addEventListener('click', () => saveForLater(album));

  const mp3Link = document.createElement('a');
  mp3Link.href = album.mp3;
  mp3Link.innerText = "Listen";

  albumDiv.appendChild(albumDetails);
  albumDiv.appendChild(tagButton);
  albumDiv.appendChild(mp3Link);

  return albumDiv;
}

function saveForLater(album) {
  const savedAlbumDiv = document.createElement('div');
  savedAlbumDiv.classList.add('album');
  savedAlbumDiv.innerHTML = `<p class="album-title">${album.title}</p><p>by ${album.artist}</p>`;
  savedAlbumsContainer.appendChild(savedAlbumDiv);
}
