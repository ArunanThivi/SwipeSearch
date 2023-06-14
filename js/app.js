const APIController = (function () {

    const _getProfile = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _getPlaylists = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
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


    return {
        getProfile(token) {
            return _getProfile(token);
        },
        getPlaylists(token) {
            return _getPlaylists(token);
        },
        getPlaylistSongs(token, playlistId) {
            return _getPlaylistSongs(token, playlistId);
        },
        getTracks(token, ids) {
            return _getTracks(token, ids);

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
        <img src=${cover} class='playlistTile link' onClick='getPlaylist("${id}")'><br>
        ${name}<br>
        By: ${owner}<br>
        </div>`
        document.getElementById('playlistList').insertAdjacentHTML('beforeend', boxElement);

    
    }
}

async function getPlaylist(id) {
    if (!localStorage["token"]) {
        var access_token = getHashParams().access_token;
        localStorage["token"] = access_token;
    } else {
        var access_token = localStorage["token"];
    }
    playlistSongs = await APIController.getPlaylistSongs(access_token, id);
    playlistSongs = playlistSongs.items.map(obj => obj.track);
    localStorage["songs"] = JSON.stringify(playlistSongs);
    window.location.href = "Playlist.html"
}

function showSaved() {
    document.getElementById("savedSongsList").innerHTML = "";
    document.getElementById("savedSongs").style.display = "block";
    var saved = JSON.parse(localStorage["savedSongs"]);
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
    var saved = JSON.parse(localStorage["savedSongs"]);
    saved.splice(i, 1);
    localStorage["savedSongs"] = JSON.stringify(saved);
    showSaved();
}

function closeSaved() {
    var saved = JSON.parse(localStorage["savedSongs"]);
    document.getElementById("savedButton").innerText = saved.length;
    document.getElementById("savedButton").onclick = showSaved;
    document.getElementById("savedSongs").style.display = "none";
}