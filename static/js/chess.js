/* =========================================================
   CHESS ENGINE
========================================================= */

const PIECES = {

    w: {
        K: "♔",
        Q: "♕",
        R: "♖",
        B: "♗",
        N: "♘",
        P: "♙"
    },

    b: {
        K: "♚",
        Q: "♛",
        R: "♜",
        B: "♝",
        N: "♞",
        P: "♟"
    }

};


let board = [];

let turn = "w";

let selectedSquare = null;

let legalMovesForSelected = [];

let gameOver = false;

let playerColor = "w";

let computerColor = "b";

let moveHistory = [];

let positionHistory = [];

let capturedPieces = [];

let boardFlipped = false;

let difficulty = 3;


/* =========================================================
   INITIAL BOARD
========================================================= */

function createInitialBoard() {

    return [

        [
            "r",
            "n",
            "b",
            "q",
            "k",
            "b",
            "n",
            "r"
        ],

        [
            "p",
            "p",
            "p",
            "p",
            "p",
            "p",
            "p",
            "p"
        ],

        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],

        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],

        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],

        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],

        [
            "P",
            "P",
            "P",
            "P",
            "P",
            "P",
            "P"
        ],

        [
            "R",
            "N",
            "B",
            "Q",
            "K",
            "B",
            "N",
            "R"
        ]

    ];

}


/* =========================================================
   HELPERS
========================================================= */

function isWhite(piece) {

    return piece &&
        piece === piece.toUpperCase();

}


function pieceColor(piece) {

    if (!piece) {
        return null;
    }

    return isWhite(piece) ? "w" : "b";

}


function oppositeColor(color) {

    return color === "w"
        ? "b"
        : "w";

}


function cloneBoard(source) {

    return source.map(
        row => [...row]
    );

}


function squareName(row, col) {

    return (
        String.fromCharCode(97 + col)
        +
        (8 - row)
    );

}


function insideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );

}


/* =========================================================
   FIND KING
========================================================= */

function findKing(position, color) {

    const king =
        color === "w"
            ? "K"
            : "k";

    for (let r = 0; r < 8; r++) {

        for (let c = 0; c < 8; c++) {

            if (position[r][c] === king) {

                return {
                    row: r,
                    col: c
                };

            }

        }

    }

    return null;

}


/* =========================================================
   ATTACK CHECK
========================================================= */

function squareAttacked(
    position,
    row,
    col,
    byColor
) {

    const pawn =
        byColor === "w"
            ? "P"
            : "p";

    const pawnDirection =
        byColor === "w"
            ? 1
            : -1;

    for (const dc of [-1, 1]) {

        const r = row + pawnDirection;

        const c = col + dc;

        if (
            insideBoard(r, c) &&
            position[r][c] === pawn
        ) {
            return true;
        }

    }


    const knight =
        byColor === "w"
            ? "N"
            : "n";

    const knightOffsets = [

        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]

    ];

    for (const [dr, dc] of knightOffsets) {

        const r = row + dr;
        const c = col + dc;

        if (
            insideBoard(r, c) &&
            position[r][c] === knight
        ) {
            return true;
        }

    }


    const enemyKing =
        byColor === "w"
            ? "K"
            : "k";

    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (!dr && !dc) {
                continue;
            }

            const r = row + dr;
            const c = col + dc;

            if (
                insideBoard(r, c) &&
                position[r][c] === enemyKing
            ) {
                return true;
            }

        }

    }


    const rook =
        byColor === "w"
            ? "R"
            : "r";

    const queen =
        byColor === "w"
            ? "Q"
            : "q";

    const bishop =
        byColor === "w"
            ? "B"
            : "b";


    const rookDirections = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];


    for (const [dr, dc] of rookDirections) {

        let r = row + dr;
        let c = col + dc;

        while (insideBoard(r, c)) {

            const piece = position[r][c];

            if (piece) {

                if (
                    piece === rook ||
                    piece === queen
                ) {
                    return true;
                }

                break;
            }

            r += dr;
            c += dc;
        }

    }


    const bishopDirections = [

        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]

    ];


    for (const [dr, dc] of bishopDirections) {

        let r = row + dr;
        let c = col + dc;

        while (insideBoard(r, c)) {

            const piece = position[r][c];

            if (piece) {

                if (
                    piece === bishop ||
                    piece === queen
                ) {
                    return true;
                }

                break;
            }

            r += dr;
            c += dc;
        }

    }

    return false;

}


