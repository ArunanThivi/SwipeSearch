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

    const _searchItems = async (token, query, type, offset) => {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=${type}&offset=${offset}`, {
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
        searchItems(token, query, type) {
            return _searchItems(token, query, type, offset);
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
    var params = {};
    var searchParams = new URLSearchParams(window.location.search);
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        params[e[1]] = decodeURIComponent(e[2]);
    }
    searchParams.forEach((v, k) => params[k] = v);
    return params;
};

//Playlists.html

function displayPlaylists(playlists, count = 20, start = 0) {
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
        <span class='playlistName'>${name}</span><br>
        <span class='playlistAuthor'>By: ${owner}</span><br>
        </div>`
        document.getElementById('playlistList').insertAdjacentHTML('beforeend', boxElement);


    }
}

function handleScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollHeight - scrollTop - clientHeight < 200) {
        if (term) {
            APIController.searchItems(access_token, term, 'playlist', offset).then(response => {
                // Process the fetched playlists
                playlists = response.playlists;
                offset += 20;
                displayPlaylists(playlists.items, playlists.items.length, 0);
                if (playlists.next == null) {
                    document.removeEventListener('scroll', handleScroll);
                }
            })
            .catch(error => {
                // Handle any errors that occur during the API call
                console.error('Error fetching playlists:', error);
            });
        } else {
            APIController.getPlaylists(access_token, offset).then(playlists => {
            // Process the fetched playlists
                offset += 20;
                displayPlaylists(playlists.items, playlists.items.length, 0);
                if (playlists.next == null) {
                    document.removeEventListener('scroll', handleScroll);
                }
            })
            .catch(error => {
                // Handle any errors that occur during the API call
                console.error('Error fetching playlists:', error);
            });
        }
        
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

//Playlist.html

function setCard(song) {
    $('#dummyCard').html($('#songInfo').html())
    document.getElementById('cover').src = song.album.images[0].url;
    document.getElementById('title').innerHTML = song.name;
    document.getElementById('artist').innerHTML = song.artists.map(obj => obj.name).join(', ');
    document.getElementById('preview').src = song.preview_url;
    var img = $('#cover');
    img.imgcolr(function (img, color) {
        const newBG = `linear-gradient(0deg, ${color} 0%, ${color} 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.44) 39%, rgba(0, 0, 0, 0.88) 100%)`;
        $("body").css({background:newBG});
    });
}

function swipeSong(i, songs, save) {
    
    if (save) {
        addLiked(songs[i])
    }
    i++;
    if (i >= songs.length) {
        //Hide Card Element
        card.style.display = 'none';
        $('#completed').show();
    } else {
        setCard(songs[i]);
    }
    
    dummy.style.transform = 'translateX(' + (save ? '100%' : '-200%') + ')';
    dummy.style.transition = 'transform 0.5s ease-out';
    
    setTimeout(() => {
        dummy.style.transform = '';
        dummy.style.transition = '';
        dummy.innerHTML = "";
    }, 300);
    return i;
}

function undoSwipe(i, songs) {
    card.style.transition = '';
    i = Math.max(i-1, 0);
    card.style.left = '-100%'
    
    setTimeout(() => {
        setCard(songs[i]);
        card.style.transition = 'left 0.5s ease-in';
        card.style.left = '50%'
        dummy.innerHTML = "";
    }, 0);

    return i;
}

function showLiked() {
    $('#main').addClass('blur');
    console.info('showLiked')
    document.getElementById("savedSongsList").innerHTML = "";
    $('.saveButton').show();
    document.getElementById('overlay').classList.add('active');
    document.getElementById('overlayExit').style.display = 'block';
    // $('.saveButton').css('display', 'inline-block');
    var saved = JSON.parse(localStorage["savedSongs"]);;
    for (let i in saved) {
        var song = saved[i];
        var songBox = document.createElement("div");
        songBox.className = "savedInfo";
        songBox.id = "saved" + i;
        var cover = document.createElement("img");
        cover.src = song.album.images[1].url;
        cover.className = "savedTile";
        cover.dataset.id = i;
        cover.onclick = function () { removeLiked(this) };
        songBox.appendChild(cover);
        var songInfo = document.createElement("div");
        songInfo.className = "savedSongInfo";
        songInfo.innerHTML += song.name + "<br>";
        songInfo.innerHTML += song.artists[0].name;
        songBox.appendChild(songInfo);
        document.getElementById("savedSongsList").appendChild(songBox);
    }
    document.getElementById("overlayExit").onclick = closeLiked;
}

function addLiked(song) {
    if (!uriSet.has(song.uri)) {
        uriSet.add(song.uri);
        savedSongs.push(song);
        localStorage['savedSongs'] = JSON.stringify(savedSongs);
        localStorage['uriSet'] = JSON.stringify(Array.from(uriSet));
    }
}
function removeLiked(song) {
    const i = song.dataset.id;
    console.log(i);
    uriSet.delete(savedSongs.splice(i, 1)[0].uri);
    localStorage["savedSongs"] = JSON.stringify(savedSongs);
    localStorage["uriSet"] = JSON.stringify(Array.from(uriSet));
    showLiked();
}

function saveLikes() {
    var songIds = savedSongs.map(obj => obj.id).join(',');
    var access_token = localStorage["token"];
    // APIController.saveSongs(access_token, songIds);
    console.log("Saved to Account");
}

function closeLiked() {
    console.info('hideLiked')
    $('#main').removeClass('blur');
    document.getElementById("openOverlay").onclick = showLiked;
    $('.saveButton').hide();
    document.getElementById('overlay').classList.remove('active');
    $("#overlayExit").hide();
}
