/* =========================================================
   CHESS MASTER APPLICATION
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const defaultStats = {

    games: 0,
    wins: 0,
    losses: 0,
    draws: 0

};


function getStats() {

    return JSON.parse(
        localStorage.getItem(
            "chessMasterStats"
        )
    ) || {
        ...defaultStats
    };

}


function saveStats(stats) {

    localStorage.setItem(
        "chessMasterStats",
        JSON.stringify(stats)
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function openSection(
    sectionName
) {

    document
        .querySelectorAll(".section")
        .forEach(
            section => {

                section.classList.remove(
                    "active"
                );

            }
        );


    const section =
        document.getElementById(
            sectionName
        );


    if (section) {

        section.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-button")
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    sectionName
                );

            }
        );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   NAV BUTTONS
========================================================= */

document
    .querySelectorAll(".nav-button")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.section
                    );

                }
            );

        }
    );


/* =========================================================
   HOME BUTTONS
========================================================= */

document
    .getElementById(
        "playGameButton"
    )
    .addEventListener(
        "click",
        () => {

            openSection("play");

            startSelectedGame();

        }
    );


document
    .getElementById(
        "quickPlayButton"
    )
    .addEventListener(
        "click",
        () => {

            openSection("play");

            startSelectedGame();

        }
    );


document
    .getElementById(
        "computerGameButton"
    )
    .addEventListener(
        "click",
        () => {

            openSection("play");

        }
    );


document
    .getElementById(
        "academyButton"
    )
    .addEventListener(
        "click",
        () => {

            openSection("academy");

        }
    );


document
    .getElementById(
        "puzzleButton"
    )
    .addEventListener(
        "click",
        () => {

            openSection("puzzles");

        }
    );


/* =========================================================
   COLOR SELECTION
========================================================= */

let selectedColor =
    localStorage.getItem(
        "chessColor"
    ) || "white";


document
    .querySelectorAll(
        ".color-option"
    )
    .forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.color ===
                selectedColor
            );


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".color-option"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    selectedColor =
                        button.dataset.color;


                    localStorage.setItem(
                        "chessColor",
                        selectedColor
                    );

                }
            );

        }
    );


function startSelectedGame() {

    if (
        window.setPlayerColor
    ) {

        window.setPlayerColor(
            selectedColor
        );

    }

}


/* =========================================================
   TIME CONTROL
========================================================= */

let selectedMinutes = 1;

let selectedIncrement = 0;

let whiteTime = 60;

let blackTime = 60;

let clockInterval = null;


document
    .querySelectorAll(
        ".time-option"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".time-option"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    selectedMinutes =
                        parseInt(
                            button.dataset.minutes
                        );


                    selectedIncrement =
                        parseInt(
                            button.dataset.increment
                        );


                    if (
                        window.newGame
                    ) {

                        window.newGame();

                    }

                }
            );

        }
    );


function resetChessClock() {

    stopChessClock();


    whiteTime =
        selectedMinutes * 60;

    blackTime =
        selectedMinutes * 60;


    renderClocks();

    updateActiveClock();

}


function renderClocks() {

    document.getElementById(
        "whiteClock"
    ).textContent =
        formatTime(
            whiteTime
        );


    document.getElementById(
        "blackClock"
    ).textContent =
        formatTime(
            blackTime
        );

}


function formatTime(
    seconds
) {

    seconds =
        Math.max(
            0,
            seconds
        );


    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2,"0") +
        ":" +
        String(secs)
            .padStart(2,"0")
    );

}


function updateActiveClock() {

    const white =
        document.getElementById(
            "whiteClock"
        );

    const black =
        document.getElementById(
            "blackClock"
        );


    white.classList.remove(
        "active"
    );

    black.classList.remove(
        "active"
    );


    if (
        typeof turn !== "undefined"
    ) {

        if (
            turn === "w"
        ) {

            white.classList.add(
                "active"
            );

        } else {

            black.classList.add(
                "active"
            );

        }

    }

}