/* =========================================================
   CHECK
========================================================= */

function isInCheck(position, color) {

    const king = findKing(
        position,
        color
    );

    if (!king) {
        return true;
    }

    return squareAttacked(
        position,
        king.row,
        king.col,
        oppositeColor(color)
    );

}


/* =========================================================
   PSEUDO MOVES
========================================================= */

function pseudoMoves(
    position,
    row,
    col
) {

    const piece = position[row][col];

    if (!piece) {
        return [];
    }

    const color =
        pieceColor(piece);

    const type =
        piece.toUpperCase();

    const moves = [];


    function addMove(
        r,
        c
    ) {

        if (!insideBoard(r, c)) {
            return;
        }

        const target =
            position[r][c];

        if (
            target &&
            pieceColor(target) === color
        ) {
            return;
        }

        moves.push({
            from: {
                row,
                col
            },

            to: {
                row: r,
                col: c
            }
        });

    }


    if (type === "P") {

        const direction =
            color === "w"
                ? -1
                : 1;

        const startRow =
            color === "w"
                ? 6
                : 1;


        if (
            insideBoard(
                row + direction,
                col
            ) &&
            !position[
                row + direction
            ][col]
        ) {

            moves.push({
                from: {
                    row,
                    col
                },

                to: {
                    row: row + direction,
                    col
                }
            });


            if (
                row === startRow &&
                !position[
                    row + direction * 2
                ][col]
            ) {

                moves.push({
                    from: {
                        row,
                        col
                    },

                    to: {
                        row:
                            row + direction * 2,
                        col
                    }
                });

            }

        }


        for (const dc of [-1, 1]) {

            const r =
                row + direction;

            const c =
                col + dc;

            if (!insideBoard(r, c)) {
                continue;
            }

            const target =
                position[r][c];

            if (
                target &&
                pieceColor(target) !== color
            ) {

                moves.push({
                    from: {
                        row,
                        col
                    },

                    to: {
                        row: r,
                        col: c
                    }
                });

            }

        }

    }


    if (type === "N") {

        const offsets = [

            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]

        ];

        offsets.forEach(
            ([dr, dc]) =>
                addMove(
                    row + dr,
                    col + dc
                )
        );

    }


    if (
        type === "B" ||
        type === "R" ||
        type === "Q"
    ) {

        let directions = [];

        if (
            type === "B" ||
            type === "Q"
        ) {

            directions.push(
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            );

        }

        if (
            type === "R" ||
            type === "Q"
        ) {

            directions.push(
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            );

        }


        for (const [dr, dc] of directions) {

            let r = row + dr;
            let c = col + dc;

            while (
                insideBoard(r, c)
            ) {

                const target =
                    position[r][c];

                if (!target) {

                    moves.push({
                        from: {
                            row,
                            col
                        },

                        to: {
                            row: r,
                            col: c
                        }
                    });

                } else {

                    if (
                        pieceColor(target)
                        !== color
                    ) {

                        moves.push({
                            from: {
                                row,
                                col
                            },

                            to: {
                                row: r,
                                col: c
                            }
                        });

                    }

                    break;
                }

                r += dr;
                c += dc;

            }

        }

    }


    if (type === "K") {

        for (
            let dr = -1;
            dr <= 1;
            dr++
        ) {

            for (
                let dc = -1;
                dc <= 1;
                dc++
            ) {

                if (!dr && !dc) {
                    continue;
                }

                addMove(
                    row + dr,
                    col + dc
                );

            }

        }

    }

    return moves;

}


/* =========================================================
   APPLY MOVE
========================================================= */

function applyMove(
    position,
    move
) {

    const next =
        cloneBoard(position);

    const piece =
        next[
            move.from.row
        ][
            move.from.col
        ];

    next[
        move.to.row
    ][
        move.to.col
    ] = piece;

    next[
        move.from.row
    ][
        move.from.col
    ] = "";


    /* PROMOTION */

    if (
        piece === "P" &&
        move.to.row === 0
    ) {

        next[
            move.to.row
        ][
            move.to.col
        ] = "Q";

    }


    if (
        piece === "p" &&
        move.to.row === 7
    ) {

        next[
            move.to.row
        ][
            move.to.col
        ] = "q";

    }

    return next;

}


/* =========================================================
   LEGAL MOVES
========================================================= */

