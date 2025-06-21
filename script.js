console.log("hi");

let currentSong = new Audio();
let songs;
let currFolder;
const play = document.getElementById("play");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`songs/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (const element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";

    for (const song of songs) {
        songUl.innerHTML += `
        <li>
            <i class="fa-solid fa-music flex align-center justify-center"></i>
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>SURAJ</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <i class="fa-solid fa-play"></i>
            </div>    
        </li>`;
    }

    Array.from(songUl.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info div").innerText;
            playMusic(track);
        });
    });

    return songs;
}

function playMusic(track) {
    currentSong.src = `songs/${currFolder}/${track}`;
    currentSong.play();

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    play.classList.remove("fa-play");
    play.classList.add("fa-pause");
}

async function displayAlbums() {
    let res = await fetch(`songs/`);
    let html = await res.text();
    let parser = document.createElement("div");
    parser.innerHTML = html;

    let anchors = parser.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let a of anchors) {
        let href = a.getAttribute("href");
        if (href && href.endsWith("/")) {
            let folder = href.replace(/\//g, "");

            try {
              let infoRes = await fetch(`songs/boom/${folder}/info.json`);

                if (!infoRes.ok) continue;

                let album = await infoRes.json();
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="circle-container">
                            <i class="fa-solid fa-play"></i>
                        </div>
                      <img src="songs/boom/${folder}/cover.jpeg" alt="${album.title}">

                        <h2>${album.title}</h2>
                        <p>${album.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`Error in folder ${folder}:`, err);
            }
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(item.currentTarget.dataset.folder);
        });
    });
}

async function main() {
    await getsongs("boom");
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.classList.remove("fa-play");
            play.classList.add("fa-pause");
        } else {
            currentSong.pause();
            play.classList.remove("fa-pause");
            play.classList.add("fa-play");
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerText =
                `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });
}

main();
