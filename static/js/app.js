/* =========================================================
   APP CONTROLLER
========================================================= */


/* =========================================================
   PLAYER COLOR
========================================================= */

let selectedPlayerColor = "w";


document.querySelectorAll(
    ".color-choice"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".color-choice"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                selectedPlayerColor =
                    button.dataset.color;


                /*
                   DO NOT START THE GAME
                   HERE.

                   We only select the color.
                   User must press Start Game.
                */

                const playerColorText =
                    document.getElementById(
                        "playerColorText"
                    );


                if (
                    playerColorText
                ) {

                    playerColorText.textContent =
                        selectedPlayerColor === "w"
                            ? "White"
                            : "Black";

                }

            }
        );

    }
);


/* =========================================================
   START GAME BUTTON
========================================================= */

document.getElementById(
    "startGame"
)?.addEventListener(
    "click",
    () => {

        const difficultySelect =
            document.getElementById(
                "difficulty"
            );


        if (
            difficultySelect
        ) {

            window.difficulty =
                Number(
                    difficultySelect.value
                );

        }


        /*
           THIS IS THE IMPORTANT PART.

           The selected color is explicitly
           passed to newGame().
        */

        newGame(
            selectedPlayerColor
        );

    }
);


/* =========================================================
   NEW GAME BUTTON
========================================================= */

document.getElementById(
    "newGame"
)?.addEventListener(
    "click",
    () => {

        newGame(
            selectedPlayerColor
        );

    }
);


/* =========================================================
   UNDO
========================================================= */

document.getElementById(
    "undoMove"
)?.addEventListener(
    "click",
    () => {

        undoMove();

    }
);


/* =========================================================
   FLIP BOARD
========================================================= */

document.getElementById(
    "flipBoard"
)?.addEventListener(
    "click",
    () => {

        flipBoard();

    }
);


/* =========================================================
   RESIGN
========================================================= */

document.getElementById(
    "resignGame"
)?.addEventListener(
    "click",
    () => {

        if (
            confirm(
                "Are you sure you want to resign?"
            )
        ) {

            resignGame();

        }

    }
);


/* =========================================================
   MODAL NEW GAME
========================================================= */

document.getElementById(
    "modalNewGame"
)?.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "gameModal"
            )
            .classList.remove(
                "show"
            );


        newGame(
            selectedPlayerColor
        );

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

document.querySelectorAll(
    ".nav-button"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;


                document
                    .querySelectorAll(
                        ".nav-button"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(
                        ".section"
                    )
                    .forEach(
                        section =>
                            section.classList.remove(
                                "active"
                            )
                    );


                document
                    .getElementById(
                        target
                    )
                    ?.classList.add(
                        "active"
                    );

            }
        );

    }
);


/* =========================================================
   CHESS CLOCK
========================================================= */

let whiteTime = 600;

let blackTime = 600;

let clockInterval = null;


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
            .padStart(2, "0")
        +
        ":"
        +
        String(secs)
            .padStart(2, "0")
    );

}


function updateClockDisplay() {

    const whiteClock =
        document.getElementById(
            "whiteClock"
        );

    const blackClock =
        document.getElementById(
            "blackClock"
        );


    if (
        whiteClock
    ) {

        whiteClock.textContent =
            formatTime(
                whiteTime
            );

    }


    if (
        blackClock
    ) {

        blackClock.textContent =
            formatTime(
                blackTime
            );

    }

}


function updateActiveClock(
    currentTurn
) {

    const whiteClock =
        document.getElementById(
            "whiteClock"
        );

    const blackClock =
        document.getElementById(
            "blackClock"
        );


    whiteClock?.classList.remove(
        "active-clock"
    );

    blackClock?.classList.remove(
        "active-clock"
    );


    if (
        currentTurn === "w"
    ) {

        whiteClock?.classList.add(
            "active-clock"
        );

    } else {

        blackClock?.classList.add(
            "active-clock"
        );

    }

}


function resetChessClock() {

    clearInterval(
        clockInterval
    );


    whiteTime = 600;

    blackTime = 600;


    updateClockDisplay();

    updateActiveClock(
        "w"
    );


    clockInterval =
        setInterval(
            () => {

                /*
                   'turn' comes from chess.js.
                */

                if (
                    typeof turn ===
                    "undefined" ||
                    gameOver
                ) {

                    return;

                }


                if (
                    turn === "w"
                ) {

                    whiteTime--;

                } else {

                    blackTime--;

                }


                updateClockDisplay();

                updateActiveClock(
                    turn
                );


                if (
                    whiteTime <= 0
                ) {

                    clearInterval(
                        clockInterval
                    );

                    gameOver = true;


                    if (
                        playerColor === "w"
                    ) {

                        finishGame(
                            "loss",
                            "Time Out",
                            "Your time has run out."
                        );

                    } else {

                        finishGame(
                            "win",
                            "You Win!",
                            "The computer ran out of time."
                        );

                    }

                }


                if (
                    blackTime <= 0
                ) {

                    clearInterval(
                        clockInterval
                    );

                    gameOver = true;


                    if (
                        playerColor === "b"
                    ) {

                        finishGame(
                            "loss",
                            "Time Out",
                            "Your time has run out."
                        );

                    } else {

                        finishGame(
                            "win",
                            "You Win!",
                            "The computer ran out of time."
                        );

                    }

                }

            },
            1000
        );

}