function legalMoves(
    position,
    color
) {

    const result = [];


    for (let r = 0; r < 8; r++) {

        for (let c = 0; c < 8; c++) {

            const piece =
                position[r][c];

            if (
                !piece ||
                pieceColor(piece) !== color
            ) {
                continue;
            }


            const candidates =
                pseudoMoves(
                    position,
                    r,
                    c
                );


            for (const move of candidates) {

                const next =
                    applyMove(
                        position,
                        move
                    );

                if (
                    !isInCheck(
                        next,
                        color
                    )
                ) {

                    result.push(move);

                }

            }

        }

    }

    return result;

}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

    const container =
        document.getElementById(
            "chessBoard"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const rows =
        boardFlipped
            ? [...Array(8).keys()].reverse()
            : [...Array(8).keys()];

    const cols =
        boardFlipped
            ? [...Array(8).keys()].reverse()
            : [...Array(8).keys()];


    for (const row of rows) {

        for (const col of cols) {

            const square =
                document.createElement(
                    "div"
                );

            square.classList.add(
                "square"
            );


            if (
                (row + col) % 2 === 0
            ) {

                square.classList.add(
                    "light-square"
                );

            } else {

                square.classList.add(
                    "dark-square"
                );

            }


            square.dataset.row = row;
            square.dataset.col = col;

            square.dataset.file =
                String.fromCharCode(
                    97 + col
                );

            square.dataset.rank =
                8 - row;


            const piece =
                board[row][col];


            if (piece) {

                square.textContent =
                    PIECES[
                        pieceColor(piece)
                    ][
                        piece.toUpperCase()
                    ];


                if (
                    pieceColor(piece)
                    === "w"
                ) {

                    square.classList.add(
                        "white-piece"
                    );

                } else {

                    square.classList.add(
                        "black-piece"
                    );

                }

            }


            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {

                square.classList.add(
                    "selected"
                );

            }


            if (
                legalMovesForSelected.some(
                    move =>
                        move.to.row === row &&
                        move.to.col === col
                )
            ) {

                square.classList.add(
                    "legal-move"
                );


                if (piece) {

                    square.classList.add(
                        "capture-target"
                    );

                }

            }


            square.addEventListener(
                "click",
                handleSquareClick
            );


            container.appendChild(
                square
            );

        }

    }

}


/* =========================================================
   CLICK HANDLER
========================================================= */

function handleSquareClick(event) {

    if (gameOver) {
        return;
    }


    if (turn !== playerColor) {
        return;
    }


    const row =
        Number(
            event.currentTarget.dataset.row
        );

    const col =
        Number(
            event.currentTarget.dataset.col
        );


    const piece =
        board[row][col];


    if (
        selectedSquare
    ) {

        const selectedMove =
            legalMovesForSelected.find(
                move =>
                    move.to.row === row &&
                    move.to.col === col
            );


        if (selectedMove) {

            makeMove(
                selectedMove,
                true
            );

            return;

        }

    }


    if (
        piece &&
        pieceColor(piece) === playerColor
    ) {

        selectedSquare = {
            row,
            col
        };

        legalMovesForSelected =
            legalMoves(
                board,
                playerColor
            ).filter(
                move =>
                    move.from.row === row &&
                    move.from.col === col
            );

        renderBoard();

        return;

    }


    selectedSquare = null;

    legalMovesForSelected = [];

    renderBoard();

}


/* =========================================================
   MAKE MOVE
========================================================= */

function makeMove(
    move,
    humanMove = false
) {

    if (gameOver) {
        return;
    }


    const movingPiece =
        board[
            move.from.row
        ][
            move.from.col
        ];


    const captured =
        board[
            move.to.row
        ][
            move.to.col
        ];


    if (captured) {

        capturedPieces.push(
            captured
        );

    }


    const oldBoard =
        cloneBoard(board);


    positionHistory.push(
        oldBoard
    );


    board =
        applyMove(
            board,
            move
        );


    moveHistory.push({

        from:
            squareName(
                move.from.row,
                move.from.col
            ),

        to:
            squareName(
                move.to.row,
                move.to.col
            ),

        piece:
            movingPiece,

        captured:
            captured || ""

    });


    turn =
        oppositeColor(turn);


    selectedSquare = null;

    legalMovesForSelected = [];


    renderBoard();

    updateMoveHistory();

    updateCaptured();

    updateGameStatus();


    if (
        window.switchChessClock
    ) {

        window.switchChessClock(
            turn
        );

    }


    checkGameEnd();


    if (
        !gameOver &&
        turn === computerColor
    ) {

        setTimeout(
            computerMove,
            350
        );

    }

}


