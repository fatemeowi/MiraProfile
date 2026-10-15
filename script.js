
// ============================
// SUPABASE CONNECTION
// ============================

const SUPABASE_URL = "https://userdczmkcbgdwqctjjq.supabase.co";
const SUPABASE_KEY = "sb_publishable_jHiTWqV9hQtVGGaCMAM-tQ_loQxL0hL";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================
// DARK / LIGHT MODE
// ============================

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeText = document.getElementById("theme-text");

function setTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark", isDark);

    if (themeIcon) {
        themeIcon.textContent = isDark ? "☀" : "☾";
    }

    if (themeText) {
        themeText.textContent = isDark ? "Light mode" : "Dark mode";
    }

    localStorage.setItem("mira-theme", theme);
}

const savedTheme = localStorage.getItem("mira-theme");

setTheme(
    savedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark")
            ? "light"
            : "dark";

        setTheme(nextTheme);
    });
}


// ============================
// MUSIC PLAYLIST
// ============================

const songs = [
    {
        title: "Fuck My Computer",
        artist: "Ninajirachi",
        file: "music/m1.mp3"
    },
    {
        title: "Virgin mary",
        artist: "Dissonance",
        file: "music/m2.mp3"
    },
    {
        title: "Paint It Black",
        artist: "The Rolling Stones",
        file: "music/m3.mp3"
    },
    {
        title: "the kill 2",
        artist: "Lex Amarni",
        file: "music/m4.mp3"
    },
    {
        title: "Open ur mouth",
        artist: "Soyrica",
        file: "music/m5.mp3"
    },
    {
        title: "FEED",
        artist: "Suzy Clue",
        file: "music/m6.mp3"
    }
];

const playlist = document.getElementById("playlist");

function renderPlaylist() {
    if (!playlist) return;

    playlist.replaceChildren();

    if (songs.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-playlist";
        empty.textContent =
            "Your playlist is waiting for its first song. ♡";

        playlist.appendChild(empty);
        return;
    }

    songs.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.className = "song";

        const cover = document.createElement("div");
        cover.className = "song-cover";
        cover.textContent = ["♫", "♡", "✧", "☁"][index % 4];

        const info = document.createElement("div");
        info.className = "song-info";

        const title = document.createElement("div");
        title.className = "song-title";
        title.textContent = song.title;

        const artist = document.createElement("div");
        artist.className = "song-artist";
        artist.textContent = song.artist;

        info.append(title, artist);

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "none";
        audio.src = song.file;
        audio.setAttribute("aria-label", `Play ${song.title}`);

        audio.addEventListener("play", () => {
            document.querySelectorAll(".song audio").forEach(otherAudio => {
                if (otherAudio !== audio) {
                    otherAudio.pause();
                }
            });
        });

        songElement.append(cover, info, audio);
        playlist.appendChild(songElement);
    });
}

renderPlaylist();


// ============================
// GUESTBOOK / SUPABASE
// ============================

const form = document.getElementById("comment-form");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const commentsList = document.getElementById("comments-list");
const commentCount = document.getElementById("comment-count");
const charCount = document.getElementById("char-count");
const feedback = document.getElementById("feedback");

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function renderComments(comments) {
    if (!commentsList || !commentCount) return;

    commentCount.textContent = comments.length;
    commentsList.replaceChildren();

    if (comments.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-comments";
        empty.textContent =
            "No notes yet. Be the first to leave a little message! ♡";

        commentsList.appendChild(empty);
        return;
    }

    comments.forEach(comment => {
        const card = document.createElement("article");
        card.className = "comment";

        const header = document.createElement("div");
        header.className = "comment-header";

        const author = document.createElement("span");
        author.className = "comment-name";
        author.textContent = `${comment.name} ♡`;

        const date = document.createElement("time");
        date.className = "comment-date";
        date.textContent = formatDate(comment.created_at);

        header.append(author, date);

        const message = document.createElement("p");
        message.className = "comment-message";
        message.textContent = comment.message;

        card.append(header, message);
        commentsList.appendChild(card);
    });
}

async function loadComments() {
    if (!commentsList) return;

    commentsList.textContent = "Loading messages...";

    try {
        const { data, error } = await supabaseClient
            .from("guestbook")
            .select("name, message, created_at")
            .order("created_at", { ascending: false });

        if (error) throw error;

        renderComments(data || []);
    } catch (error) {
        commentsList.textContent =
            "Couldn't load messages. Please try again.";

        console.error("Load comments error:", error);
    }
}


// Character counter

if (messageInput && charCount) {
    messageInput.addEventListener("input", () => {
        charCount.textContent = `${messageInput.value.length} / 500`;
    });
}


// Submit a new comment

if (form && nameInput && messageInput) {
    form.addEventListener("submit", async event => {
        event.preventDefault();

        const name = nameInput.value.trim().slice(0, 40);
        const message = messageInput.value.trim().slice(0, 500);

        if (!name || !message) {
            if (feedback) {
                feedback.textContent =
                    "Please fill in both fields. ♡";
            }
            return;
        }

        const submitButton = form.querySelector('[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
        }

        if (feedback) {
            feedback.textContent = "Saving your little note...";
        }

        try {
            const { error } = await supabaseClient
                .from("guestbook")
                .insert([{ name, message }]);

            if (error) throw error;

            form.reset();

            if (charCount) {
                charCount.textContent = "0 / 500";
            }

            if (feedback) {
                feedback.textContent =
                    "Your little note has been saved. Thank you! ♡";
            }

            await loadComments();

        } catch (error) {
            if (feedback) {
                feedback.textContent =
                    "Couldn't save your message. Please try again.";
            }

            console.error("Save comment error:", error);

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


// Load saved comments when the page opens

loadComments();