function switchChessClock(
    currentTurn
) {

    updateActiveClock(
        currentTurn
    );

}


function stopChessClock() {

    clearInterval(
        clockInterval
    );

}


window.resetChessClock =
    resetChessClock;

window.switchChessClock =
    switchChessClock;

window.stopChessClock =
    stopChessClock;


/* =========================================================
   ACADEMY
========================================================= */

const lessons = [

    {
        title: "The Chess Board",
        description:
            "Learn the board, ranks, files, squares and starting position."
    },

    {
        title: "How Pieces Move",
        description:
            "Learn the movement of the king, queen, rook, bishop, knight and pawn."
    },

    {
        title: "Capturing Pieces",
        description:
            "Understand how captures work and how to recognize valuable targets."
    },

    {
        title: "Check & Checkmate",
        description:
            "Learn check, checkmate, escape squares and basic king safety."
    },

    {
        title: "Opening Principles",
        description:
            "Control the centre, develop pieces and get your king safe."
    },

    {
        title: "Piece Value",
        description:
            "Understand material values and learn when exchanges are good."
    },

    {
        title: "Tactics",
        description:
            "Learn forks, pins, skewers, discovered attacks and double attacks."
    },

    {
        title: "Chess Strategy",
        description:
            "Understand pawn structure, weak squares, outposts and plans."
    },

    {
        title: "Endgames",
        description:
            "Learn king and pawn endings, opposition and basic rook endings."
    },

    {
        title: "Calculation",
        description:
            "Learn how strong players calculate variations before moving."
    },

    {
        title: "Advanced Strategy",
        description:
            "Improve positional understanding and long-term planning."
    },

    {
        title: "Master Level",
        description:
            "Study advanced calculation, positional play and practical chess."
    }

];


function getLessonProgress() {

    return JSON.parse(
        localStorage.getItem(
            "chessLessonProgress"
        ) ||
        "[]"
    );

}


function saveLessonProgress(
    progress
) {

    localStorage.setItem(
        "chessLessonProgress",
        JSON.stringify(
            progress
        )
    );

}


function renderLessons() {

    const container =
        document.getElementById(
            "lessonContainer"
        );


    if (!container) {
        return;
    }


    const progress =
        getLessonProgress();


    container.innerHTML = "";


    lessons.forEach(
        (
            lesson,
            index
        ) => {

            const completed =
                progress.includes(
                    index
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "lesson" +
                (
                    completed
                        ? " completed"
                        : ""
                );


            card.innerHTML = `

                <div class="lesson-number">
                    LESSON ${String(index + 1).padStart(2, "0")}
                </div>

                <h3>
                    ${lesson.title}
                </h3>

                <p>
                    ${lesson.description}
                </p>

                <button>
                    ${
                        completed
                            ? "✓ Completed"
                            : "Mark Complete"
                    }
                </button>

            `;


            card
                .querySelector(
                    "button"
                )
                .addEventListener(
                    "click",
                    () => {

                        const current =
                            getLessonProgress();


                        if (
                            current.includes(
                                index
                            )
                        ) {

                            return;

                        }


                        current.push(
                            index
                        );


                        saveLessonProgress(
                            current
                        );


                        renderLessons();

                        updateAcademyProgress();

                    }
                );


            container.appendChild(
                card
            );

        }
    );

}


function updateAcademyProgress() {

    const completed =
        getLessonProgress()
            .length;


    const percentage =
        Math.round(
            (
                completed /
                lessons.length
            ) * 100
        );


    const progress =
        document.getElementById(
            "academyProgress"
        );


    const text =
        document.getElementById(
            "academyProgressText"
        );


    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }


    if (text) {

        text.textContent =
            `${percentage}%`;

    }

}


/* =========================================================
   PWA INSTALL
========================================================= */

let deferredInstallPrompt = null;


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt =
            event;


        const button =
            document.getElementById(
                "installButton"
            );


        if (button) {

            button.style.display =
                "block";

        }

    }
);


document.getElementById(
    "installButton"
)?.addEventListener(
    "click",
    async () => {

        if (
            !deferredInstallPrompt
        ) {
            return;
        }


        deferredInstallPrompt.prompt();


        await deferredInstallPrompt
            .userChoice;


        deferredInstallPrompt =
            null;


        document.getElementById(
            "installButton"
        ).style.display =
            "none";

    }
);


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderLessons();

        updateAcademyProgress();

        updateClockDisplay();

    }
);
