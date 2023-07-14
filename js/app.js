const APIController = (function () {

    const _getProfile = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _getPlaylists = async (token, offset) => {
        const result = await fetch(`https://api.spotify.com/v1/me/playlists?offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await result.json();
        return data;
    }

    const _getPlaylistSongs = async (token, playlistId) => {
        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=US&fields=items(track)`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await result.json();
        return data;
    }
    const _getTracks = async (token, ids) => {
        const result = await fetch(`https://api.spotify.com/v1/tracks?ids=${ids}&market=US`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _getPlaylist = async (token, id) => {
        const result = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _saveSongs = async (token, ids) => {
        const result = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${ids}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
        });
    };

    // const _saveToPlaylist = async (token, playlistId, ids) => {

    return {
        getProfile(token) {
            return _getProfile(token);
        },
        getPlaylists(token, offset) {
            return _getPlaylists(token, offset);
        },
        getPlaylistSongs(token, playlistId) {
            return _getPlaylistSongs(token, playlistId);
        },
        getTracks(token, ids) {
            return _getTracks(token, ids);
        },
        getPlaylist(token, id) {
            return _getPlaylist(token, id);
        },
        saveSongs(token, ids) {
            return _saveSongs(token, ids);
        }
    }

})();

function getHashParams() {
    console.log("TEST!")
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
      }
    console.log(hashParams)
    return hashParams;
  };

  function displayPlaylists(playlists, count = 20, start = 0) {
    console.log(playlists)
    for (let i = start; i < count; i++) {
        if (playlists[i].images.length < 1){
            continue;
        }
        var id = playlists[i].id;
        var cover = (playlists[i].images.length > 1 ? playlists[i].images[1].url : playlists[i].images[0].url);
        var name = playlists[i].name;
        var owner = playlists[i].owner.display_name;
        var boxElement = `
        <div class='songInfo' id='playlist${i}'>
        <a href='Playlist.html?playlist=${id}'><img src=${cover} class='playlistTile link'></a><br>
        ${name}<br>
        By: ${owner}<br>
        </div>`
        document.getElementById('playlistList').insertAdjacentHTML('beforeend', boxElement);

    
    }
}


function showSaved() {
    document.getElementById("savedSongsList").innerHTML = "";
    document.getElementById("savedSongs").style.display = "block";
    var saved = savedSongs;
    for (let i in saved) {
        var song = saved[i];
        console.log(song);
        var songBox = document.createElement("div");
        songBox.className = "savedInfo";
        songBox.id = "saved" + i;
        songBox.dataset.id = i;
        var cover = document.createElement("img");
        cover.src = song.album.images[1].url;
        cover.className = "savedTile";
        cover.onclick = function () { removedSaved(this.dataset.id) };
        songBox.appendChild(cover);
        var songInfo = document.createElement("div");
        songInfo.className = "savedSongInfo";
        songInfo.innerHTML += song.name + "<br>";
        songInfo.innerHTML += song.artists[0].name;
        songBox.appendChild(songInfo);
        document.getElementById("savedSongsList").appendChild(songBox);
    }
    document.getElementById("savedButton").innerHTML = "&times;"
    document.getElementById("savedButton").onclick = closeSaved;
}

function removedSaved(i) {
    uriSet.delete(savedSongs.splice(i, 1)[0].uri);
    localStorage["savedSongs"] = JSON.stringify(savedSongs);
    localStorage["uriSet"] = JSON.stringify(Array.from(uriSet));
    showSaved();
}

function closeSaved() {
    document.getElementById("savedButton").innerText = savedSongs.length;
    document.getElementById("savedButton").onclick = showSaved;
    document.getElementById("savedSongs").style.display = "none";
}

function handleScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < 200) {
        APIController.getPlaylists(access_token, offset).then(playlists => {
            // Process the fetched playlists
            offset += 20;
            console.log('Fetched playlists:', playlists);
            displayPlaylists(playlists.items, playlists.items.length, 0);
            if (playlists.next == null) {
                document.removeEventListener('scroll', handleScroll);
            }
        })
        .catch(error => {
            // Handle any errors that occur during the API call
            console.error('Error fetching playlists:', error);
            console.log("token " + access_token)
        });
    }
}

function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }