/* =========================================================
   CHESS ACADEMY APPLICATION
========================================================= */

const App = {

    boardFlipped: false,

    selectedSquare: null,

    gameStarted: false,

    gameOver: false,

    currentClock: null,

    playerTime: 600,

    computerTime: 600,

    moveHistory: [],

    capturedWhite: [],
    capturedBlack: [],

    installPrompt: null,


    /* =====================================================
       INITIALIZE
    ===================================================== */

    init() {

        this.loadStats();

        this.bindNavigation();

        this.bindHomeButtons();

        this.bindGameControls();

        this.bindPWA();

        this.showSection("home");

        this.resetGameDisplay();
    },


    /* =====================================================
       NAVIGATION
    ===================================================== */

    bindNavigation() {

        document.querySelectorAll(".nav-button").forEach(button => {

            button.addEventListener("click", () => {

                const section = button.dataset.section;

                this.showSection(section);

            });

        });


        const logo = document.getElementById("homeLogo");

        if (logo) {

            logo.addEventListener("click", () => {

                this.stopClock();

                this.showSection("home");

            });

        }

    },


    bindHomeButtons() {

        const play = document.getElementById("homePlayGame");

        if (play) {

            play.addEventListener("click", () => {

                this.showSection("play");

            });

        }


        const academy = document.getElementById("homeAcademy");

        if (academy) {

            academy.addEventListener("click", () => {

                this.showSection("academy");

            });

        }


        const gameHome = document.getElementById("gameHome");

        if (gameHome) {

            gameHome.addEventListener("click", () => {

                this.stopClock();

                this.showSection("home");

            });

        }


        const academyHome = document.getElementById("academyHome");

        if (academyHome) {

            academyHome.addEventListener("click", () => {

                this.showSection("home");

            });

        }

    },


    showSection(sectionName) {

        document.querySelectorAll(".section").forEach(section => {

            section.classList.remove("active");

        });


        const section = document.getElementById(sectionName);

        if (section) {

            section.classList.add("active");

        }


        document.querySelectorAll(".nav-button").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },


    /* =====================================================
       GAME CONTROLS
    ===================================================== */

    bindGameControls() {

        const startGame = document.getElementById("startGame");

        if (startGame) {

            startGame.addEventListener("click", () => {

                this.startNewGame();

            });

        }


        const newGame = document.getElementById("newGame");

        if (newGame) {

            newGame.addEventListener("click", () => {

                this.startNewGame();

            });

        }


        const undo = document.getElementById("undoMove");

        if (undo) {

            undo.addEventListener("click", () => {

                this.undo();

            });

        }


        const resign = document.getElementById("resignGame");

        if (resign) {

            resign.addEventListener("click", () => {

                this.resign();

            });

        }

    },


    /* =====================================================
       START GAME
    ===================================================== */

    startNewGame() {

        const colorElement =
            document.getElementById("playerColor");

        const difficultyElement =
            document.getElementById("difficulty");


        const playerColor =
            colorElement ? colorElement.value : "w";

        const difficulty =
            difficultyElement
                ? Number(difficultyElement.value)
                : 3;


        this.stopClock();


        ChessGame.init(playerColor);

        ChessGame.difficulty = difficulty;


        this.boardFlipped = playerColor === "b";

        this.gameStarted = true;

        this.gameOver = false;

        this.selectedSquare = null;

        this.playerTime = 600;

        this.computerTime = 600;

        this.moveHistory = [];

        this.capturedWhite = [];

        this.capturedBlack = [];


        this.updatePlayerLabels(playerColor);

        this.renderBoard();

        this.renderMoves();

        this.renderCapturedPieces();

        this.updateMaterial();

        this.updateClocks();

        this.updateStatus();


        if (playerColor === "b") {

            this.switchClock("computer");

            setTimeout(() => {

                if (!this.gameOver) {

                    this.computerMove();

                }

            }, 600);

        } else {

            this.switchClock("player");

        }

    },


    /* =====================================================
       PLAYER LABELS
    ===================================================== */

    updatePlayerLabels(playerColor) {

        const playerLabel =
            document.getElementById("playerLabel");

        const computerLabel =
            document.getElementById("computerLabel");


        const playerSide =
            playerLabel
                ? playerLabel.parentElement.querySelector(".player-side")
                : null;


        const computerSide =
            computerLabel
                ? computerLabel.parentElement.querySelector(".player-side")
                : null;


        if (playerColor === "w") {

            if (playerLabel) {
                playerLabel.textContent = "YOU";
            }

            if (playerSide) {
                playerSide.textContent = "WHITE";
            }

            if (computerLabel) {
                computerLabel.textContent = "COMPUTER";
            }

            if (computerSide) {
                computerSide.textContent = "BLACK";
            }

        } else {

            if (playerLabel) {
                playerLabel.textContent = "YOU";
            }

            if (playerSide) {
                playerSide.textContent = "BLACK";
            }

            if (computerLabel) {
                computerLabel.textContent = "COMPUTER";
            }

            if (computerSide) {
                computerSide.textContent = "WHITE";
            }

        }

    },


    /* =====================================================
       BOARD RENDER
    ===================================================== */

    renderBoard() {

        const boardElement =
            document.getElementById("chessBoard");

        if (!boardElement) {
            return;
        }


        boardElement.innerHTML = "";


        const board = ChessGame.board;

        const rows = this.boardFlipped
            ? [7, 6, 5, 4, 3, 2, 1, 0]
            : [0, 1, 2, 3, 4, 5, 6, 7];


        const cols = this.boardFlipped
            ? [7, 6, 5, 4, 3, 2, 1, 0]
            : [0, 1, 2, 3, 4, 5, 6, 7];


        const lastMove =
            ChessGame.history.length
                ? ChessGame.history[ChessGame.history.length - 1]
                : null;


        const legalMoves =
            this.selectedSquare !== null
                ? ChessGame.getLegalMovesFrom(this.selectedSquare)
                : [];


        rows.forEach((row, displayRow) => {

            cols.forEach((col, displayCol) => {

                const square =
                    document.createElement("div");

                square.className = "square";


                const isLight =
                    (row + col) % 2 === 0;


                square.classList.add(
                    isLight
                        ? "light-square"
                        : "dark-square"
                );


                const squareIndex =
                    row * 8 + col;


                square.dataset.index =
                    squareIndex;


                if (
                    this.selectedSquare === squareIndex
                ) {

                    square.classList.add("selected");

                }


                if (lastMove) {

                    if (
                        lastMove.from === squareIndex ||
                        lastMove.to === squareIndex
                    ) {

                        square.classList.add("last-move");

                    }

                }


                const legal =
                    legalMoves.some(
                        move => move.to === squareIndex
                    );


                if (legal) {

                    if (board[row][col]) {

                        square.classList.add(
                            "capture-move"
                        );

                    } else {

                        square.classList.add(
                            "legal-move"
                        );

                    }

                }


                const piece =
                    board[row][col];


                if (piece) {

                    const pieceElement =
                        document.createElement("span");

                    pieceElement.className =
                        "piece";


                    const isWhite =
                        piece === piece.toUpperCase();


                    pieceElement.classList.add(
                        isWhite
                            ? "white-piece"
                            : "black-piece"
                    );


                    pieceElement.textContent =
                        PIECES[piece];


                    square.appendChild(pieceElement);

                }


                /* FILE COORDINATES */

                if (displayRow === 7) {

                    const file =
                        document.createElement("span");

                    file.className =
                        "coordinate file-coordinate";


                    const fileNumber =
                        this.boardFlipped
                            ? 7 - col
                            : col;


                    file.textContent =
                        String.fromCharCode(
                            97 + fileNumber
                        );


                    square.appendChild(file);

                }


                /* RANK COORDINATES */

                if (displayCol === 0) {

                    const rank =
                        document.createElement("span");

                    rank.className =
                        "coordinate rank-coordinate";


                    const rankNumber =
                        this.boardFlipped
                            ? row + 1
                            : 8 - row;


                    rank.textContent =
                        rankNumber;


                    square.appendChild(rank);

                }


                square.addEventListener(
                    "click",
                    () => this.handleSquareClick(squareIndex)
                );


                boardElement.appendChild(square);

            });

        });

    },


    /* =====================================================
       SQUARE CLICK
    ===================================================== */

    handleSquareClick(index) {

        if (!this.gameStarted || this.gameOver) {
            return;
        }


        if (
            ChessGame.turn !== ChessGame.playerColor
        ) {

            return;

        }


        const row =
            Math.floor(index / 8);

        const col =
            index % 8;


        const piece =
            ChessGame.board[row][col];


        if (this.selectedSquare !== null) {

            const legalMoves =
                ChessGame.getLegalMovesFrom(
                    this.selectedSquare
                );


            const selectedMove =
                legalMoves.find(
                    move => move.to === index
                );


            if (selectedMove) {

                this.performMove(
                    this.selectedSquare,
                    index
                );

                return;

            }

        }


        if (piece) {

            const isWhite =
                piece === piece.toUpperCase();


            const playerOwnsPiece =
                (
                    ChessGame.playerColor === "w" &&
                    isWhite
                ) ||
                (
                    ChessGame.playerColor === "b" &&
                    !isWhite
                );


            if (playerOwnsPiece) {

                if (
                    this.selectedSquare === index
                ) {

                    this.selectedSquare = null;

                } else {

                    this.selectedSquare = index;

                }

                this.renderBoard();

                return;

            }

        }


        this.selectedSquare = null;

        this.renderBoard();

    },


    /* =====================================================
       MAKE MOVE
    ===================================================== */

    performMove(from, to) {

        const beforePiece =
            ChessGame.board[
                Math.floor(from / 8)
            ][from % 8];


        const targetPiece =
            ChessGame.board[
                Math.floor(to / 8)
            ][to % 8];


        const notation =
            ChessGame.moveNotation(
                from,
                to,
                targetPiece
            );


        const success =
            ChessGame.makeMove(from, to);


        if (!success) {

            return;

        }


        if (targetPiece) {

            if (
                targetPiece ===
                targetPiece.toUpperCase()
            ) {

                this.capturedWhite.push(
                    targetPiece
                );

            } else {

                this.capturedBlack.push(
                    targetPiece
                );

            }

        }


        this.moveHistory.push(notation);

        this.selectedSquare = null;


        this.renderBoard();

        this.renderMoves();

        this.renderCapturedPieces();

        this.updateMaterial();

        this.updateStatus();


        if (ChessGame.isGameOver()) {

            this.finishGame();

            return;

        }


        this.switchClock(
            ChessGame.turn === ChessGame.playerColor
                ? "player"
                : "computer"
        );


        if (
            ChessGame.turn !== ChessGame.playerColor
        ) {

            setTimeout(() => {

                if (!this.gameOver) {

                    this.computerMove();

                }

            }, 450);

        }

    },


    /* =====================================================
       COMPUTER MOVE
    ===================================================== */

    computerMove() {

        if (this.gameOver) {
            return;
        }


        if (
            ChessGame.turn === ChessGame.playerColor
        ) {

            return;

        }


        const difficultyElement =
            document.getElementById("difficulty");


        const difficulty =
            difficultyElement
                ? Number(difficultyElement.value)
                : 3;


        let move =
            ChessGame.findBestMove(
                difficulty
            );


        if (!move) {

            this.finishGame();

            return;

        }


        const targetPiece =
            ChessGame.board[
                Math.floor(move.to / 8)
            ][move.to % 8];


        const notation =
            ChessGame.moveNotation(
                move.from,
                move.to,
                targetPiece
            );


        const success =
            ChessGame.makeMove(
                move.from,
                move.to
            );


        if (!success) {
            return;
        }


        if (targetPiece) {

            if (
                targetPiece ===
                targetPiece.toUpperCase()
            ) {

                this.capturedWhite.push(
                    targetPiece
                );

            } else {

                this.capturedBlack.push(
                    targetPiece
                );

            }

        }


        this.moveHistory.push(notation);


        this.renderBoard();

        this.renderMoves();

        this.renderCapturedPieces();

        this.updateMaterial();

        this.updateStatus();


        if (ChessGame.isGameOver()) {

            this.finishGame();

            return;

        }


        this.switchClock("player");

    },


    /* =====================================================
       MOVE HISTORY
    ===================================================== */

    renderMoves() {

        const container =
            document.getElementById(
                "moveHistory"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (!this.moveHistory.length) {

            container.innerHTML = `
                <div class="empty-moves">
                    <span>♟</span>
                    <p>Your moves will appear here.</p>
                </div>
            `;

            this.updateMoveCount();

            return;

        }


        for (
            let i = 0;
            i < this.moveHistory.length;
            i += 2
        ) {

            const row =
                document.createElement("div");

            row.className =
                "move-row";


            const number =
                document.createElement("span");

            number.className =
                "move-number";

            number.textContent =
                `${Math.floor(i / 2) + 1}.`;


            const white =
                document.createElement("span");

            white.className =
                "move-cell";


            const black =
                document.createElement("span");

            black.className =
                "move-cell";


            white.textContent =
                this.moveHistory[i] || "";


            black.textContent =
                this.moveHistory[i + 1] || "";


            if (
                i ===
                this.moveHistory.length - 1
            ) {

                white.classList.add("current");

            }


            if (
                i + 1 ===
                this.moveHistory.length - 1
            ) {

                black.classList.add("current");

            }


            row.appendChild(number);

            row.appendChild(white);

            row.appendChild(black);

            container.appendChild(row);

        }


        container.scrollTop =
            container.scrollHeight;


        this.updateMoveCount();

    },


    updateMoveCount() {

        const element =
            document.getElementById("moveCount");


        if (!element) {
            return;
        }


        const count =
            this.moveHistory.length;


        element.textContent =
            `${count} ${count === 1 ? "MOVE" : "MOVES"}`;

    },


    /* =====================================================
       CAPTURED PIECES
    ===================================================== */

    renderCapturedPieces() {

        const playerContainer =
            document.getElementById(
                "playerCaptured"
            );


        const computerContainer =
            document.getElementById(
                "computerCaptured"
            );


        if (!playerContainer || !computerContainer) {
            return;
        }


        playerContainer.innerHTML = "";

        computerContainer.innerHTML = "";


        const playerColor =
            ChessGame.playerColor;


        let playerCaptured;
        let computerCaptured;


        if (playerColor === "w") {

            playerCaptured =
                this.capturedBlack;

            computerCaptured =
                this.capturedWhite;

        } else {

            playerCaptured =
                this.capturedWhite;

            computerCaptured =
                this.capturedBlack;

        }


        playerCaptured.forEach(
            piece => {

                playerContainer.appendChild(
                    this.createCapturedPiece(piece)
                );

            }
        );


        computerCaptured.forEach(
            piece => {

                computerContainer.appendChild(
                    this.createCapturedPiece(piece)
                );

            }
        );

    },


    createCapturedPiece(piece) {

        const span =
            document.createElement("span");


        span.className =
            "captured-piece";


        const white =
            piece === piece.toUpperCase();


        span.classList.add(
            white ? "white" : "black"
        );


        span.textContent =
            PIECES[piece];


        return span;

    },


    /* =====================================================
       MATERIAL
    ===================================================== */

    updateMaterial() {

        const element =
            document.getElementById(
                "materialDisplay"
            );


        if (!element) {
            return;
        }


        const whiteScore =
            this.materialScore(
                this.capturedWhite
            );


        const blackScore =
            this.materialScore(
                this.capturedBlack
            );


        const difference =
            whiteScore - blackScore;


        if (difference === 0) {

            element.textContent =
                "MATERIAL EVEN";

        } else if (difference > 0) {

            element.textContent =
                `WHITE +${difference}`;

        } else {

            element.textContent =
                `BLACK +${Math.abs(difference)}`;

        }

    },


    materialScore(pieces) {

        const values = {
            p: 1,
            n: 3,
            b: 3,
            r: 5,
            q: 9,
            k: 0
        };


        return pieces.reduce(
            (total, piece) => {

                return total +
                    (values[piece.toLowerCase()] || 0);

            },
            0
        );

    },


    /* =====================================================
       STATUS
    ===================================================== */

    updateStatus() {

        const status =
            document.getElementById(
                "gameStatus"
            );


        if (!status) {
            return;
        }


        if (!this.gameStarted) {

            status.textContent =
                "Choose your side and press PLAY GAME.";

            return;

        }


        if (this.gameOver) {
            return;
        }


        if (
            ChessGame.turn ===
            ChessGame.playerColor
        ) {

            status.textContent =
                "Your turn";

        } else {

            status.textContent =
                "Computer is thinking...";

        }

    },


    /* =====================================================
       CLOCK
    ===================================================== */

    switchClock(player) {

        this.stopClock();


        const playerClock =
            document.getElementById(
                "playerClock"
            );


        const computerClock =
            document.getElementById(
                "computerClock"
            );


        if (playerClock) {
            playerClock.classList.remove("active");
        }

        if (computerClock) {
            computerClock.classList.remove("active");
        }


        if (player === "player") {

            this.currentClock = "player";

            if (playerClock) {
                playerClock.classList.add("active");
            }

        } else {

            this.currentClock = "computer";

            if (computerClock) {
                computerClock.classList.add("active");
            }

        }


        this.startClock();

    },


    startClock() {

        this.stopClock();


        this.clockInterval =
            setInterval(() => {

                if (
                    this.currentClock ===
                    "player"
                ) {

                    this.playerTime--;

                    if (
                        this.playerTime <= 0
                    ) {

                        this.playerTime = 0;

                        this.updateClocks();

                        this.timeout("player");

                        return;

                    }

                } else if (
                    this.currentClock ===
                    "computer"
                ) {

                    this.computerTime--;

                    if (
                        this.computerTime <= 0
                    ) {

                        this.computerTime = 0;

                        this.updateClocks();

                        this.timeout("computer");

                        return;

                    }

                }


                this.updateClocks();

            }, 1000);

    },


    stopClock() {

        if (this.clockInterval) {

            clearInterval(
                this.clockInterval
            );

            this.clockInterval = null;

        }

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


        if (playerClock) {

            playerClock.textContent =
                this.formatTime(
                    this.playerTime
                );

        }


        if (computerClock) {

            computerClock.textContent =
                this.formatTime(
                    this.computerTime
                );

        }

    },


    formatTime(seconds) {

        const minutes =
            Math.floor(seconds / 60);

        const remaining =
            seconds % 60;


        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remaining).padStart(2, "0")
        );

    },


    timeout(player) {

        if (this.gameOver) {
            return;
        }


        this.gameOver = true;

        this.stopClock();


        const status =
            document.getElementById(
                "gameStatus"
            );


        if (player === "player") {

            status.textContent =
                "Time out — Computer wins.";

            this.recordResult("loss");

        } else {

            status.textContent =
                "Time out — You win!";

            this.recordResult("win");

        }


        status.classList.add("game-over");

    },


    /* =====================================================
       GAME OVER
    ===================================================== */

    finishGame() {

        this.gameOver = true;

        this.stopClock();


        const status =
            document.getElementById(
                "gameStatus"
            );


        status.classList.add("game-over");


        if (
            ChessGame.isCheckmate()
        ) {

            const winner =
                ChessGame.turn ===
                ChessGame.playerColor
                    ? "computer"
                    : "player";


            if (winner === "player") {

                status.textContent =
                    "Checkmate — You win!";

                this.recordResult("win");

            } else {

                status.textContent =
                    "Checkmate — Computer wins.";

                this.recordResult("loss");

            }

        } else {

            status.textContent =
                "Draw — The game is over.";

            this.recordResult("draw");

        }

    },


    /* =====================================================
       UNDO
    ===================================================== */

    undo() {

        if (
            !this.gameStarted ||
            this.gameOver ||
            ChessGame.history.length === 0
        ) {

            return;

        }


        /*
         * Undo the player's last move and
         * computer's reply where possible.
         */

        if (
            ChessGame.history.length >= 2
        ) {

            ChessGame.undoMove();

            ChessGame.undoMove();

            if (this.moveHistory.length >= 2) {

                this.moveHistory.splice(
                    this.moveHistory.length - 2,
                    2
                );

            }

        } else {

            ChessGame.undoMove();

            this.moveHistory.pop();

        }


        this.rebuildCapturedPieces();


        this.selectedSquare = null;

        this.gameOver = false;


        this.renderBoard();

        this.renderMoves();

        this.renderCapturedPieces();

        this.updateMaterial();

        this.updateStatus();


        this.switchClock(
            ChessGame.turn ===
            ChessGame.playerColor
                ? "player"
                : "computer"
        );

    },


    rebuildCapturedPieces() {

        this.capturedWhite = [];

        this.capturedBlack = [];


        ChessGame.history.forEach(
            snapshot => {

                if (!snapshot.captured) {
                    return;
                }


                const piece =
                    snapshot.captured;


                if (
                    piece ===
                    piece.toUpperCase()
                ) {

                    this.capturedWhite.push(
                        piece
                    );

                } else {

                    this.capturedBlack.push(
                        piece
                    );

                }

            }
        );

    },


    /* =====================================================
       RESIGN
    ===================================================== */

    resign() {

        if (
            !this.gameStarted ||
            this.gameOver
        ) {

            return;

        }


        this.gameOver = true;

        this.stopClock();


        const status =
            document.getElementById(
                "gameStatus"
            );


        status.textContent =
            "You resigned — Computer wins.";


        status.classList.add(
            "game-over"
        );


        this.recordResult("loss");

    },


    /* =====================================================
       RESET DISPLAY
    ===================================================== */

    resetGameDisplay() {

        this.gameStarted = false;

        this.gameOver = false;

        this.playerTime = 600;

        this.computerTime = 600;

        this.moveHistory = [];

        this.capturedWhite = [];

        this.capturedBlack = [];


        this.updateClocks();


        const playerCaptured =
            document.getElementById(
                "playerCaptured"
            );


        const computerCaptured =
            document.getElementById(
                "computerCaptured"
            );


        if (playerCaptured) {
            playerCaptured.innerHTML = "";
        }

        if (computerCaptured) {
            computerCaptured.innerHTML = "";
        }


        const status =
            document.getElementById(
                "gameStatus"
            );


        if (status) {

            status.classList.remove(
                "game-over"
            );

            status.textContent =
                "Choose your side and press PLAY GAME.";

        }

    },


    /* =====================================================
       STATISTICS
    ===================================================== */

    getStats() {

        const saved =
            localStorage.getItem(
                "chessAcademyStats"
            );


        if (!saved) {

            return {
                games: 0,
                wins: 0,
                losses: 0,
                draws: 0
            };

        }


        try {

            return JSON.parse(saved);

        } catch {

            return {
                games: 0,
                wins: 0,
                losses: 0,
                draws: 0
            };

        }

    },


    loadStats() {

        const stats =
            this.getStats();


        const fields = [
            ["games", stats.games],
            ["wins", stats.wins],
            ["losses", stats.losses],
            ["draws", stats.draws]
        ];


        fields.forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(id);


                if (element) {

                    element.textContent =
                        value;

                }

            }
        );

    },


    recordResult(result) {

        const stats =
            this.getStats();


        stats.games++;


        if (result === "win") {
            stats.wins++;
        }

        if (result === "loss") {
            stats.losses++;
        }

        if (result === "draw") {
            stats.draws++;
        }


        localStorage.setItem(
            "chessAcademyStats",
            JSON.stringify(stats)
        );


        this.loadStats();

    },


    /* =====================================================
       PWA
    ===================================================== */

    bindPWA() {

        window.addEventListener(
            "beforeinstallprompt",
            event => {

                event.preventDefault();

                this.installPrompt = event;


                const button =
                    document.getElementById(
                        "installButton"
                    );


                if (button) {

                    button.classList.remove(
                        "hidden"
                    );


                    button.onclick =
                        async () => {

                            if (!this.installPrompt) {
                                return;
                            }


                            this.installPrompt.prompt();


                            await this.installPrompt.userChoice;


                            this.installPrompt =
                                null;


                            button.classList.add(
                                "hidden"
                            );

                        };

                }

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
                            error => {
                                console.log(
                                    "Service worker registration failed:",
                                    error
                                );
                            }
                        );

                }
            );

        }

    }

};


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);
