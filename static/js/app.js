/* ================= NAVIGATION ================= */

document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(".nav-button")
                .forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );


            document
                .querySelectorAll(".section")
                .forEach(
                    section =>
                        section.classList.remove(
                            "active"
                        )
                );


            button.classList.add(
                "active"
            );


            document
                .getElementById(
                    button.dataset.section
                )
                .classList.add(
                    "active"
                );

        };

    });


/* ================= NEW GAME ================= */

document
    .getElementById("newGame")
    .onclick = () => {

        newChessGame();

    };


/* ================= RESIGN ================= */

document
    .getElementById("resignGame")
    .onclick = () => {

        if (gameOver)
            return;


        gameOver = true;


        document
            .getElementById(
                "gameStatus"
            )
            .textContent =
                "You Resigned — Computer Wins";


        saveResult("loss");

    };


/* ================= UNDO ================= */

document
    .getElementById("undoMove")
    .onclick = () => {

        alert(
            "Undo system can be expanded with full board-state snapshots."
        );

    };


/* ================= PUZZLE ================= */

document
    .getElementById(
        "completePuzzle"
    )
    .onclick = () => {

        localStorage.setItem(
            "puzzleCompleted",
            "true"
        );


        document
            .getElementById(
                "puzzleStatus"
            )
            .textContent =
                "Puzzle completed ✓";

    };


if (
    localStorage.getItem(
        "puzzleCompleted"
    )
) {

    document
        .getElementById(
            "puzzleStatus"
        )
        .textContent =
            "Puzzle completed ✓";

}


/* ================= PWA ================= */

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
            .hidden = false;

    }
);


document
    .getElementById(
        "installButton"
    )
    .onclick = async () => {

        if (!deferredInstallPrompt)
            return;


        deferredInstallPrompt.prompt();


        await deferredInstallPrompt.userChoice;


        deferredInstallPrompt =
            null;

    };


/* ================= SERVICE WORKER ================= */

if (
    "serviceWorker"
    in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator
                .serviceWorker
                .register(
                    "/static/service-worker.js"
                );

        }
    );

}
