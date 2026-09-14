/* ============================================================
   CHESS APPLICATION
   Main application controller
   Works with the supplied chess.js engine
============================================================ */

"use strict";


const App = {

    /* ========================================================
       STATE
    ======================================================== */

    currentSection: "home",

    gameStarted: false,

    difficulty: 3,

    playerColor: "w",

    computerColor: "b",

    timerInterval: null,

    playerTime: 600,

    computerTime: 600,

    lastMove: null,

    moveHistoryDisplay: [],

    capturedByPlayer: [],

    capturedByComputer: [],

    deferredInstallPrompt: null,

    stats: {
        games: 0,
        wins: 0,
        losses: 0,
        draws: 0
    },


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    init() {

        this.bindNavigation();

        this.bindHomeButtons();

        this.bindGameControls();

        this.bindBoard();

        this.bindPWA();

        this.loadStats();

        this.showSection("home");

        /*
         * IMPORTANT:
         * Do NOT start a game automatically.
         *
         * The board is prepared only when the user
         * enters PLAY GAME.
         */
    },


    /* ========================================================
       NAVIGATION
    ======================================================== */

    bindNavigation() {

        const navigationButtons =
            document.querySelectorAll(
                ".nav-button[data-section]"
            );


        navigationButtons.forEach(button => {

            button.addEventListener("click", () => {

                const section =
                    button.dataset.section;

                this.showSection(section);

            });

        });


        const logo =
            document.getElementById("homeLogo");


        if (logo) {

            logo.addEventListener("click", () => {

                this.showSection("home");

            });

        }

    },


    showSection(sectionName) {

        const sections =
            document.querySelectorAll(".section");


        sections.forEach(section => {

            section.classList.remove("active");

        });


        const target =
            document.getElementById(sectionName);


        if (target) {

            target.classList.add("active");

        }


        const navButtons =
            document.querySelectorAll(
                ".nav-button[data-section]"
            );


        navButtons.forEach(button => {

            button.classList.remove("active");


            if (
                button.dataset.section ===
                sectionName
            ) {

                button.classList.add("active");

            }

        });


        this.currentSection =
            sectionName;


        /*
         * When PLAY GAME is entered:
         *
         * SHOW THE CHESS BOARD.
         *
         * But DO NOT START THE GAME.
         */

        if (sectionName === "play") {

            this.prepareGameScreen();

        }


        /*
         * Stop any clock when leaving the game.
         */

        if (
            sectionName !== "play"
        ) {

            this.stopClock();

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },


    /* ========================================================
       HOME BUTTONS
    ======================================================== */

    bindHomeButtons() {

        const homePlayGame =
            document.getElementById(
                "homePlayGame"
            );


        if (homePlayGame) {

            homePlayGame.addEventListener(
                "click",
                () => {

                    this.showSection("play");

                }
            );

        }


        const homeAcademy =
            document.getElementById(
                "homeAcademy"
            );


        if (homeAcademy) {

            homeAcademy.addEventListener(
                "click",
                () => {

                    this.showSection("academy");

                }
            );

        }


        const homeExit =
            document.getElementById(
                "homeExit"
            );


        if (homeExit) {

            homeExit.addEventListener(
                "click",
                () => {

                    this.showSection("exit");

                }
            );

        }


        const gameHome =
            document.getElementById(
                "gameHome"
            );


        if (gameHome) {

            gameHome.addEventListener(
                "click",
                () => {

                    this.showSection("home");

                }
            );

        }


        const academyHome =
            document.getElementById(
                "academyHome"
            );


        if (academyHome) {

            academyHome.addEventListener(
                "click",
                () => {

                    this.showSection("home");

                }
            );

        }


        const returnHome =
            document.getElementById(
                "returnHome"
            );


        if (returnHome) {

            returnHome.addEventListener(
                "click",
                () => {

                    this.showSection("home");

                }
            );

        }

    },


    /* ========================================================
       GAME SCREEN PREVIEW
    ======================================================== */

    prepareGameScreen() {

        /*
         * If a real game is already running,
         * don't destroy it just because the user
         * clicked PLAY GAME again.
         */

        if (this.gameStarted) {

            this.renderBoard();

            return;

        }


        /*
         * Prepare a fresh starting board.
         *
         * This DOES NOT start the game.
         */

        const playerColorElement =
            document.getElementById(
                "playerColor"
            );


        const selectedColor =
            playerColorElement
                ? playerColorElement.value
                : "w";


        this.playerColor =
            selectedColor === "b"
                ? "b"
                : "w";


        this.computerColor =
            this.playerColor === "w"
                ? "b"
                : "w";


        /*
         * Initialize the chess engine only
         * so that the starting position can
         * be displayed.
         */

        ChessGame.init(
            this.playerColor
        );


        /*
         * IMPORTANT:
         *
         * gameStarted remains FALSE.
         *
         * Therefore the board cannot be played.
         */

        this.gameStarted = false;

        this.lastMove = null;

        this.capturedByPlayer = [];

        this.capturedByComputer = [];

        this.moveHistoryDisplay = [];


        this.resetClockDisplay();

        this.clearCapturedPieces();

        this.renderBoard();

        this.renderMoveHistory();

        this.updateMaterial();

        this.updateMoveCount();

        this.updateGameStatus(
            "Choose your settings and click NEW GAME."
        );


        this.showBoardOverlay(true);

    },


    /* ========================================================
       GAME CONTROLS
    ======================================================== */

    bindGameControls() {

        const startGame =
            document.getElementById(
                "startGame"
            );


        if (startGame) {

            startGame.addEventListener(
                "click",
                () => {

                    this.startNewGame();

                }
            );

        }


        const newGame =
            document.getElementById(
                "newGame"
            );


        if (newGame) {

            newGame.addEventListener(
                "click",
                () => {

                    this.startNewGame();

                }
            );

        }


        const undo =
            document.getElementById(
                "undoMove"
            );


        if (undo) {

            undo.addEventListener(
                "click",
                () => {

                    this.undoMove();

                }
            );

        }


        const resign =
            document.getElementById(
                "resignGame"
            );


        if (resign) {

            resign.addEventListener(
                "click",
                () => {

                    this.resignGame();

                }
            );

        }

    },


    /* ========================================================
       START NEW GAME
    ======================================================== */

    startNewGame() {

        const playerColorElement =
            document.getElementById(
                "playerColor"
            );


        const difficultyElement =
            document.getElementById(
                "difficulty"
            );


        this.playerColor =
            playerColorElement
                ? playerColorElement.value
                : "w";


        this.difficulty =
            difficultyElement
                ? Number(
                    difficultyElement.value
                )
                : 3;


        if (
            this.playerColor !== "w" &&
            this.playerColor !== "b"
        ) {

            this.playerColor = "w";

        }


        this.computerColor =
            this.playerColor === "w"
                ? "b"
                : "w";


        /*
         * Initialize actual chess game.
         */

        ChessGame.init(
            this.playerColor
        );


        this.gameStarted = true;

        this.lastMove = null;

        this.moveHistoryDisplay = [];

        this.capturedByPlayer = [];

        this.capturedByComputer = [];


        this.playerTime = 600;

        this.computerTime = 600;


        this.clearCapturedPieces();

        this.resetClockDisplay();

        this.renderBoard();

        this.renderMoveHistory();

        this.updateMaterial();

        this.updateMoveCount();

        this.updateGameStatus(
            this.playerColor === "w"
                ? "Your turn — White to move."
                : "Computer is thinking..."
        );


        this.showBoardOverlay(false);


        this.startClockForCurrentTurn();


        /*
         * If user selected BLACK,
         * computer must move first.
         */

        if (
            this.playerColor === "b"
        ) {

            setTimeout(() => {

                this.computerMove();

            }, 500);

        }

    },


    /* ========================================================
       BOARD
    ======================================================== */

    bindBoard() {

        const board =
            document.getElementById(
                "chessBoard"
            );


        if (!board) {

            return;

        }


        board.addEventListener(
            "click",
            (event) => {

                const square =
                    event.target.closest(
                        ".chess-square"
                    );


                if (!square) {

                    return;

                }


                const row =
                    Number(
                        square.dataset.row
                    );


                const col =
                    Number(
                        square.dataset.col
                    );


                this.handleSquareClick(
                    row,
                    col
                );

            }
        );

    },


    handleSquareClick(row, col) {

        /*
         * No moves before NEW GAME.
         */

        if (!this.gameStarted) {

            return;

        }


        /*
         * No moves after game over.
         */

        if (ChessGame.gameOver) {

            return;

        }


        /*
         * Only allow human player
         * to move on their own turn.
         */

        if (
            ChessGame.turn !==
            this.playerColor
        ) {

            return;

        }


        const piece =
            ChessGame.board[row][col];


        const pieceColor =
            ChessGame.colorOf(piece);


        /*
         * If a piece is already selected,
         * see if clicked square is a legal move.
         */

        if (
            ChessGame.selected
        ) {

            const selected =
                ChessGame.selected;


            const legalMoves =
                ChessGame.getMovesForSquare(
                    selected.r,
                    selected.c
                );


            const selectedMove =
                legalMoves.find(
                    move =>
                        move.to.r === row &&
                        move.to.c === col
                );


            if (selectedMove) {

                this.performPlayerMove(
                    selectedMove
                );

                return;

            }

        }


        /*
         * Select one of player's pieces.
         */

        if (
            piece &&
            pieceColor ===
                this.playerColor
        ) {

            ChessGame.selected = {
                r: row,
                c: col
            };


            ChessGame.legalMoves =
                ChessGame.getMovesForSquare(
                    row,
                    col
                );


            this.renderBoard();

            return;

        }


        /*
         * Clicking somewhere else
         * clears selection.
         */

        ChessGame.selected = null;

        ChessGame.legalMoves = [];

        this.renderBoard();

    },


    /* ========================================================
       PLAYER MOVE
    ======================================================== */

    performPlayerMove(move) {

        if (!this.gameStarted) {

            return;

        }


        const boardBefore =
            ChessGame.cloneBoard(
                ChessGame.board
            );


        const capturedPiece =
            this.getCapturedPieceForMove(
                move
            );


        const success =
            ChessGame.makeMove(move);


        if (!success) {

            this.renderBoard();

            return;

        }


        this.lastMove = move;


        this.recordMove(
            move,
            boardBefore,
            this.playerColor,
            capturedPiece
        );


        ChessGame.selected = null;

        ChessGame.legalMoves = [];


        this.renderBoard();

        this.renderMoveHistory();

        this.updateMaterial();

        this.updateMoveCount();


        if (
            this.finishIfGameOver()
        ) {

            return;

        }


        this.updateGameStatus(
            "Computer is thinking..."
        );


        this.startClockForCurrentTurn();


        setTimeout(() => {

            this.computerMove();

        }, 350);

    },


    /* ========================================================
       COMPUTER MOVE
    ======================================================== */

    computerMove() {

        if (!this.gameStarted) {

            return;

        }


        if (ChessGame.gameOver) {

            return;

        }


        if (
            ChessGame.turn !==
            this.computerColor
        ) {

            return;

        }


        this.updateGameStatus(
            "Computer is thinking..."
        );


        /*
         * Give browser time to update UI.
         */

        setTimeout(() => {

            const boardBefore =
                ChessGame.cloneBoard(
                    ChessGame.board
                );


            const bestMove =
                ChessGame.findBestMove(
                    this.difficulty
                );


            if (!bestMove) {

                this.finishIfGameOver();

                return;

            }


            const capturedPiece =
                this.getCapturedPieceForMove(
                    bestMove
                );


            const success =
                ChessGame.makeMove(
                    bestMove
                );


            if (!success) {

                return;

            }


            this.lastMove =
                bestMove;


            this.recordMove(
                bestMove,
                boardBefore,
                this.computerColor,
                capturedPiece
            );


            ChessGame.selected = null;

            ChessGame.legalMoves = [];


            this.renderBoard();

            this.renderMoveHistory();

            this.updateMaterial();

            this.updateMoveCount();


            if (
                this.finishIfGameOver()
            ) {

                return;

            }


            this.updateGameStatus(
                "Your turn."
            );


            this.startClockForCurrentTurn();

        }, 100);

    },


    /* ========================================================
       CAPTURED PIECE
    ======================================================== */

    getCapturedPieceForMove(move) {

        const board =
            ChessGame.board;


        /*
         * Normal capture.
         */

        if (
            board[
                move.to.r
            ][
                move.to.c
            ]
        ) {

            return board[
                move.to.r
            ][
                move.to.c
            ];

        }


        /*
         * En passant.
         */

        if (
            move.enPassant
        ) {

            return board[
                move.from.r
            ][
                move.to.c
            ];

        }


        return null;

    },


    /* ========================================================
       RECORD MOVE
    ======================================================== */

    recordMove(
        move,
        boardBefore,
        movingColor,
        capturedPiece
    ) {

        let notation;


        try {

            notation =
                ChessGame.moveNotation(
                    move,
                    boardBefore
                );

        } catch (error) {

            notation =
                this.createSimpleNotation(
                    move,
                    boardBefore
                );

        }


        this.moveHistoryDisplay.push({

            move: move,

            notation: notation,

            color: movingColor,

            captured: capturedPiece

        });


        /*
         * Captured piece belongs to
         * the player who made the capture.
         */

        if (capturedPiece) {

            if (
                movingColor ===
                this.playerColor
            ) {

                this.capturedByPlayer.push(
                    capturedPiece
                );

            } else {

                this.capturedByComputer.push(
                    capturedPiece
                );

            }

        }

    },


    createSimpleNotation(
        move,
        boardBefore
    ) {

        const piece =
            boardBefore[
                move.from.r
            ][
                move.from.c
            ];


        const type =
            ChessGame.typeOf(piece);


        const file =
            String.fromCharCode(
                97 + move.to.c
            );


        const rank =
            8 - move.to.r;


        const pieceLetters = {

            p: "",

            n: "N",

            b: "B",

            r: "R",

            q: "Q",

            k: "K"

        };


        return (
            pieceLetters[type] +
            file +
            rank
        );

    },


    /* ========================================================
       RENDER BOARD
    ======================================================== */

    renderBoard() {

        const boardElement =
            document.getElementById(
                "chessBoard"
            );


        if (!boardElement) {

            return;

        }


        boardElement.innerHTML = "";


        /*
         * When playing Black,
         * display board from Black's perspective.
         */

        const flipped =
            this.playerColor === "b";


        for (
            let displayRow = 0;
            displayRow < 8;
            displayRow++
        ) {

            for (
                let displayCol = 0;
                displayCol < 8;
                displayCol++
            ) {

                const row =
                    flipped
                        ? 7 - displayRow
                        : displayRow;


                const col =
                    flipped
                        ? 7 - displayCol
                        : displayCol;


                const square =
                    document.createElement(
                        "div"
                    );


                square.className =
                    "chess-square";


                square.classList.add(
                    (
                        row + col
                    ) % 2 === 0
                        ? "light"
                        : "dark"
                );


                square.dataset.row =
                    row;


                square.dataset.col =
                    col;


                /*
                 * Last move highlight.
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
                    ChessGame.selected &&
                    ChessGame.selected.r === row &&
                    ChessGame.selected.c === col
                ) {

                    square.classList.add(
                        "selected"
                    );

                }


                /*
                 * Legal move indicators.
                 */

                const legalMove =
                    ChessGame.legalMoves &&
                    ChessGame.legalMoves.find(
                        move =>
                            move.to.r === row &&
                            move.to.c === col
                    );


                if (legalMove) {

                    if (
                        ChessGame.board[row][col]
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


                /*
                 * Piece.
                 */

                const piece =
                    ChessGame.board[row][col];


                if (piece) {

                    const pieceElement =
                        document.createElement(
                            "span"
                        );


                    pieceElement.className =
                        "chess-piece";


                    const color =
                        ChessGame.colorOf(
                            piece
                        );


                    const type =
                        ChessGame.typeOf(
                            piece
                        );


                    pieceElement.textContent =
                        PIECES[
                            color
                        ][
                            type
                        ];


                    pieceElement.classList.add(
                        color === "w"
                            ? "white-piece"
                            : "black-piece"
                    );


                    square.appendChild(
                        pieceElement
                    );

                }


                /*
                 * Coordinates.
                 */

                if (
                    displayRow === 7
                ) {

                    const file =
                        document.createElement(
                            "span"
                        );


                    file.className =
                        "coordinate file-coordinate";


                    file.textContent =
                        String.fromCharCode(
                            97 + col
                        );


                    square.appendChild(
                        file
                    );

                }


                if (
                    displayCol === 0
                ) {

                    const rank =
                        document.createElement(
                            "span"
                        );


                    rank.className =
                        "coordinate rank-coordinate";


                    rank.textContent =
                        8 - row;


                    square.appendChild(
                        rank
                    );

                }


                boardElement.appendChild(
                    square
                );

            }

        }

    },


    /* ========================================================
       MOVE HISTORY
    ======================================================== */

    renderMoveHistory() {

        const container =
            document.getElementById(
                "moveHistory"
            );


        if (!container) {

            return;

        }


        container.innerHTML = "";


        if (
            this.moveHistoryDisplay.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "empty-history";


            empty.textContent =
                "No moves yet";


            container.appendChild(
                empty
            );


            return;

        }


        for (
            let i = 0;
            i <
            this.moveHistoryDisplay.length;
            i += 2
        ) {

            const whiteMove =
                this.moveHistoryDisplay[i];


            const blackMove =
                this.moveHistoryDisplay[i + 1];


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
                `${Math.floor(i / 2) + 1}.`;


            const white =
                document.createElement(
                    "span"
                );


            white.className =
                "white-move";


            white.textContent =
                whiteMove
                    ? whiteMove.notation
                    : "";


            const black =
                document.createElement(
                    "span"
                );


            black.className =
                "black-move";


            black.textContent =
                blackMove
                    ? blackMove.notation
                    : "";


            row.appendChild(
                number
            );


            row.appendChild(
                white
            );


            row.appendChild(
                black
            );


            container.appendChild(
                row
            );

        }

    },


    updateMoveCount() {

        const element =
            document.getElementById(
                "moveCount"
            );


        if (!element) {

            return;

        }


        const count =
            ChessGame.history
                ? ChessGame.history.length
                : this.moveHistoryDisplay.length;


        element.textContent =
            `${count} MOVES`;

    },


    /* ========================================================
       MATERIAL
    ======================================================== */

    updateMaterial() {

        const element =
            document.getElementById(
                "materialDisplay"
            );


        if (!element) {

            return;

        }


        let whiteMaterial = 0;

        let blackMaterial = 0;


        for (
            let row = 0;
            row < 8;
            row++
        ) {

            for (
                let col = 0;
                col < 8;
                col++
            ) {

                const piece =
                    ChessGame.board[
                        row
                    ][
                        col
                    ];


                if (!piece) {

                    continue;

                }


                const type =
                    ChessGame.typeOf(
                        piece
                    );


                const value =
                    PIECE_VALUES[type] || 0;


                if (
                    ChessGame.colorOf(
                        piece
                    ) === "w"
                ) {

                    whiteMaterial += value;

                } else {

                    blackMaterial += value;

                }

            }

        }


        const difference =
            whiteMaterial -
            blackMaterial;


        if (difference === 0) {

            element.textContent =
                "Equal";

            return;

        }


        if (difference > 0) {

            element.textContent =
                `White +${difference}`;

        } else {

            element.textContent =
                `Black +${Math.abs(
                    difference
                )}`;

        }

    },


    /* ========================================================
       CAPTURED PIECES
    ======================================================== */

    clearCapturedPieces() {

        const player =
            document.getElementById(
                "playerCaptured"
            );


        const computer =
            document.getElementById(
                "computerCaptured"
            );


        if (player) {

            player.innerHTML = "";

        }


        if (computer) {

            computer.innerHTML = "";

        }

    },


    renderCapturedPieces() {

        const player =
            document.getElementById(
                "playerCaptured"
            );


        const computer =
            document.getElementById(
                "computerCaptured"
            );


        if (player) {

            player.innerHTML =
                this.capturedByPlayer
                    .map(piece =>
                        this.pieceToSymbol(piece)
                    )
                    .join(" ");

        }


        if (computer) {

            computer.innerHTML =
                this.capturedByComputer
                    .map(piece =>
                        this.pieceToSymbol(piece)
                    )
                    .join(" ");

        }

    },


    pieceToSymbol(piece) {

        const color =
            ChessGame.colorOf(
                piece
            );


        const type =
            ChessGame.typeOf(
                piece
            );


        if (
            PIECES[color] &&
            PIECES[color][type]
        ) {

            return PIECES[color][type];

        }


        return "";

    },


    /* ========================================================
       STATUS
    ======================================================== */

    updateGameStatus(message) {

        const element =
            document.getElementById(
                "gameStatus"
            );


        if (element) {

            element.textContent =
                message;

        }

    },


    finishIfGameOver() {

        if (
            !ChessGame.gameOver
        ) {

            return false;

        }


        this.stopClock();


        this.gameStarted = false;


        let message =
            "Game over.";


        if (
            ChessGame.winner ===
            this.playerColor
        ) {

            message =
                "CHECKMATE — YOU WIN!";


            this.stats.wins++;

        }
        else if (
            ChessGame.winner ===
            this.computerColor
        ) {

            message =
                "CHECKMATE — COMPUTER WINS.";


            this.stats.losses++;

        }
        else {

            message =
                "DRAW — GAME OVER.";


            this.stats.draws++;

        }


        this.stats.games++;


        this.saveStats();

        this.updateStatsDisplay();

        this.updateGameStatus(
            message
        );

        this.showBoardOverlay(
            true,
            message
        );


        return true;

    },


    /* ========================================================
       RESIGN
    ======================================================== */

    resignGame() {

        if (
            !this.gameStarted
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                "Are you sure you want to resign?"
            );


        if (!confirmed) {

            return;

        }


        this.stopClock();


        this.gameStarted = false;


        this.stats.games++;

        this.stats.losses++;


        this.saveStats();

        this.updateStatsDisplay();


        this.updateGameStatus(
            "You resigned. Computer wins."
        );


        this.showBoardOverlay(
            true,
            "YOU RESIGNED"
        );

    },


    /* ========================================================
       UNDO
    ======================================================== */

    undoMove() {

        if (
            !this.gameStarted
        ) {

            return;

        }


        if (
            !ChessGame.history ||
            ChessGame.history.length === 0
        ) {

            return;

        }


        /*
         * Undo player's move AND
         * computer's previous move.
         *
         * This returns the game to
         * the player's turn.
         */

        let undoCount = 1;


        if (
            ChessGame.turn ===
            this.playerColor
        ) {

            undoCount = 2;

        }


        for (
            let i = 0;
            i < undoCount;
            i++
        ) {

            if (
                ChessGame.history.length > 0
            ) {

                ChessGame.undo();

            }

        }


        /*
         * Rebuild UI from engine history.
         */

        this.rebuildMoveData();


        ChessGame.gameOver = false;

        ChessGame.winner = null;


        this.lastMove = null;


        if (
            ChessGame.history.length > 0
        ) {

            const last =
                ChessGame.history[
                    ChessGame.history.length - 1
                ];


            if (last && last.move) {

                this.lastMove =
                    last.move;

            }

        }


        this.renderBoard();

        this.renderMoveHistory();

        this.updateMaterial();

        this.updateMoveCount();

        this.updateGameStatus(
            ChessGame.turn ===
            this.playerColor
                ? "Your turn."
                : "Computer's turn."
        );


        this.startClockForCurrentTurn();

    },


    rebuildMoveData() {

        this.moveHistoryDisplay = [];

        this.capturedByPlayer = [];

        this.capturedByComputer = [];


        /*
         * The engine history stores snapshots.
         * Reconstructing exact captured pieces
         * from snapshots is more reliable by
         * replaying the current history when
         * available.
         *
         * If history entries contain move data,
         * use those entries.
         */

        if (
            Array.isArray(
                ChessGame.history
            )
        ) {

            ChessGame.history.forEach(
                item => {

                    if (
                        !item ||
                        !item.move
                    ) {

                        return;

                    }


                    const movingColor =
                        item.move.color ||
                        null;


                    this.moveHistoryDisplay.push({

                        move: item.move,

                        notation:
                            item.notation ||
                            this.createSimpleNotation(
                                item.move,
                                item.boardBefore ||
                                ChessGame.board
                            ),

                        color:
                            movingColor ||
                            (
                                this.moveHistoryDisplay.length % 2 === 0
                                    ? "w"
                                    : "b"
                            ),

                        captured:
                            item.captured || null

                    });

                }
            );

        }

    },


    /* ========================================================
       BOARD OVERLAY
    ======================================================== */

    showBoardOverlay(
        show,
        message = null
    ) {

        const overlay =
            document.getElementById(
                "boardOverlay"
            );


        if (!overlay) {

            return;

        }


        if (show) {

            overlay.classList.add(
                "visible"
            );


            const title =
                overlay.querySelector(
                    "h2"
                );


            const paragraph =
                overlay.querySelector(
                    "p"
                );


            if (
                message &&
                title
            ) {

                title.textContent =
                    message;

            }


            if (
                message &&
                paragraph
            ) {

                paragraph.textContent =
                    "Start a new game to play again.";

            }

        } else {

            overlay.classList.remove(
                "visible"
            );

        }

    },


    /* ========================================================
       CLOCK
    ======================================================== */

    resetClockDisplay() {

        this.playerTime = 600;

        this.computerTime = 600;

        this.updateClockDisplay();

    },


    updateClockDisplay() {

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

        const safeSeconds =
            Math.max(
                0,
                Number(seconds) || 0
            );


        const minutes =
            Math.floor(
                safeSeconds / 60
            );


        const remainingSeconds =
            safeSeconds % 60;


        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(
                remainingSeconds
            ).padStart(2, "0")
        );

    },


    startClockForCurrentTurn() {

        this.stopClock();


        if (
            !this.gameStarted
        ) {

            return;

        }


        this.timerInterval =
            setInterval(
                () => {

                    if (
                        !this.gameStarted ||
                        ChessGame.gameOver
                    ) {

                        this.stopClock();

                        return;

                    }


                    if (
                        ChessGame.turn ===
                        this.playerColor
                    ) {

                        this.playerTime--;

                    } else {

                        this.computerTime--;

                    }


                    this.updateClockDisplay();


                    if (
                        this.playerTime <= 0
                    ) {

                        this.handleTimeOut(
                            this.playerColor
                        );

                    }


                    if (
                        this.computerTime <= 0
                    ) {

                        this.handleTimeOut(
                            this.computerColor
                        );

                    }

                },
                1000
            );

    },


    stopClock() {

        if (
            this.timerInterval
        ) {

            clearInterval(
                this.timerInterval
            );

            this.timerInterval =
                null;

        }

    },


    handleTimeOut(color) {

        this.stopClock();


        this.gameStarted = false;


        if (
            color ===
            this.playerColor
        ) {

            this.stats.games++;

            this.stats.losses++;


            this.updateGameStatus(
                "TIME OUT — COMPUTER WINS."
            );


            this.showBoardOverlay(
                true,
                "TIME OUT"
            );

        } else {

            this.stats.games++;

            this.stats.wins++;


            this.updateGameStatus(
                "TIME OUT — YOU WIN!"
            );


            this.showBoardOverlay(
                true,
                "YOU WIN"
            );

        }


        this.saveStats();

        this.updateStatsDisplay();

    },


    /* ========================================================
       STATISTICS
    ======================================================== */

    loadStats() {

        try {

            const saved =
                localStorage.getItem(
                    "chessStats"
                );


            if (saved) {

                const parsed =
                    JSON.parse(
                        saved
                    );


                this.stats = {

                    games:
                        Number(
                            parsed.games
                        ) || 0,

                    wins:
                        Number(
                            parsed.wins
                        ) || 0,

                    losses:
                        Number(
                            parsed.losses
                        ) || 0,

                    draws:
                        Number(
                            parsed.draws
                        ) || 0

                };

            }

        } catch (error) {

            console.warn(
                "Unable to load chess statistics.",
                error
            );

        }


        this.updateStatsDisplay();

    },


    saveStats() {

        try {

            localStorage.setItem(
                "chessStats",
                JSON.stringify(
                    this.stats
                )
            );

        } catch (error) {

            console.warn(
                "Unable to save chess statistics.",
                error
            );

        }

    },


    updateStatsDisplay() {

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


    /* ========================================================
       PWA
    ======================================================== */

    bindPWA() {

        const installButton =
            document.getElementById(
                "installButton"
            );


        window.addEventListener(
            "beforeinstallprompt",
            event => {

                event.preventDefault();


                this.deferredInstallPrompt =
                    event;


                if (installButton) {

                    installButton.style.display =
                        "inline-flex";

                }

            }
        );


        if (installButton) {

            installButton.addEventListener(
                "click",
                async () => {

                    if (
                        !this.deferredInstallPrompt
                    ) {

                        return;

                    }


                    this.deferredInstallPrompt.prompt();


                    try {

                        await this.deferredInstallPrompt.userChoice;

                    } catch (error) {

                        console.warn(
                            "PWA installation was cancelled.",
                            error
                        );

                    }


                    this.deferredInstallPrompt =
                        null;


                    installButton.style.display =
                        "none";

                }
            );

        }


        window.addEventListener(
            "appinstalled",
            () => {

                this.deferredInstallPrompt =
                    null;


                if (installButton) {

                    installButton.style.display =
                        "none";

                }

            }
        );

    }

};


/* ============================================================
   START APPLICATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);