/* =========================================================
   COMPUTER
========================================================= */

function computerMove() {

    if (gameOver) {
        return;
    }


    if (turn !== computerColor) {
        return;
    }


    const moves =
        legalMoves(
            board,
            computerColor
        );


    if (!moves.length) {
        checkGameEnd();
        return;
    }


    const depth =
        Math.min(
            Number(difficulty),
            3
        );


    let bestMove =
        moves[
            Math.floor(
                Math.random() *
                moves.length
            )
        ];


    let bestScore =
        computerColor === "w"
            ? -Infinity
            : Infinity;


    for (const move of moves) {

        const next =
            applyMove(
                board,
                move
            );


        const score =
            minimax(
                next,
                oppositeColor(
                    computerColor
                ),
                depth - 1,
                -Infinity,
                Infinity
            );


        if (
            computerColor === "w"
        ) {

            if (score > bestScore) {

                bestScore = score;

                bestMove = move;

            }

        } else {

            if (score < bestScore) {

                bestScore = score;

                bestMove = move;

            }

        }

    }


    makeMove(
        bestMove,
        false
    );

}


/* =========================================================
   AI EVALUATION
========================================================= */

const pieceValues = {

    P: 100,
    N: 320,
    B: 330,
    R: 500,
    Q: 900,
    K: 20000

};


function evaluate(position) {

    let score = 0;


    for (let r = 0; r < 8; r++) {

        for (let c = 0; c < 8; c++) {

            const piece =
                position[r][c];

            if (!piece) {
                continue;
            }


            const value =
                pieceValues[
                    piece.toUpperCase()
                ];


            if (
                pieceColor(piece) === "w"
            ) {

                score += value;

            } else {

                score -= value;

            }

        }

    }


    return score;

}


function minimax(
    position,
    side,
    depth,
    alpha,
    beta
) {

    const moves =
        legalMoves(
            position,
            side
        );


    if (depth <= 0) {

        return evaluate(
            position
        );

    }


    if (!moves.length) {

        if (
            isInCheck(
                position,
                side
            )
        ) {

            return side === "w"
                ? -999999
                : 999999;

        }

        return 0;

    }


    if (side === "w") {

        let best = -Infinity;

        for (const move of moves) {

            const next =
                applyMove(
                    position,
                    move
                );

            best =
                Math.max(
                    best,
                    minimax(
                        next,
                        "b",
                        depth - 1,
                        alpha,
                        beta
                    )
                );


            alpha =
                Math.max(
                    alpha,
                    best
                );


            if (
                beta <= alpha
            ) {
                break;
            }

        }

        return best;

    } else {

        let best = Infinity;

        for (const move of moves) {

            const next =
                applyMove(
                    position,
                    move
                );

            best =
                Math.min(
                    best,
                    minimax(
                        next,
                        "w",
                        depth - 1,
                        alpha,
                        beta
                    )
                );


            beta =
                Math.min(
                    beta,
                    best
                );


            if (
                beta <= alpha
            ) {
                break;
            }

        }

        return best;

    }

}


/* =========================================================
   GAME STATUS
========================================================= */

function updateGameStatus() {

    const status =
        document.getElementById(
            "gameStatus"
        );

    const turnText =
        document.getElementById(
            "turnText"
        );


    if (!status || !turnText) {
        return;
    }


    if (turn === playerColor) {

        status.textContent =
            "Your turn";

        turnText.textContent =
            playerColor === "w"
                ? "You are playing White"
                : "You are playing Black";

    } else {

        status.textContent =
            "Computer is thinking...";

        turnText.textContent =
            "Computer's turn";

    }

}


/* =========================================================
   CHECK GAME END
========================================================= */