function startChessClock() {

    stopChessClock();


    clockInterval =
        setInterval(
            () => {

                if (
                    typeof gameOver !==
                    "undefined" &&
                    gameOver
                ) {

                    return;

                }


                if (
                    typeof turn ===
                    "undefined"
                ) return;


                if (
                    turn === "w"
                ) {

                    whiteTime--;

                } else {

                    blackTime--;

                }


                renderClocks();

                updateActiveClock();


                if (
                    whiteTime <= 0
                ) {

                    window.finishGame?.(
                        "loss",
                        "Your time ran out."
                    );

                    stopChessClock();

                }


                if (
                    blackTime <= 0
                ) {

                    window.finishGame?.(
                        "win",
                        "Computer's time ran out."
                    );

                    stopChessClock();

                }

            },
            1000
        );

}


function stopChessClock() {

    if (clockInterval) {

        clearInterval(
            clockInterval
        );

        clockInterval = null;

    }

}


function addChessTime(
    color
) {

    if (
        selectedIncrement <= 0
    ) return;


    if (
        color === "w"
    ) {

        whiteTime +=
            selectedIncrement;

    } else {

        blackTime +=
            selectedIncrement;

    }


    renderClocks();

}


/* =========================================================
   HOOKS USED BY CHESS ENGINE
========================================================= */

window.resetChessClock =
    resetChessClock;

window.stopChessClock =
    stopChessClock;

window.addChessTime =
    addChessTime;


/* =========================================================
   NEW GAME
========================================================= */

document
    .getElementById(
        "newGame"
    )
    .addEventListener(
        "click",
        () => {

            selectedColor =
                document.querySelector(
                    ".color-option.active"
                )?.dataset.color ||
                "white";


            if (
                window.setPlayerColor
            ) {

                window.setPlayerColor(
                    selectedColor
                );

            }

        }
    );


/* =========================================================
   FLIP
========================================================= */

document
    .getElementById(
        "flipBoard"
    )
    .addEventListener(
        "click",
        () => {

            window.flipBoard?.();

        }
    );


/* =========================================================
   UNDO
========================================================= */

document
    .getElementById(
        "undoMove"
    )
    .addEventListener(
        "click",
        () => {

            window.undoMove?.();

        }
    );


/* =========================================================
   RESIGN
========================================================= */

document
    .getElementById(
        "resignGame"
    )
    .addEventListener(
        "click",
        () => {

            if (
                confirm(
                    "Are you sure you want to resign?"
                )
            ) {

                window.resignGame?.();

            }

        }
    );


/* =========================================================
   DRAW
========================================================= */

document
    .getElementById(
        "drawGame"
    )
    .addEventListener(
        "click",
        () => {

            if (
                confirm(
                    "Offer a draw?"
                )
            ) {

                window.offerDraw?.();

            }

        }
    );


/* =========================================================
   RESULT MODAL
========================================================= */

document
    .getElementById(
        "rematchButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "resultModal"
                )
                .classList.add(
                    "hidden"
                );


            startSelectedGame();

        }
    );


document
    .getElementById(
        "homeButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "resultModal"
                )
                .classList.add(
                    "hidden"
                );


            openSection(
                "home"
            );

        }
    );


/* =========================================================
   GAME RESULTS
========================================================= */

function saveGameResult(
    result
) {

    const stats =
        getStats();


    stats.games++;


    if (
        result === "win"
    ) {

        stats.wins++;

    }

    else if (
        result === "loss"
    ) {

        stats.losses++;

    }

    else {

        stats.draws++;

    }


    saveStats(
        stats
    );


    updateStatistics();

}


window.saveGameResult =
    saveGameResult;


function updateStatistics() {

    const stats =
        getStats();


    document.getElementById(
        "games"
    ).textContent =
        stats.games;


    document.getElementById(
        "wins"
    ).textContent =
        stats.wins;


    document.getElementById(
        "losses"
    ).textContent =
        stats.losses;


    document.getElementById(
        "draws"
    ).textContent =
        stats.draws;


    document.getElementById(
        "homeGames"
    ).textContent =
        stats.games;


    document.getElementById(
        "homeWins"
    ).textContent =
        stats.wins;

}


/* =========================================================
   DIFFICULTY DISPLAY
========================================================= */

