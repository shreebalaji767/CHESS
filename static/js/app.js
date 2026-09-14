/* =========================================================
   CHESS ACADEMY - MAIN APP
   Works with the supplied ChessGame engine.
========================================================= */

const App = {

    currentSection: "home",

    gameStarted: false,

    boardFlipped: false,

    selectedSquare: null,

    highlightedMoves: [],

    lastMove: null,

    capturedWhite: [],
    capturedBlack: [],

    playerClockSeconds: 10 * 60,
    computerClockSeconds: 10 * 60,

    playerClockTimer: null,
    computerClockTimer: null,

    gameResultRecorded: false,

    difficulty: 2,


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    init() {

        this.bindNavigation();
        this.bindHomeButtons();
        this.bindGameControls();
        this.bindBoard();
        this.bindPWA();

        this.loadStats();

        this.showSection("home");

        this.updateStatistics();

        console.log("Chess Academy loaded successfully.");

    },


    /* =====================================================
       NAVIGATION
    ===================================================== */

    bindNavigation() {

        document.querySelectorAll(".nav-button").forEach(button => {

            button.addEventListener("click", () => {

                const section =
                    button.dataset.section;

                if (section) {

                    this.showSection(section);

                }

            });

        });


        const logo =
            document.getElementById("homeLogo");

        if (logo) {

            logo.addEventListener("click", () => {

                this.showSection("home");

            });

        }


        const gameHome =
            document.getElementById("gameHome");

        if (gameHome) {

            gameHome.addEventListener("click", () => {

                this.showSection("home");

            });

        }


        const academyHome =
            document.getElementById("academyHome");

        if (academyHome) {

            academyHome.addEventListener("click", () => {

                this.showSection("home");

            });

        }

    },


    showSection(section) {

        const sections = [
            "home",
            "play",
            "academy",
            "exit"
        ];

        sections.forEach(id => {

            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            element.classList.toggle(
                "active",
                id === section
            );

        });


        document.querySelectorAll(".nav-button").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === section
            );

        });


        this.currentSection = section;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },


    /* =====================================================
       HOME
    ===================================================== */

    bindHomeButtons() {

        const playButton =
            document.getElementById("homePlayGame");

        if (playButton) {

            playButton.addEventListener("click", () => {

                this.showSection("play");

            });

        }


        const academyButton =
            document.getElementById("homeAcademy");

        if (academyButton) {

            academyButton.addEventListener("click", () => {

                this.showSection("academy");

            });

        }


        const exitButton =
            document.getElementById("homeExit");

        if (exitButton) {

            exitButton.addEventListener("click", () => {

                this.stopClock();

                this.showSection("exit");

            });

        }


        const returnHome =
            document.getElementById("returnHome");

        if (returnHome) {

            returnHome.addEventListener("click", () => {

                this.showSection("home");

            });

        }

    },


    /* =====================================================
       GAME CONTROLS
    ===================================================== */

    bindGameControls() {

        const startButton =
            document.getElementById("startGame");

        if (startButton) {

            startButton.addEventListener("click", () => {

                this.startNewGame();

            });

        }


        const newGame =
            document.getElementById("newGame");

        if (newGame) {

            newGame.addEventListener("click", () => {

                this.startNewGame();

            });

        }


        const undoButton =
            document.getElementById("undoMove");

        if (undoButton) {

            undoButton.addEventListener("click", () => {

                this.undoMove();

            });

        }


        const resignButton =
            document.getElementById("resignGame");

        if (resignButton) {

            resignButton.addEventListener("click", () => {

                this.resignGame();

            });

        }


        const playerColor =
            document.getElementById("playerColor");

        if (playerColor) {

            playerColor.addEventListener("change", () => {

                if (this.gameStarted) {

                    this.startNewGame();

                }

            });

        }


        const difficulty =
            document.getElementById("difficulty");

        if (difficulty) {

            difficulty.addEventListener("change", () => {

                this.difficulty =
                    Number(difficulty.value);

            });

        }

    },


    /* =====================================================
       START NEW GAME
    ===================================================== */

    startNewGame() {

        const colorElement =
            document.getElementById("playerColor");

        const difficultyElement =
            document.getElementById("difficulty");


        const playerColor =
            colorElement
                ? colorElement.value
                : "w";


        this.difficulty =
            difficultyElement
                ? Number(difficultyElement.value)
                : 2;


        console.log(
            "Starting game. Player:",
            playerColor,
            "Difficulty:",
            this.difficulty
        );


        /*
         * Initialize the REAL chess engine.
         */

        ChessGame.init(playerColor);


        this.gameStarted = true;

        this.gameResultRecorded = false;

        this.selectedSquare = null;

        this.highlightedMoves = [];

        this.lastMove = null;

        this.capturedWhite = [];

        this.capturedBlack = [];


        /*
         * Reset clocks.
         */

        this.playerClockSeconds =
            10 * 60;

        this.computerClockSeconds =
            10 * 60;


        this.stopClock();


        /*
         * Player orientation.
         */

        this.boardFlipped =
            playerColor === "b";


        /*
         * Clear move list.
         */

        this.clearMoveHistory();


        /*
         * Update labels.
         */

        this.updatePlayerLabels();


        /*
         * Render the actual board.
         */

        this.renderBoard();

        this.updateClocks();

        this.updateCapturedPieces();

        this.updateMaterial();

        this.updateGameStatus();

        this.updateMoveCount();


        /*
         * Start player's clock if White.
         * If player is Black, computer moves first.
         */

        if (ChessGame.turn === playerColor) {

            this.startPlayerClock();

        } else {

            this.startComputerClock();

            setTimeout(() => {

                if (
                    this.gameStarted &&
                    !ChessGame.gameOver &&
                    ChessGame.turn === ChessGame.computerColor
                ) {

                    this.computerMove();

                }

            }, 500);

        }


        console.log(
            "BOARD:",
            ChessGame.board
        );

    },


    /* =====================================================
       PLAYER LABELS
    ===================================================== */

    updatePlayerLabels() {

        const playerLabel =
            document.getElementById("playerLabel");

        const computerLabel =
            document.getElementById("computerLabel");


        if (!playerLabel || !computerLabel) {
            return;
        }


        if (ChessGame.playerColor === "w") {

            playerLabel.textContent =
                "You • White";

            computerLabel.textContent =
                "Computer • Black";

        } else {

            playerLabel.textContent =
                "You • Black";

            computerLabel.textContent =
                "Computer • White";

        }

    },


    /* =====================================================
       BOARD EVENTS
    ===================================================== */

    bindBoard() {

        const board =
            document.getElementById("chessBoard");

        if (!board) {
            return;
        }


        board.addEventListener("click", event => {

            const square =
                event.target.closest(".chess-square");

            if (!square) {
                return;
            }


            const row =
                Number(square.dataset.row);

            const col =
                Number(square.dataset.col);


            this.handleSquareClick(row, col);

        });

    },


    /* =====================================================
       BOARD RENDERING
    ===================================================== */

    renderBoard() {

        const boardElement =
            document.getElementById("chessBoard");

        if (!boardElement) {
            return;
        }


        boardElement.innerHTML = "";


        const board =
            ChessGame.board;


        /*
         * Safety check.
         */

        if (
            !board ||
            !Array.isArray(board) ||
            board.length !== 8
        ) {

            console.error(
                "Chess board is invalid:",
                board
            );

            return;

        }


        for (let displayRow = 0; displayRow < 8; displayRow++) {

            for (let displayCol = 0; displayCol < 8; displayCol++) {


                let row =
                    this.boardFlipped
                        ? 7 - displayRow
                        : displayRow;


                let col =
                    this.boardFlipped
                        ? 7 - displayCol
                        : displayCol;


                const square =
                    document.createElement("div");


                square.className =
                    "chess-square";


                square.dataset.row =
                    row;

                square.dataset.col =
                    col;


                /*
                 * Board color.
                 */

                const isLight =
                    (row + col) % 2 === 0;


                square.classList.add(
                    isLight
                        ? "light"
                        : "dark"
                );


                /*
                 * Last move.
                 */

                if (
                    this.lastMove &&
                    (
                        (
                            this.lastMove.from.r === row &&
                            this.lastMove.from.c === col
                        ) ||
                        (
                            this.lastMove.to.r === row &&
                            this.lastMove.to.c === col
                        )
                    )
                ) {

                    square.classList.add(
                        "last-move"
                    );

                }


                /*
                 * Selected square.
                 */

                if (
                    this.selectedSquare &&
                    this.selectedSquare.r === row &&
                    this.selectedSquare.c === col
                ) {

                    square.classList.add(
                        "selected"
                    );

                }


                /*
                 * Legal move.
                 */

                const legalMove =
                    this.highlightedMoves.find(
                        move =>
                            move.to.r === row &&
                            move.to.c === col
                    );


                if (legalMove) {

                    square.classList.add(
                        "legal-move"
                    );


                    if (
                        board[row][col]
                    ) {

                        square.classList.add(
                            "capture-move"
                        );

                    }

                }


                /*
                 * Piece.
                 */

                const piece =
                    board[row][col];


                if (piece) {

                    const pieceColor =
                        ChessGame.colorOf(piece);

                    const pieceType =
                        ChessGame.typeOf(piece);


                    const pieceElement =
                        document.createElement("span");


                    pieceElement.className =
                        "chess-piece";


                    pieceElement.classList.add(
                        pieceColor === "w"
                            ? "white-piece"
                            : "black-piece"
                    );


                    pieceElement.textContent =
                        PIECES[pieceColor][pieceType];


                    square.appendChild(
                        pieceElement
                    );

                }


                /*
                 * Coordinates.
                 */

                if (displayRow === 7) {

                    const file =
                        document.createElement("span");

                    file.className =
                        "coordinate file-coordinate";

                    file.textContent =
                        FILES[col];

                    square.appendChild(file);

                }


                if (displayCol === 0) {

                    const rank =
                        document.createElement("span");

                    rank.className =
                        "coordinate rank-coordinate";

                    rank.textContent =
                        8 - row;

                    square.appendChild(rank);

                }


                boardElement.appendChild(
                    square
                );

            }

        }

    },


    /* =====================================================
       SQUARE CLICK
    ===================================================== */

    handleSquareClick(row, col) {

        if (!this.gameStarted) {
            return;
        }


        if (ChessGame.gameOver) {
            return;
        }


        /*
         * Only allow player to move.
         */

        if (
            ChessGame.turn !==
            ChessGame.playerColor
        ) {

            return;

        }


        const piece =
            ChessGame.board[row][col];


        /*
         * If a square is selected,
         * see if clicked square is a legal destination.
         */

        if (this.selectedSquare) {

            const move =
                this.highlightedMoves.find(
                    candidate =>
                        candidate.to.r === row &&
                        candidate.to.c === col
                );


            if (move) {

                this.executePlayerMove(
                    move
                );

                return;

            }

        }


        /*
         * Select player's piece.
         */

        if (
            piece &&
            ChessGame.colorOf(piece) ===
            ChessGame.playerColor
        ) {

            this.selectedSquare = {
                r: row,
                c: col
            };


            this.highlightedMoves =
                ChessGame.getMovesForSquare(
                    row,
                    col
                );


            this.renderBoard();

            return;

        }


        /*
         * Clear selection.
         */

        this.selectedSquare = null;

        this.highlightedMoves = [];

        this.renderBoard();

    },


    /* =====================================================
       PLAYER MOVE
    ===================================================== */

    executePlayerMove(move) {

        const boardBefore =
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
                boardBefore
            );


        const success =
            ChessGame.makeMove(
                move
            );


        if (!success) {
            return;
        }


        /*
         * Record captured piece.
         */

        if (captured) {

            if (
                ChessGame.colorOf(captured) === "w"
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


        this.lastMove = {
            from: {
                ...move.from
            },
            to: {
                ...move.to
            }
        };


        this.selectedSquare = null;

        this.highlightedMoves = [];


        this.addMoveToHistory(
            notation,
            ChessGame.playerColor
        );


        this.renderBoard();

        this.updateCapturedPieces();

        this.updateMaterial();

        this.updateMoveCount();

        this.updateGameStatus();


        if (this.checkGameFinished()) {
            return;
        }


        /*
         * Computer's turn.
         */

        this.stopClock();

        this.startComputerClock();


        setTimeout(() => {

            if (
                this.gameStarted &&
                !ChessGame.gameOver &&
                ChessGame.turn ===
                ChessGame.computerColor
            ) {

                this.computerMove();

            }

        }, 400);

    },


    /* =====================================================
       COMPUTER MOVE
    ===================================================== */

    computerMove() {

        if (!this.gameStarted) {
            return;
        }


        if (ChessGame.gameOver) {
            return;
        }


        if (
            ChessGame.turn !==
            ChessGame.computerColor
        ) {

            return;

        }


        const boardBefore =
            ChessGame.cloneBoard(
                ChessGame.board
            );


        const move =
            ChessGame.findBestMove(
                this.difficulty
            );


        if (!move) {

            this.updateGameStatus();

            this.checkGameFinished();

            return;

        }


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
                boardBefore
            );


        const success =
            ChessGame.makeMove(
                move
            );


        if (!success) {
            return;
        }


        if (captured) {

            if (
                ChessGame.colorOf(captured) === "w"
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


        this.lastMove = {
            from: {
                ...move.from
            },
            to: {
                ...move.to
            }
        };


        this.addMoveToHistory(
            notation,
            ChessGame.computerColor
        );


        this.renderBoard();

        this.updateCapturedPieces();

        this.updateMaterial();

        this.updateMoveCount();

        this.updateGameStatus();


        if (this.checkGameFinished()) {
            return;
        }


        /*
         * Back to player.
         */

        this.stopClock();

        this.startPlayerClock();

    },


    /* =====================================================
       MOVE HISTORY
    ===================================================== */

    clearMoveHistory() {

        const history =
            document.getElementById(
                "moveHistory"
            );


        if (history) {

            history.innerHTML = "";

        }

    },


    addMoveToHistory(
        notation,
        color
    ) {

        const history =
            document.getElementById(
                "moveHistory"
            );


        if (!history) {
            return;
        }


        const moves =
            history.querySelectorAll(
                ".move-row"
            );


        const moveNumber =
            Math.floor(
                moves.length / 2
            ) + 1;


        let row;


        if (
            color === "w"
        ) {

            row =
                document.createElement("div");

            row.className =
                "move-row";

            row.innerHTML = `
                <span class="move-number">
                    ${moveNumber}.
                </span>

                <span class="white-move">
                    ${notation}
                </span>

                <span class="black-move">
                    —
                </span>
            `;


            history.appendChild(row);

        } else {

            row =
                moves[moves.length - 1];


            if (row) {

                const blackMove =
                    row.querySelector(
                        ".black-move"
                    );


                if (blackMove) {

                    blackMove.textContent =
                        notation;

                }

            } else {

                row =
                    document.createElement("div");

                row.className =
                    "move-row";

                row.innerHTML = `
                    <span class="move-number">
                        ${moveNumber}.
                    </span>

                    <span class="white-move">
                        —
                    </span>

                    <span class="black-move">
                        ${notation}
                    </span>
                `;


                history.appendChild(row);

            }

        }


        history.scrollTop =
            history.scrollHeight;

    },


    /* =====================================================
       UNDO
    ===================================================== */

    undoMove() {

        if (!this.gameStarted) {
            return;
        }


        if (
            ChessGame.history.length === 0
        ) {

            return;

        }


        this.stopClock();


        /*
         * If the computer just moved,
         * undo computer + player's previous move.
         */

        if (
            ChessGame.turn ===
            ChessGame.playerColor
        ) {

            ChessGame.undo();


            if (
                ChessGame.history.length > 0
            ) {

                ChessGame.undo();

            }

        } else {

            ChessGame.undo();

        }


        this.rebuildCapturedPieces();


        this.lastMove = null;

        this.selectedSquare = null;

        this.highlightedMoves = [];


        /*
         * Rebuild move list.
         */

        this.rebuildMoveHistory();


        this.renderBoard();

        this.updateCapturedPieces();

        this.updateMaterial();

        this.updateMoveCount();

        this.updateGameStatus();


        if (
            ChessGame.turn ===
            ChessGame.playerColor
        ) {

            this.startPlayerClock();

        } else {

            this.startComputerClock();

        }

    },


    rebuildCapturedPieces() {

        this.capturedWhite = [];

        this.capturedBlack = [];


        /*
         * Each history snapshot contains
         * the piece captured by that move.
         */

        ChessGame.history.forEach(snapshot => {

            if (!snapshot.captured) {
                return;
            }


            if (
                ChessGame.colorOf(
                    snapshot.captured
                ) === "w"
            ) {

                this.capturedWhite.push(
                    snapshot.captured
                );

            } else {

                this.capturedBlack.push(
                    snapshot.captured
                );

            }

        });

    },


    rebuildMoveHistory() {

        this.clearMoveHistory();


        /*
         * History stores board BEFORE each move.
         * The move object is stored inside snapshot.
         */

        ChessGame.history.forEach(snapshot => {

            if (!snapshot.move) {
                return;
            }


            const notation =
                ChessGame.moveNotation(
                    snapshot.move,
                    snapshot.board
                );


            const color =
                ChessGame.colorOf(
                    snapshot.piece
                );


            this.addMoveToHistory(
                notation,
                color
            );

        });

    },


    /* =====================================================
       RESIGN
    ===================================================== */

    resignGame() {

        if (!this.gameStarted) {
            return;
        }


        if (ChessGame.gameOver) {
            return;
        }


        ChessGame.gameOver = true;

        ChessGame.winner =
            ChessGame.computerColor;


        this.stopClock();

        this.updateGameStatus();

        this.recordGameResult(
            "loss"
        );

    },


    /* =====================================================
       GAME STATUS
    ===================================================== */

    updateGameStatus() {

        const status =
            document.getElementById(
                "gameStatus"
            );


        if (!status) {
            return;
        }


        if (!this.gameStarted) {

            status.textContent =
                "Choose your side and start a new game.";

            return;

        }


        if (ChessGame.gameOver) {

            if (
                ChessGame.winner ===
                "draw"
            ) {

                status.textContent =
                    "Draw";

                return;

            }


            if (
                ChessGame.winner ===
                ChessGame.playerColor
            ) {

                status.textContent =
                    "You Win!";

                return;

            }


            status.textContent =
                "Computer Wins";

            return;

        }


        const inCheck =
            ChessGame.isInCheck(
                ChessGame.board,
                ChessGame.turn
            );


        if (
            ChessGame.turn ===
            ChessGame.playerColor
        ) {

            status.textContent =
                inCheck
                    ? "Your move — CHECK!"
                    : "Your move";

        } else {

            status.textContent =
                inCheck
                    ? "Computer is thinking — CHECK!"
                    : "Computer's move";

        }

    },


    checkGameFinished() {

        if (!ChessGame.gameOver) {

            return false;

        }


        this.stopClock();

        this.updateGameStatus();


        if (
            !this.gameResultRecorded
        ) {

            if (
                ChessGame.winner ===
                "draw"
            ) {

                this.recordGameResult(
                    "draw"
                );

            } else if (
                ChessGame.winner ===
                ChessGame.playerColor
            ) {

                this.recordGameResult(
                    "win"
                );

            } else {

                this.recordGameResult(
                    "loss"
                );

            }

        }


        return true;

    },


    /* =====================================================
       CAPTURED PIECES
    ===================================================== */

    updateCapturedPieces() {

        const computerCaptured =
            document.getElementById(
                "computerCaptured"
            );

        const playerCaptured =
            document.getElementById(
                "playerCaptured"
            );


        if (
            !computerCaptured ||
            !playerCaptured
        ) {

            return;

        }


        let playerPieces;
        let computerPieces;


        if (
            ChessGame.playerColor === "w"
        ) {

            /*
             * Player is White.
             * Player captured Black.
             * Computer captured White.
             */

            playerPieces =
                this.capturedBlack;

            computerPieces =
                this.capturedWhite;

        } else {

            /*
             * Player is Black.
             * Player captured White.
             * Computer captured Black.
             */

            playerPieces =
                this.capturedWhite;

            computerPieces =
                this.capturedBlack;

        }


        playerCaptured.innerHTML =
            playerPieces
                .map(piece => {

                    const color =
                        ChessGame.colorOf(piece);

                    const type =
                        ChessGame.typeOf(piece);

                    return `
                        <span class="captured-piece">
                            ${PIECES[color][type]}
                        </span>
                    `;

                })
                .join("");


        computerCaptured.innerHTML =
            computerPieces
                .map(piece => {

                    const color =
                        ChessGame.colorOf(piece);

                    const type =
                        ChessGame.typeOf(piece);

                    return `
                        <span class="captured-piece">
                            ${PIECES[color][type]}
                        </span>
                    `;

                })
                .join("");

    },


    /* =====================================================
       MATERIAL
    ===================================================== */

    updateMaterial() {

        const material =
            document.getElementById(
                "materialDisplay"
            );


        if (!material) {
            return;
        }


        let playerScore = 0;
        let computerScore = 0;


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
                    PIECE_VALUES[
                        ChessGame.typeOf(piece)
                    ];


                if (
                    ChessGame.colorOf(piece) ===
                    ChessGame.playerColor
                ) {

                    playerScore += value;

                } else {

                    computerScore += value;

                }

            }

        }


        const difference =
            playerScore - computerScore;


        if (difference > 0) {

            material.textContent =
                `You +${difference}`;

        } else if (difference < 0) {

            material.textContent =
                `Computer +${Math.abs(difference)}`;

        } else {

            material.textContent =
                "Material Equal";

        }

    },


    /* =====================================================
       MOVE COUNT
    ===================================================== */

    updateMoveCount() {

        const element =
            document.getElementById(
                "moveCount"
            );


        if (!element) {
            return;
        }


        element.textContent =
            ChessGame.history.length;

    },


    /* =====================================================
       CLOCK
    ===================================================== */

    startPlayerClock() {

        this.stopClock();


        this.playerClockTimer =
            setInterval(() => {

                if (!this.gameStarted) {
                    return;
                }


                if (
                    ChessGame.turn !==
                    ChessGame.playerColor
                ) {

                    return;

                }


                this.playerClockSeconds--;

                this.updateClocks();


                if (
                    this.playerClockSeconds <= 0
                ) {

                    this.playerClockSeconds = 0;

                    this.stopClock();

                    ChessGame.gameOver = true;

                    ChessGame.winner =
                        ChessGame.computerColor;

                    this.updateGameStatus();

                    this.recordGameResult(
                        "loss"
                    );

                }

            }, 1000);

    },


    startComputerClock() {

        this.stopClock();


        this.computerClockTimer =
            setInterval(() => {

                if (!this.gameStarted) {
                    return;
                }


                if (
                    ChessGame.turn !==
                    ChessGame.computerColor
                ) {

                    return;

                }


                this.computerClockSeconds--;

                this.updateClocks();


                if (
                    this.computerClockSeconds <= 0
                ) {

                    this.computerClockSeconds = 0;

                    this.stopClock();

                    ChessGame.gameOver = true;

                    ChessGame.winner =
                        ChessGame.playerColor;

                    this.updateGameStatus();

                    this.recordGameResult(
                        "win"
                    );

                }

            }, 1000);

    },


    stopClock() {

        if (this.playerClockTimer) {

            clearInterval(
                this.playerClockTimer
            );

            this.playerClockTimer = null;

        }


        if (this.computerClockTimer) {

            clearInterval(
                this.computerClockTimer
            );

            this.computerClockTimer = null;

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
                    this.playerClockSeconds
                );

        }


        if (computerClock) {

            computerClock.textContent =
                this.formatTime(
                    this.computerClockSeconds
                );

        }

    },


    formatTime(seconds) {

        seconds =
            Math.max(
                0,
                seconds
            );


        const minutes =
            Math.floor(
                seconds / 60
            );


        const remaining =
            seconds % 60;


        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remaining).padStart(2, "0")
        );

    },


    /* =====================================================
       STATISTICS
    ===================================================== */

    loadStats() {

        const saved =
            localStorage.getItem(
                "chessAcademyStats"
            );


        if (saved) {

            try {

                this.stats =
                    JSON.parse(saved);

            } catch {

                this.stats = {
                    games: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0
                };

            }

        } else {

            this.stats = {
                games: 0,
                wins: 0,
                losses: 0,
                draws: 0
            };

        }

    },


    saveStats() {

        localStorage.setItem(
            "chessAcademyStats",
            JSON.stringify(
                this.stats
            )
        );

    },


    recordGameResult(result) {

        if (this.gameResultRecorded) {
            return;
        }


        this.gameResultRecorded = true;


        this.stats.games++;


        if (result === "win") {

            this.stats.wins++;

        } else if (result === "loss") {

            this.stats.losses++;

        } else {

            this.stats.draws++;

        }


        this.saveStats();

        this.updateStatistics();

    },


    updateStatistics() {

        if (!this.stats) {
            return;
        }


        const games =
            document.getElementById(
                "games"
            );

        const wins =
            document.getElementById(
                "wins"
            );

        const losses =
            document.getElementById(
                "losses"
            );

        const draws =
            document.getElementById(
                "draws"
            );


        if (games) {
            games.textContent =
                this.stats.games;
        }

        if (wins) {
            wins.textContent =
                this.stats.wins;
        }

        if (losses) {
            losses.textContent =
                this.stats.losses;
        }

        if (draws) {
            draws.textContent =
                this.stats.draws;
        }

    },


    /* =====================================================
       PWA
    ===================================================== */

    bindPWA() {

        const installButton =
            document.getElementById(
                "installButton"
            );


        if (!installButton) {
            return;
        }


        let deferredPrompt = null;


        window.addEventListener(
            "beforeinstallprompt",
            event => {

                event.preventDefault();

                deferredPrompt =
                    event;

                installButton.style.display =
                    "inline-flex";

            }
        );


        installButton.addEventListener(
            "click",
            async () => {

                if (!deferredPrompt) {
                    return;
                }


                deferredPrompt.prompt();


                await deferredPrompt.userChoice;


                deferredPrompt = null;

                installButton.style.display =
                    "none";

            }
        );

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