function checkGameEnd() {

    const moves =
        legalMoves(
            board,
            turn
        );


    if (moves.length > 0) {

        if (
            isInCheck(
                board,
                turn
            )
        ) {

            document.getElementById(
                "gameStatus"
            ).textContent =
                "Check!";

        }

        return;

    }


    gameOver = true;


    if (
        isInCheck(
            board,
            turn
        )
    ) {

        const winner =
            oppositeColor(turn);


        if (
            winner === playerColor
        ) {

            finishGame(
                "win",
                "Checkmate!",
                "You won the game."
            );

        } else {

            finishGame(
                "loss",
                "Checkmate!",
                "The computer won the game."
            );

        }

    } else {

        finishGame(
            "draw",
            "Draw",
            "The game ended in a draw."
        );

    }


    if (
        window.stopChessClock
    ) {

        window.stopChessClock();

    }

}


/* =========================================================
   MOVE HISTORY
========================================================= */

function updateMoveHistory() {

    const container =
        document.getElementById(
            "moveHistory"
        );

    const count =
        document.getElementById(
            "moveCount"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!moveHistory.length) {

        container.innerHTML =
            '<div class="empty-moves">No moves yet.</div>';

        if (count) {
            count.textContent = "0";
        }

        return;
    }


    for (
        let i = 0;
        i < moveHistory.length;
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
            `${Math.floor(i / 2) + 1}.`;


        const white =
            document.createElement(
                "span"
            );

        white.className =
            "move";


        const whiteMove =
            moveHistory[i];

        white.textContent =
            `${whiteMove.from}-${whiteMove.to}`;


        const black =
            document.createElement(
                "span"
            );

        black.className =
            "move";


        if (
            moveHistory[i + 1]
        ) {

            const blackMove =
                moveHistory[i + 1];

            black.textContent =
                `${blackMove.from}-${blackMove.to}`;

        }


        row.appendChild(number);

        row.appendChild(white);

        row.appendChild(black);

        container.appendChild(row);

    }


    if (count) {

        count.textContent =
            moveHistory.length;

    }


    container.scrollTop =
        container.scrollHeight;

}


/* =========================================================
   CAPTURED PIECES
========================================================= */

function updateCaptured() {

    const container =
        document.getElementById(
            "capturedPieces"
        );


    if (!container) {
        return;
    }


    if (!capturedPieces.length) {

        container.innerHTML =
            '<span class="captured-label">None</span>';

        return;

    }


    container.innerHTML = "";


    capturedPieces.forEach(
        piece => {

            const span =
                document.createElement(
                    "span"
                );

            span.className =
                "captured-piece " +
                (
                    pieceColor(piece)
                    === "w"
                        ? "white"
                        : "black"
                );

            span.textContent =
                PIECES[
                    pieceColor(piece)
                ][
                    piece.toUpperCase()
                ];

            container.appendChild(
                span
            );

        }
    );

}


/* =========================================================
   START NEW GAME
========================================================= */

function newGame(
    selectedColor = playerColor
) {

    playerColor =
        selectedColor === "b"
            ? "b"
            : "w";


    computerColor =
        oppositeColor(
            playerColor
        );


    difficulty =
        Number(
            document.getElementById(
                "difficulty"
            )?.value || 3
        );


    board =
        createInitialBoard();


    turn = "w";

    selectedSquare = null;

    legalMovesForSelected = [];

    gameOver = false;

    moveHistory = [];

    positionHistory = [];

    capturedPieces = [];


    renderBoard();

    updateMoveHistory();

    updateCaptured();

    updateGameStatus();


    updatePlayerInterface();


    if (
        window.resetChessClock
    ) {

        window.resetChessClock();

    }


    /*
       IMPORTANT:
       If user chooses BLACK, the computer
       must make the first move because
       White always moves first.
    */

    if (
        playerColor === "b"
    ) {

        setTimeout(
            computerMove,
            500
        );

    }

}


/* =========================================================
   UPDATE PLAYER INTERFACE
========================================================= */

function updatePlayerInterface() {

    const colorText =
        document.getElementById(
            "playerColorText"
        );


    const playerAvatar =
        document.querySelector(
            ".user-avatar"
        );


    if (
        colorText
    ) {

        colorText.textContent =
            playerColor === "w"
                ? "White"
                : "Black";

    }


    if (
        playerAvatar
    ) {

        playerAvatar.textContent =
            playerColor === "w"
                ? "♔"
                : "♚";

    }


    const computerAvatar =
        document.querySelector(
            ".computer-avatar"
        );


    if (
        computerAvatar
    ) {

        computerAvatar.textContent =
            computerColor === "w"
                ? "♔"
                : "♚";

    }


    const computerRating =
        document.getElementById(
            "computerRating"
        );


    if (
        computerRating
    ) {

        computerRating.textContent =
            `Level ${difficulty} • Engine`;

    }

}