document
    .getElementById(
        "difficulty"
    )
    .addEventListener(
        "change",
        event => {

            const text =
                event.target
                    .options[
                        event.target.selectedIndex
                    ]
                    .textContent;


            document.getElementById(
                "sideDifficulty"
            ).textContent =
                text;


            document.getElementById(
                "blackLevel"
            ).textContent =
                event.target.value;

        }
    );


/* =========================================================
   PUZZLES
========================================================= */

let puzzlesSolved =
    parseInt(
        localStorage.getItem(
            "puzzlesSolved"
        ) || "0"
    );

let puzzleStreak =
    parseInt(
        localStorage.getItem(
            "puzzleStreak"
        ) || "0"
    );


function updatePuzzleStats() {

    document.getElementById(
        "puzzlesSolved"
    ).textContent =
        puzzlesSolved;


    document.getElementById(
        "puzzleStreak"
    ).textContent =
        puzzleStreak;

}


document
    .getElementById(
        "completePuzzle"
    )
    .addEventListener(
        "click",
        () => {

            puzzlesSolved++;

            puzzleStreak++;


            localStorage.setItem(
                "puzzlesSolved",
                puzzlesSolved
            );


            localStorage.setItem(
                "puzzleStreak",
                puzzleStreak
            );


            document.getElementById(
                "puzzleStatus"
            ).textContent =
                "✓ Excellent! Puzzle solved.";


            updatePuzzleStats();

        }
    );


/* =========================================================
   ACADEMY
========================================================= */

const lessons =
    document.querySelectorAll(
        ".lesson"
    );


let completedLessons =
    JSON.parse(
        localStorage.getItem(
            "completedLessons"
        ) || "[]"
    );


function updateAcademy() {

    lessons.forEach(
        lesson => {

            const id =
                parseInt(
                    lesson.dataset.lesson
                );


            if (
                completedLessons.includes(
                    id
                )
            ) {

                lesson.classList.add(
                    "completed"
                );


                lesson.querySelector(
                    "button"
                ).textContent =
                    "✓ Completed";

            }

        }
    );


    const percentage =
        Math.round(
            (
                completedLessons.length /
                lessons.length
            ) * 100
        );


    document.getElementById(
        "academyProgressText"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "academyProgressBar"
    ).style.width =
        percentage + "%";


    document.getElementById(
        "homeAcademy"
    ).textContent =
        percentage + "%";

}


lessons.forEach(
    lesson => {

        lesson.querySelector(
            "button"
        ).addEventListener(
            "click",
            () => {

                const id =
                    parseInt(
                        lesson.dataset.lesson
                    );


                if (
                    !completedLessons.includes(
                        id
                    )
                ) {

                    completedLessons.push(
                        id
                    );


                    localStorage.setItem(
                        "completedLessons",
                        JSON.stringify(
                            completedLessons
                        )
                    );

                }


                updateAcademy();

            }
        );

    }
);


/* =========================================================
   SETTINGS
========================================================= */

document
    .getElementById(
        "coordinatesToggle"
    )
    .addEventListener(
        "change",
        event => {

            document.body.classList.toggle(
                "hide-coordinates",
                !event.target.checked
            );

        }
    );


document
    .getElementById(
        "animationToggle"
    )
    .addEventListener(
        "change",
        event => {

            document.body.classList.toggle(
                "no-animation",
                !event.target.checked
            );

        }
    );


/* =========================================================
   PWA
========================================================= */

let deferredInstallPrompt = null;


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt =
            event;


        document
            .getElementById(
                "installButton"
            )
            .classList.remove(
                "hidden"
            );

    }
);


document
    .getElementById(
        "installButton"
    )
    .addEventListener(
        "click",
        async () => {

            if (
                !deferredInstallPrompt
            ) return;


            deferredInstallPrompt.prompt();


            await deferredInstallPrompt.userChoice;


            deferredInstallPrompt =
                null;


            document
                .getElementById(
                    "installButton"
                )
                .classList.add(
                    "hidden"
                );

        }
    );


if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker.register(
                "/static/service-worker.js"
            );

        }
    );

}


/* =========================================================
   START
========================================================= */

updateStatistics();

updatePuzzleStats();

updateAcademy();

resetChessClock();

renderClocks();

updateActiveClock();
