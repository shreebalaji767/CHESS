/* =========================================================
   MAIN APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);


const App = {

    boardElement: null,

    playerColor: "w",

    difficulty: 3,

    boardFlipped: false,

    gameRunning: false,

    aiThinking: false,

    moveHistory: [],

    capturedWhite: [],

    capturedBlack: [],

    stats: {
        games: 0,
        wins: 0,
        losses: 0,
        draws: 0
    },

    clocks: {
        w: 600,
        b: 600
    },

    clockInterval: null,

    activeClock: "w",

    deferredInstallPrompt: null,


    init() {

        this.boardElement =
            document.getElementById(
                "chessBoard"
            );

        this.loadStats();

        this.bindNavigation();

        this.bindGameControls();

        this.bindInstall();

        this.startNewGame();

    },


    /* =====================================================
       NAVIGATION
    ===================================================== */

    bindNavigation() {

        const buttons =
            document.querySelectorAll(
                ".nav-button"
            );

        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset.section;

                        buttons.forEach(
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
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        const target =
                            document.getElementById(
                                section
                            );

                        if (target) {

                            target.classList.add(
                                "active"
                            );

                        }

                    }
                );

            }
        );

    },


    /* =====================================================
       GAME CONTROLS
    ===================================================== */

    bindGameControls() {

        document
            .getElementById("startGame")
            .addEventListener(
                "click",
                () => {

                    this.startNewGame();

                }
            );


        document
            .getElementById("newGame")
            .addEventListener(
                "click",
                () => {

                    this.startNewGame();

                }
            );


        document
            .getElementById("undoMove")
            .addEventListener(
                "click",
                () => {

                    this.undo();

                }
            );


        document
            .getElementById("resignGame")
            .addEventListener(
                "click",
                () => {

                    this.resign();

                }
            );

    },


    /* =====================================================
       NEW GAME
    ===================================================== */

    startNewGame() {

        this.stopClock();

        const colorSelect =
            document.getElementById(
                "playerColor"
            );

        const difficultySelect =
            document.getElementById(
                "difficulty"
            );


        this.playerColor =
            colorSelect.value;

        this.difficulty =
            Number(
                difficultySelect.value
            );


        /*
         * THIS IS THE IMPORTANT FIX:
         *
         * The selected player color is passed
         * directly into the chess engine.
         */

        ChessGame.init(
            this.playerColor
        );


        this.gameRunning = true;

        this.aiThinking = false;

        this.moveHistory = [];

        this.capturedWhite = [];

        this.capturedBlack = [];

        this.clocks.w = 600;

        this.clocks.b = 600;

        this.activeClock = "w";


        /*
         * Flip board when user chooses Black.
         */

        this.boardFlipped =
            this.playerColor === "b";


        this.updatePlayerLabels();

        this.renderBoard();

        this.renderMoves();

        this.updateMaterial();

        this.updateStatus();

        this.updateClocks();

        this.startClock();


        /*
         * If user selected BLACK,
         * computer is WHITE and must move first.
         */

        if (
            this.playerColor === "b"
        ) {

            this.setStatus(
                "Computer is thinking..."
            );

            this.aiThinking = true;

            setTimeout(
                () => {

                    this.computerMove();

                },
                600
            );

        }

    },


    /* =====================================================
       LABELS
    ===================================================== */

    updatePlayerLabels() {

        const playerLabel =
            document.getElementById(
                "playerLabel"
            );

        const computerLabel =
            document.getElementById(
                "computerLabel"
            );


        if (
            this.playerColor === "w"
        ) {

            playerLabel.textContent =
                "White";

            computerLabel.textContent =
                "Black • Computer";

        } else {

            playerLabel.textContent =
                "Black";

            computerLabel.textContent =
                "White • Computer";

        }

    },


    /* =====================================================
       BOARD
    ===================================================== */

    renderBoard() {

        this.boardElement.innerHTML = "";


        let rows = [
            0, 1, 2, 3, 4, 5, 6, 7
        ];

        let cols = [
            0, 1, 2, 3, 4, 5, 6, 7
        ];


        if (
            this.boardFlipped
        ) {

            rows.reverse();

            cols.reverse();

        }


        const legalMoves =
            ChessGame.getLegalMoves(
                ChessGame.turn
            );


        for (
            const r of rows
        ) {

            for (
                const c of cols
            ) {

                const square =
                    document.createElement(
                        "div"
                    );


                square.className =
                    "square " +
                    (
                        (r + c) % 2 === 0
                            ? "light-square"
                            : "dark-square"
                    );


                square.dataset.row = r;

                square.dataset.col = c;


                /*
                 * Coordinates
                 */

                const file =
                    document.createElement(
                        "span"
                    );

                file.className =
                    "coordinate-file";

                file.textContent =
                    FILES_SAFE[c];


                const rank =
                    document.createElement(
                        "span"
                    );

                rank.className =
                    "coordinate-rank";

                rank.textContent =
                    8 - r;


                square.appendChild(
                    file
                );

                square.appendChild(
                    rank
                );


                /*
                 * Selected
                 */

                if (
                    ChessGame.selected &&
                    ChessGame.selected.r === r &&
                    ChessGame.selected.c === c
                ) {

                    square.classList.add(
                        "selected"
                    );

                }


                /*
                 * Last move
                 */

                const last =
                    ChessGame.history[
                        ChessGame.history.length - 1
                    ];


                if (last) {

                    if (
                        (
                            last.move.from.r === r &&
                            last.move.from.c === c
                        ) ||
                        (
                            last.move.to.r === r &&
                            last.move.to.c === c
                        )
                    ) {

                        square.classList.add(
                            "last-move"
                        );

                    }

                }


                /*
                 * Legal destination
                 */

                if (
                    ChessGame.selected
                ) {

                    const possible =
                        legalMoves.some(
                            move =>
                                move.from.r ===
                                    ChessGame.selected.r &&
                                move.from.c ===
                                    ChessGame.selected.c &&
                                move.to.r === r &&
                                move.to.c === c
                        );


                    if (possible) {

                        if (
                            ChessGame.board[r][c]
                        ) {

                            square.classList.add(
                                "capture-move"
                            );

                        } else {

                            square.classList.add(
                                "legal-move"
                            );

                        }

                    }

                }


                /*
                 * Piece
                 */

                const piece =
                    ChessGame.board[r][c];


                if (piece) {

                    const pieceElement =
                        document.createElement(
                            "span"
                        );

                    pieceElement.className =
                        "piece " +
                        (
                            ChessGame.colorOf(piece)
                                === "w"
                                ? "white-piece"
                                : "black-piece"
                        );


                    pieceElement.textContent =
                        ChessGame.colorOf(piece)
                            === "w"
                            ? PIECES.w[
                                piece.toLowerCase()
                            ]
                            : PIECES.b[
                                piece.toLowerCase()
                            ];


                    square.appendChild(
                        pieceElement
                    );

                }


                square.addEventListener(
                    "click",
                    () => {

                        this.handleSquareClick(
                            r,
                            c
                        );

                    }
                );


                this.boardElement.appendChild(
                    square
                );

            }

        }

    },


    /* =====================================================
       CLICK
    ===================================================== */

    handleSquareClick(r, c) {

        if (
            !this.gameRunning ||
            this.aiThinking ||
            ChessGame.gameOver
        ) {
            return;
        }


        /*
         * User can only move their own pieces.
         */

        if (
            ChessGame.turn !==
            this.playerColor
        ) {
            return;
        }


        const piece =
            ChessGame.board[r][c];


        /*
         * If nothing selected
         */

        if (
            !ChessGame.selected
        ) {

            if (
                piece &&
                ChessGame.colorOf(piece) ===
                    this.playerColor
            ) {

                ChessGame.selected = {
                    r,
                    c
                };

                this.renderBoard();

            }

            return;

        }


        /*
         * Click same square
         */

        if (
            ChessGame.selected.r === r &&
            ChessGame.selected.c === c
        ) {

            ChessGame.selected = null;

            this.renderBoard();

            return;

        }


        /*
         * Select another own piece
         */

        if (
            piece &&
            ChessGame.colorOf(piece) ===
                this.playerColor
        ) {

            ChessGame.selected = {
                r,
                c
            };

            this.renderBoard();

            return;

        }


        /*
         * Find legal move
         */

        const legalMoves =
            ChessGame.getLegalMoves(
                ChessGame.turn
            );


        const move =
            legalMoves.find(
                item =>
                    item.from.r ===
                        ChessGame.selected.r &&
                    item.from.c ===
                        ChessGame.selected.c &&
                    item.to.r === r &&
                    item.to.c === c
            );


        if (!move) {

            this.setStatus(
                "That move is not legal."
            );

            return;

        }


        this.performMove(
            move,
            true
        );

    },


    /* =====================================================
       PERFORM MOVE
    ===================================================== */

    performMove(
        move,
        isHuman = false
    ) {

        const beforeBoard =
            ChessGame.cloneBoard(
                ChessGame.board
            );


        const captured =
            move.enPassant
                ? ChessGame.board[
                    move.from.r
                ][
                    move.to.c
                ]
                : ChessGame.board[
                    move.to.r
                ][
                    move.to.c
                ];


        const notation =
            ChessGame.moveNotation(
                move,
                beforeBoard
            );


        const piece =
            beforeBoard[
                move.from.r
            ][
                move.from.c
            ];


        ChessGame.makeMove(
            move
        );


        /*
         * Save move
         */

        this.moveHistory.push({
            color:
                ChessGame.opposite(
                    ChessGame.turn
                ),

            notation
        });


        /*
         * Captured material
         */

        if (captured) {

            const capturedColor =
                ChessGame.colorOf(
                    captured
                );

            if (
                capturedColor === "w"
            ) {

                this.capturedWhite.push(
                    captured
                );

            } else {

                this.capturedBlack.push(
                    captured
                );

            }

        }


        this.renderBoard();

        this.renderMoves();

        this.updateMaterial();

        this.updateStatus();


        /*
         * Switch clock
         */

        this.switchClock();


        /*
         * Game over?
         */

        if (
            ChessGame.gameOver
        ) {

            this.finishGame();

            return;

        }


        /*
         * Computer turn
         */

        if (
            ChessGame.turn ===
            ChessGame.computerColor
        ) {

            this.aiThinking = true;

            this.setStatus(
                "Computer is thinking..."
            );


            setTimeout(
                () => {

                    this.computerMove();

                },
                350
            );

        } else {

            this.setStatus(
                "Your turn"
            );

        }

    },


    /* =====================================================
       COMPUTER
    ===================================================== */

    computerMove() {

        if (
            !this.gameRunning ||
            ChessGame.gameOver
        ) {

            this.aiThinking = false;

            return;

        }


        if (
            ChessGame.turn !==
            ChessGame.computerColor
        ) {

            this.aiThinking = false;

            return;

        }


        const move =
            ChessGame.findBestMove(
                this.difficulty
            );


        if (!move) {

            this.aiThinking = false;

            this.updateStatus();

            return;

        }


        this.performMove(
            move,
            false
        );


        this.aiThinking = false;

    },


    /* =====================================================
       UNDO
    ===================================================== */

    undo() {

        if (
            !this.gameRunning ||
            this.aiThinking
        ) {
            return;
        }


        /*
         * Undo user's move + computer move.
         */

        if (
            ChessGame.history.length === 0
        ) {
            return;
        }


        if (
            ChessGame.history.length >= 2
        ) {

            ChessGame.undo();

            ChessGame.undo();

            this.moveHistory =
                this.moveHistory.slice(
                    0,
                    Math.max(
                        0,
                        this.moveHistory.length - 2
                    )
                );

        } else {

            ChessGame.undo();

            this.moveHistory.pop();

        }


        ChessGame.gameOver = false;

        this.aiThinking = false;

        this.renderBoard();

        this.renderMoves();

        this.updateMaterial();

        this.updateStatus();

    },


    /* =====================================================
       RESIGN
    ===================================================== */

    resign() {

        if (
            !this.gameRunning ||
            ChessGame.gameOver
        ) {
            return;
        }


        ChessGame.gameOver = true;

        ChessGame.winner =
            ChessGame.computerColor;


        this.setStatus(
            "You resigned. Computer wins."
        );

        this.finishGame();

    },


    /* =====================================================
       STATUS
    ===================================================== */

    updateStatus() {

        if (
            ChessGame.gameOver
        ) {

            if (
                ChessGame.winner ===
                "draw"
            ) {

                this.setStatus(
                    "Draw — stalemate."
                );

            } else if (
                ChessGame.winner ===
                this.playerColor
            ) {

                this.setStatus(
                    "Checkmate — you win!"
                );

            } else {

                this.setStatus(
                    "Checkmate — computer wins."
                );

            }

            return;

        }


        if (
            ChessGame.isInCheck(
                ChessGame.board,
                ChessGame.turn
            )
        ) {

            if (
                ChessGame.turn ===
                this.playerColor
            ) {

                this.setStatus(
                    "Check! Your king is under attack."
                );

            } else {

                this.setStatus(
                    "Computer is in check."
                );

            }

            return;

        }


        if (
            ChessGame.turn ===
            this.playerColor
        ) {

            this.setStatus(
                "Your turn"
            );

        } else {

            this.setStatus(
                "Computer's turn"
            );

        }

    },


    setStatus(text) {

        const element =
            document.getElementById(
                "gameStatus"
            );

        element.textContent = text;

    },


    /* =====================================================
       MOVE HISTORY
    ===================================================== */

    renderMoves() {

        const container =
            document.getElementById(
                "moveHistory"
            );


        container.innerHTML = "";


        if (
            this.moveHistory.length === 0
        ) {

            container.innerHTML =
                `
                <div class="empty-moves">
                    No moves yet
                </div>
                `;

            return;

        }


        for (
            let i = 0;
            i < this.moveHistory.length;
            i += 2
        ) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "move-row";


            const number =
                document.createElement(
                    "span"
                );

            number.className =
                "move-number";

            number.textContent =
                (
                    Math.floor(i / 2) + 1
                ) + ".";


            const white =
                document.createElement(
                    "span"
                );

            white.className =
                "move-white";

            white.textContent =
                this.moveHistory[i]
                    ? this.moveHistory[i].notation
                    : "";


            const black =
                document.createElement(
                    "span"
                );

            black.className =
                "move-black";

            black.textContent =
                this.moveHistory[i + 1]
                    ? this.moveHistory[i + 1].notation
                    : "";


            row.appendChild(number);

            row.appendChild(white);

            row.appendChild(black);

            container.appendChild(row);

        }

        container.scrollTop =
            container.scrollHeight;

    },


    /* =====================================================
       MATERIAL
    ===================================================== */

    updateMaterial() {

        const values = {
            p: 1,
            n: 3,
            b: 3,
            r: 5,
            q: 9,
            k: 0
        };


        let white = 0;
        let black = 0;


        for (
            let r = 0;
            r < 8;
            r++
        ) {

            for (
                let c = 0;
                c < 8;
                c++
            ) {

                const piece =
                    ChessGame.board[r][c];

                if (!piece) {
                    continue;
                }

                const value =
                    values[
                        piece.toLowerCase()
                    ];


                if (
                    ChessGame.colorOf(piece)
                    === "w"
                ) {

                    white += value;

                } else {

                    black += value;

                }

            }

        }


        const difference =
            white - black;


        const element =
            document.getElementById(
                "materialDisplay"
            );


        if (
            difference === 0
        ) {

            element.textContent =
                "Material equal";

        } else if (
            difference > 0
        ) {

            element.textContent =
                `White +${difference}`;

        } else {

            element.textContent =
                `Black +${Math.abs(difference)}`;

        }

    },


    /* =====================================================
       CLOCK
    ===================================================== */

    startClock() {

        this.stopClock();


        this.clockInterval =
            setInterval(
                () => {

                    if (
                        !this.gameRunning ||
                        ChessGame.gameOver
                    ) {
                        return;
                    }


                    this.clocks[
                        this.activeClock
                    ]--;


                    if (
                        this.clocks[
                            this.activeClock
                        ] <= 0
                    ) {

                        this.clocks[
                            this.activeClock
                        ] = 0;

                        this.timeOut();

                        return;

                    }


                    this.updateClocks();

                },
                1000
            );

    },


    stopClock() {

        if (
            this.clockInterval
        ) {

            clearInterval(
                this.clockInterval
            );

            this.clockInterval = null;

        }

    },


    switchClock() {

        this.activeClock =
            ChessGame.turn;

        this.updateClocks();

    },


    updateClocks() {

        const playerClock =
            document.getElementById(
                "playerClock"
            );

        const computerClock =
            document.getElementById(
                "computerClock"
            );


        const playerTime =
            this.clocks[
                this.playerColor
            ];

        const computerTime =
            this.clocks[
                ChessGame.computerColor
            ];


        playerClock.textContent =
            this.formatTime(
                playerTime
            );

        computerClock.textContent =
            this.formatTime(
                computerTime
            );


        playerClock.classList.toggle(
            "active-clock",
            this.activeClock ===
                this.playerColor
        );


        computerClock.classList.toggle(
            "active-clock",
            this.activeClock ===
                ChessGame.computerColor
        );

    },


    formatTime(seconds) {

        const mins =
            Math.floor(
                seconds / 60
            );

        const secs =
            seconds % 60;


        return (
            String(mins).padStart(
                2,
                "0"
            ) +
            ":" +
            String(secs).padStart(
                2,
                "0"
            )
        );

    },


    timeOut() {

        this.stopClock();

        ChessGame.gameOver = true;

        ChessGame.winner =
            ChessGame.opposite(
                this.activeClock
            );


        if (
            ChessGame.winner ===
            this.playerColor
        ) {

            this.setStatus(
                "Time out — you win!"
            );

        } else {

            this.setStatus(
                "Time out — computer wins."
            );

        }


        this.finishGame();

    },


    /* =====================================================
       FINISH GAME
    ===================================================== */

    finishGame() {

        if (
            !this.gameRunning
        ) {
            return;
        }


        this.gameRunning = false;

        this.aiThinking = false;

        this.stopClock();


        this.stats.games++;


        if (
            ChessGame.winner ===
            this.playerColor
        ) {

            this.stats.wins++;

        } else if (
            ChessGame.winner ===
            "draw"
        ) {

            this.stats.draws++;

        } else {

            this.stats.losses++;

        }


        this.saveStats();

        this.updateStats();

        this.updateStatus();

    },


    /* =====================================================
       STATS
    ===================================================== */

    loadStats() {

        try {

            const saved =
                localStorage.getItem(
                    "chessStats"
                );

            if (saved) {

                this.stats =
                    JSON.parse(saved);

            }

        } catch (error) {

            console.error(
                error
            );

        }


        this.updateStats();

    },


    saveStats() {

        localStorage.setItem(
            "chessStats",
            JSON.stringify(
                this.stats
            )
        );

    },


    updateStats() {

        document.getElementById(
            "games"
        ).textContent =
            this.stats.games;

        document.getElementById(
            "wins"
        ).textContent =
            this.stats.wins;

        document.getElementById(
            "losses"
        ).textContent =
            this.stats.losses;

        document.getElementById(
            "draws"
        ).textContent =
            this.stats.draws;

    },


    /* =====================================================
       PWA
    ===================================================== */

    bindInstall() {

        const button =
            document.getElementById(
                "installButton"
            );


        window.addEventListener(
            "beforeinstallprompt",
            event => {

                event.preventDefault();

                this.deferredInstallPrompt =
                    event;

                button.hidden = false;

            }
        );


        button.addEventListener(
            "click",
            async () => {

                if (
                    !this.deferredInstallPrompt
                ) {
                    return;
                }


                this.deferredInstallPrompt.prompt();

                await this.deferredInstallPrompt
                    .userChoice;

                this.deferredInstallPrompt =
                    null;

                button.hidden = true;

            }
        );


        if (
            "serviceWorker" in navigator
        ) {

            window.addEventListener(
                "load",
                () => {

                    navigator.serviceWorker
                        .register(
                            "/static/service-worker.js"
                        )
                        .catch(
                            error =>
                                console.error(
                                    "Service worker:",
                                    error
                                )
                        );

                }
            );

        }

    }

};


/*
 * Safe global files array.
 */

const FILES_SAFE = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h"
];