/* =========================================================
   UNDO
========================================================= */

function undoMove() {

    if (
        gameOver ||
        !positionHistory.length
    ) {
        return;
    }


    /*
       When playing against computer,
       undo both the computer move and
       your previous move.
    */

    if (
        playerColor !== turn &&
        positionHistory.length >= 1
    ) {

        board =
            positionHistory.pop();

        if (
            moveHistory.length
        ) {

            moveHistory.pop();

        }

    }


    if (
        playerColor === turn &&
        positionHistory.length >= 1
    ) {

        board =
            positionHistory.pop();

        if (
            moveHistory.length
        ) {

            moveHistory.pop();

        }

    }


    turn =
        playerColor;


    selectedSquare = null;

    legalMovesForSelected = [];

    capturedPieces = [];


    rebuildCaptured();

    renderBoard();

    updateMoveHistory();

    updateCaptured();

    updateGameStatus();


    if (
        window.resetChessClock
    ) {

        window.resetChessClock();

    }

}


/* =========================================================
   REBUILD CAPTURED
========================================================= */

function rebuildCaptured() {

    capturedPieces = [];


    const starting = [

        "r",
        "n",
        "b",
        "q",
        "k",
        "b",
        "n",
        "r",

        "p",
        "p",
        "p",
        "p",
        "p",
        "p",
        "p",
        "p",

        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",

        "R",
        "N",
        "B",
        "Q",
        "K",
        "B",
        "N",
        "R"

    ];


    const current = [];

    for (const row of board) {

        for (const piece of row) {

            if (piece) {
                current.push(piece);
            }

        }

    }


    const remaining =
        [...current];


    for (
        const piece
        of starting
    ) {

        const index =
            remaining.indexOf(
                piece
            );

        if (
            index >= 0
        ) {

            remaining.splice(
                index,
                1
            );

        } else {

            capturedPieces.push(
                piece
            );

        }

    }

}


/* =========================================================
   RESIGN
========================================================= */

function resignGame() {

    if (gameOver) {
        return;
    }


    finishGame(
        "loss",
        "You Resigned",
        "The game has been resigned."
    );

}


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame(
    result,
    title,
    message
) {

    gameOver = true;


    if (
        window.stopChessClock
    ) {

        window.stopChessClock();

    }


    saveResult(
        result
    );


    const modal =
        document.getElementById(
            "gameModal"
        );

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );

    const modalMessage =
        document.getElementById(
            "modalMessage"
        );

    const modalIcon =
        document.getElementById(
            "modalIcon"
        );


    if (
        modalTitle
    ) {

        modalTitle.textContent =
            title;

    }


    if (
        modalMessage
    ) {

        modalMessage.textContent =
            message;

    }


    if (
        modalIcon
    ) {

        modalIcon.textContent =
            result === "win"
                ? "♛"
                : result === "draw"
                    ? "½"
                    : "♟";

    }


    if (
        modal
    ) {

        modal.classList.add(
            "show"
        );

    }

}


/* =========================================================
   SAVE STATISTICS
========================================================= */

function saveResult(
    result
) {

    const stats =
        JSON.parse(
            localStorage.getItem(
                "chessStats"
            ) ||
            '{"games":0,"wins":0,"losses":0,"draws":0}'
        );


    stats.games++;


    if (
        result === "win"
    ) {
        stats.wins++;
    }

    if (
        result === "loss"
    ) {
        stats.losses++;
    }

    if (
        result === "draw"
    ) {
        stats.draws++;
    }


    localStorage.setItem(
        "chessStats",
        JSON.stringify(stats)
    );


    updateStatistics();

}


function updateStatistics() {

    const stats =
        JSON.parse(
            localStorage.getItem(
                "chessStats"
            ) ||
            '{"games":0,"wins":0,"losses":0,"draws":0}'
        );


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

}


/* =========================================================
   FLIP BOARD
========================================================= */

function flipBoard() {

    boardFlipped =
        !boardFlipped;

    renderBoard();

}


/* =========================================================
   EXPORTS
========================================================= */

window.newGame =
    newGame;

window.undoMove =
    undoMove;

window.resignGame =
    resignGame;

window.flipBoard =
    flipBoard;


/* =========================================================
   INITIAL
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateStatistics();

        newGame("w");

    }
);
