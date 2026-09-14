/* =========================================================
   CHESS MASTER ENGINE
========================================================= */

const PIECES = {

    w: {
        k: "♔",
        q: "♕",
        r: "♖",
        b: "♗",
        n: "♘",
        p: "♙"
    },

    b: {
        k: "♚",
        q: "♛",
        r: "♜",
        b: "♝",
        n: "♞",
        p: "♟"
    }

};


let board = [];

let turn = "w";

let selectedSquare = null;

let legalTargets = [];

let moveHistory = [];

let gameOver = false;

let playerColor = "w";

let computerColor = "b";

let boardFlipped = false;

let castlingRights = {

    wK: true,
    wQ: true,
    bK: true,
    bQ: true

};

let enPassantTarget = null;

let pendingPromotion = null;

let undoStack = [];


/* =========================================================
   INITIAL BOARD
========================================================= */

function createInitialBoard() {

    return [

        [
            "br","bn","bb","bq",
            "bk","bb","bn","br"
        ],

        [
            "bp","bp","bp","bp",
            "bp","bp","bp","bp"
        ],

        [
            null,null,null,null,
            null,null,null,null
        ],

        [
            null,null,null,null,
            null,null,null,null
        ],

        [
            null,null,null,null,
            null,null,null,null
        ],

        [
            null,null,null,null,
            null,null,null,null
        ],

        [
            "wp","wp","wp","wp",
            "wp","wp","wp","wp"
        ],

        [
            "wr","wn","wb","wq",
            "wk","wb","wn","wr"
        ]

    ];

}


/* =========================================================
   NEW GAME
========================================================= */

function newGame() {

    board = createInitialBoard();

    turn = "w";

    selectedSquare = null;

    legalTargets = [];

    moveHistory = [];

    undoStack = [];

    gameOver = false;

    castlingRights = {

        wK: true,
        wQ: true,
        bK: true,
        bQ: true

    };

    enPassantTarget = null;

    pendingPromotion = null;

    renderBoard();

    updateMoveHistory();

    updateCapturedPieces();

    updateGameStatus();

    if (window.resetChessClock) {

        window.resetChessClock();

    }

}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

    const boardElement =
        document.getElementById("chessBoard");

    if (!boardElement) return;

    boardElement.innerHTML = "";

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

            let row = boardFlipped
                ? 7 - displayRow
                : displayRow;

            let col = boardFlipped
                ? 7 - displayCol
                : displayCol;

            const square =
                document.createElement("div");

            square.className = "square";

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
                String.fromCharCode(97 + col);

            square.dataset.rank =
                String(8 - row);


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
                legalTargets.some(
                    target =>
                        target.row === row &&
                        target.col === col
                )
            ) {

                square.classList.add(
                    "legal-move"
                );

            }


            const piece =
                board[row][col];

            if (piece) {

                const pieceElement =
                    document.createElement("span");

                const color =
                    piece[0];

                const type =
                    piece[1];

                pieceElement.className =
                    "piece " +
                    (
                        color === "w"
                            ? "white-piece"
                            : "black-piece"
                    );

                pieceElement.textContent =
                    PIECES[color][type];

                square.appendChild(
                    pieceElement
                );

            }


            square.addEventListener(
                "click",
                () => {

                    handleSquareClick(
                        row,
                        col
                    );

                }
            );


            boardElement.appendChild(
                square
            );

        }

    }

}


/* =========================================================
   SQUARE CLICK
========================================================= */

function handleSquareClick(row,col) {

    if (gameOver) return;

    if (turn !== playerColor) return;

    const piece =
        board[row][col];


    if (selectedSquare) {

        const targetIsLegal =
            legalTargets.some(
                target =>
                    target.row === row &&
                    target.col === col
            );


        if (targetIsLegal) {

            makePlayerMove(
                selectedSquare.row,
                selectedSquare.col,
                row,
                col
            );

            return;

        }

    }


    if (
        piece &&
        piece[0] === playerColor
    ) {

        selectedSquare = {
            row,
            col
        };

        legalTargets =
            getLegalMoves(
                row,
                col
            );

        renderBoard();

    }

}


/* =========================================================
   PLAYER MOVE
========================================================= */

function makePlayerMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const movingPiece =
        board[fromRow][fromCol];

    if (!movingPiece) return;

    if (
        movingPiece[0] !== playerColor
    ) return;

    undoStack.push(
        savePosition()
    );

    const promotion =
        movingPiece[1] === "p" &&
        (
            toRow === 0 ||
            toRow === 7
        );

    const move =
        executeMove(
            fromRow,
            fromCol,
            toRow,
            toCol,
            promotion ? null : null
        );

    if (!move) return;

    if (promotion) {

        pendingPromotion = {

            row: toRow,
            col: toCol,
            color: movingPiece[0]

        };

        showPromotionModal();

    }

    finishMove(
        move,
        promotion
    );

}


/* =========================================================
   COMPUTER MOVE
========================================================= */

function computerMove() {

    if (gameOver) return;

    if (turn !== computerColor) return;

    const difficulty =
        parseInt(
            document.getElementById(
                "difficulty"
            )?.value || 2
        );

    const depth =
        Math.min(
            difficulty + 1,
            5
        );

    const moves =
        getAllLegalMoves(
            computerColor
        );

    if (!moves.length) {

        checkGameEnd();

        return;

    }


    document.getElementById(
        "gameStatus"
    ).textContent =
        "Computer is thinking...";


    setTimeout(
        () => {

            let bestMove = null;

            let bestScore =
                computerColor === "w"
                    ? -Infinity
                    : Infinity;


            if (difficulty === 1) {

                bestMove =
                    moves[
                        Math.floor(
                            Math.random() *
                            moves.length
                        )
                    ];

            } else {

                for (
                    const move of moves
                ) {

                    const copy =
                        cloneBoard(board);

                    applyMoveToBoard(
                        copy,
                        move
                    );

                    const score =
                        minimax(
                            copy,
                            opposite(
                                computerColor
                            ),
                            depth - 1,
                            -Infinity,
                            Infinity
                        );


                    if (
                        computerColor === "w"
                    ) {

                        if (
                            score > bestScore
                        ) {

                            bestScore =
                                score;

                            bestMove =
                                move;

                        }

                    } else {

                        if (
                            score < bestScore
                        ) {

                            bestScore =
                                score;

                            bestMove =
                                move;

                        }

                    }

                }

            }


            if (bestMove) {

                undoStack.push(
                    savePosition()
                );

                const result =
                    executeMove(
                        bestMove.from.row,
                        bestMove.from.col,
                        bestMove.to.row,
                        bestMove.to.col,
                        bestMove.promotion
                    );

                finishMove(
                    result,
                    false
                );

            }

        },
        difficulty === 1
            ? 350
            : 550
    );

}


/* =========================================================
   EXECUTE MOVE
========================================================= */

function executeMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    promotion
) {

    const piece =
        board[fromRow][fromCol];

    if (!piece) return null;

    const captured =
        board[toRow][toCol];

    const oldEnPassant =
        enPassantTarget;


    board[toRow][toCol] =
        piece;

    board[fromRow][fromCol] =
        null;


    /* En passant capture */

    if (
        piece[1] === "p" &&
        oldEnPassant &&
        toRow === oldEnPassant.row &&
        toCol === oldEnPassant.col &&
        !captured
    ) {

        const capturedRow =
            piece[0] === "w"
                ? toRow + 1
                : toRow - 1;

        board[capturedRow][toCol] =
            null;

    }


    /* Pawn double move */

    enPassantTarget = null;

    if (
        piece[1] === "p" &&
        Math.abs(
            toRow - fromRow
        ) === 2
    ) {

        enPassantTarget = {

            row:
                (
                    fromRow +
                    toRow
                ) / 2,

            col: fromCol

        };

    }


    /* Castling */

    if (
        piece[1] === "k" &&
        Math.abs(
            toCol - fromCol
        ) === 2
    ) {

        if (toCol > fromCol) {

            board[fromRow][5] =
                board[fromRow][7];

            board[fromRow][7] =
                null;

        } else {

            board[fromRow][3] =
                board[fromRow][0];

            board[fromRow][0] =
                null;

        }

    }


    updateCastlingRights(
        piece,
        fromRow,
        fromCol,
        toRow,
        toCol,
        captured
    );


    if (promotion) {

        board[toRow][toCol] =
            piece[0] + promotion;

    }


    turn =
        opposite(turn);


    return {

        from: {
            row: fromRow,
            col: fromCol
        },

        to: {
            row: toRow,
            col: toCol
        },

        piece,
        captured,

        notation:
            coordinateNotation(
                fromRow,
                fromCol,
                toRow,
                toCol,
                piece,
                captured
            )

    };

}


/* =========================================================
   FINISH MOVE
========================================================= */

function finishMove(
    move,
    promotionPending
) {

    if (!move) return;

    moveHistory.push(
        move
    );


    selectedSquare = null;

    legalTargets = [];


    renderBoard();

    updateMoveHistory();

    updateCapturedPieces();

    updateGameStatus();


    if (
        window.addChessTime
    ) {

        window.addChessTime(
            opposite(turn)
        );

    }


    if (
        !gameOver &&
        !promotionPending &&
        turn === computerColor
    ) {

        computerMove();

    }

}


/* =========================================================
   LEGAL MOVES
========================================================= */

function getLegalMoves(row,col) {

    const piece =
        board[row][col];

    if (!piece) return [];

    const pseudo =
        getPseudoMoves(
            board,
            row,
            col,
            true
        );

    const legal = [];


    for (
        const move of pseudo
    ) {

        const copy =
            cloneBoard(board);

        applyMoveToBoard(
            copy,
            move
        );

        const king =
            findKing(
                copy,
                piece[0]
            );

        if (
            king &&
            !isSquareAttacked(
                copy,
                king.row,
                king.col,
                opposite(
                    piece[0]
                )
            )
        ) {

            legal.push(
                move.to
            );

        }

    }


    return legal;

}


/* =========================================================
   ALL LEGAL MOVES
========================================================= */

function getAllLegalMoves(color) {

    const result = [];

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
                board[row][col];

            if (
                !piece ||
                piece[0] !== color
            ) continue;


            const moves =
                getLegalMoves(
                    row,
                    col
                );


            for (
                const target of moves
            ) {

                result.push({

                    from: {
                        row,
                        col
                    },

                    to: target,

                    promotion:
                        piece[1] === "p" &&
                        (
                            target.row === 0 ||
                            target.row === 7
                        )
                            ? "q"
                            : null

                });

            }

        }

    }

    return result;

}


/* =========================================================
   PSEUDO MOVES
========================================================= */

function getPseudoMoves(
    position,
    row,
    col,
    includeCastling
) {

    const piece =
        position[row][col];

    if (!piece) return [];

    const color =
        piece[0];

    const type =
        piece[1];

    const moves = [];


    const add =
        (r,c) => {

            if (
                r < 0 ||
                r > 7 ||
                c < 0 ||
                c > 7
            ) return;

            const target =
                position[r][c];

            if (
                !target ||
                target[0] !== color
            ) {

                moves.push({

                    from: {
                        row,
                        col
                    },

                    to: {
                        row: r,
                        col: c
                    },

                    promotion:
                        type === "p" &&
                        (
                            r === 0 ||
                            r === 7
                        )
                            ? "q"
                            : null

                });

            }

        };


    if (type === "p") {

        const direction =
            color === "w"
                ? -1
                : 1;

        const startRow =
            color === "w"
                ? 6
                : 1;


        if (
            position[
                row + direction
            ]?.[col] === null
        ) {

            add(
                row + direction,
                col
            );


            if (
                row === startRow &&
                position[
                    row + direction * 2
                ]?.[col] === null
            ) {

                add(
                    row + direction * 2,
                    col
                );

            }

        }


        for (
            const dc of [-1,1]
        ) {

            const r =
                row + direction;

            const c =
                col + dc;

            if (
                r < 0 ||
                r > 7 ||
                c < 0 ||
                c > 7
            ) continue;


            const target =
                position[r][c];


            if (
                target &&
                target[0] !== color
            ) {

                add(r,c);

            }


            if (
                enPassantTarget &&
                enPassantTarget.row === r &&
                enPassantTarget.col === c
            ) {

                add(r,c);

            }

        }

    }


    else if (
        type === "n"
    ) {

        const offsets = [

            [-2,-1],
            [-2,1],
            [-1,-2],
            [-1,2],
            [1,-2],
            [1,2],
            [2,-1],
            [2,1]

        ];

        offsets.forEach(
            ([dr,dc]) =>
                add(
                    row + dr,
                    col + dc
                )
        );

    }


    else if (
        type === "b" ||
        type === "r" ||
        type === "q"
    ) {

        const directions = [];


        if (
            type === "b" ||
            type === "q"
        ) {

            directions.push(
                [-1,-1],
                [-1,1],
                [1,-1],
                [1,1]
            );

        }


        if (
            type === "r" ||
            type === "q"
        ) {

            directions.push(
                [-1,0],
                [1,0],
                [0,-1],
                [0,1]
            );

        }


        for (
            const [dr,dc]
            of directions
        ) {

            let r =
                row + dr;

            let c =
                col + dc;


            while (
                r >= 0 &&
                r < 8 &&
                c >= 0 &&
                c < 8
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
                            row:r,
                            col:c
                        }

                    });

                } else {

                    if (
                        target[0] !== color
                    ) {

                        moves.push({

                            from: {
                                row,
                                col
                            },

                            to: {
                                row:r,
                                col:c
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


    else if (
        type === "k"
    ) {

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

                if (
                    dr === 0 &&
                    dc === 0
                ) continue;

                add(
                    row + dr,
                    col + dc
                );

            }

        }


        if (
            includeCastling
        ) {

            addCastlingMoves(
                position,
                color,
                row,
                col,
                moves
            );

        }

    }


    return moves;

}


/* =========================================================
   CASTLING
========================================================= */

function addCastlingMoves(
    position,
    color,
    row,
    col,
    moves
) {

    if (
        isSquareAttacked(
            position,
            row,
            col,
            opposite(color)
        )
    ) return;


    if (
        color === "w" &&
        row === 7 &&
        col === 4
    ) {

        if (
            castlingRights.wK &&
            position[7][5] === null &&
            position[7][6] === null &&
            !isSquareAttacked(
                position,
                7,
                5,
                "b"
            ) &&
            !isSquareAttacked(
                position,
                7,
                6,
                "b"
            )
        ) {

            moves.push({

                from:{row,col},

                to:{
                    row:7,
                    col:6
                }

            });

        }


        if (
            castlingRights.wQ &&
            position[7][1] === null &&
            position[7][2] === null &&
            position[7][3] === null &&
            !isSquareAttacked(
                position,
                7,
                3,
                "b"
            ) &&
            !isSquareAttacked(
                position,
                7,
                2,
                "b"
            )
        ) {

            moves.push({

                from:{row,col},

                to:{
                    row:7,
                    col:2
                }

            });

        }

    }


    if (
        color === "b" &&
        row === 0 &&
        col === 4
    ) {

        if (
            castlingRights.bK &&
            position[0][5] === null &&
            position[0][6] === null &&
            !isSquareAttacked(
                position,
                0,
                5,
                "w"
            ) &&
            !isSquareAttacked(
                position,
                0,
                6,
                "w"
            )
        ) {

            moves.push({

                from:{row,col},

                to:{
                    row:0,
                    col:6
                }

            });

        }


        if (
            castlingRights.bQ &&
            position[0][1] === null &&
            position[0][2] === null &&
            position[0][3] === null &&
            !isSquareAttacked(
                position,
                0,
                3,
                "w"
            ) &&
            !isSquareAttacked(
                position,
                0,
                2,
                "w"
            )
        ) {

            moves.push({

                from:{row,col},

                to:{
                    row:0,
                    col:2
                }

            });

        }

    }

}


/* =========================================================
   ATTACK DETECTION
========================================================= */

function isSquareAttacked(
    position,
    row,
    col,
    byColor
) {

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
                position[r][c];

            if (
                !piece ||
                piece[0] !== byColor
            ) continue;


            const type =
                piece[1];


            if (
                type === "p"
            ) {

                const direction =
                    byColor === "w"
                        ? -1
                        : 1;


                if (
                    r + direction === row &&
                    Math.abs(
                        c - col
                    ) === 1
                ) {

                    return true;

                }

            }


            else if (
                type === "n"
            ) {

                if (
                    Math.abs(
                        r-row
                    ) +
                    Math.abs(
                        c-col
                    ) === 3 &&
                    Math.max(
                        Math.abs(r-row),
                        Math.abs(c-col)
                    ) === 2
                ) {

                    return true;

                }

            }


            else if (
                type === "k"
            ) {

                if (
                    Math.max(
                        Math.abs(r-row),
                        Math.abs(c-col)
                    ) === 1
                ) {

                    return true;

                }

            }


            else {

                const dr =
                    Math.sign(row-r);

                const dc =
                    Math.sign(col-c);

                const straight =
                    r === row ||
                    c === col;

                const diagonal =
                    Math.abs(row-r) ===
                    Math.abs(col-c);


                const allowed =
                    type === "b"
                        ? diagonal
                        : type === "r"
                            ? straight
                            : (
                                straight ||
                                diagonal
                            );


                if (!allowed) continue;


                let rr = r + dr;

                let cc = c + dc;

                let blocked = false;


                while (
                    rr !== row ||
                    cc !== col
                ) {

                    if (
                        position[rr][cc]
                    ) {

                        blocked = true;

                        break;

                    }

                    rr += dr;

                    cc += dc;

                }


                if (!blocked) {

                    return true;

                }

            }

        }

    }

    return false;

}


/* =========================================================
   KING
========================================================= */

function findKing(
    position,
    color
) {

    for (
        let row=0;
        row<8;
        row++
    ) {

        for (
            let col=0;
            col<8;
            col++
        ) {

            if (
                position[row][col] ===
                color + "k"
            ) {

                return {
                    row,
                    col
                };

            }

        }

    }

    return null;

}


/* =========================================================
   APPLY MOVE TO COPY
========================================================= */

function applyMoveToBoard(
    position,
    move
) {

    const piece =
        position[
            move.from.row
        ][
            move.from.col
        ];

    position[
        move.to.row
    ][
        move.to.col
    ] = piece;

    position[
        move.from.row
    ][
        move.from.col
    ] = null;


    if (
        move.promotion
    ) {

        position[
            move.to.row
        ][
            move.to.col
        ] =
            piece[0] +
            move.promotion;

    }

}


/* =========================================================
   CHECK
========================================================= */

function isInCheck(
    color
) {

    const king =
        findKing(
            board,
            color
        );

    if (!king) return true;

    return isSquareAttacked(
        board,
        king.row,
        king.col,
        opposite(color)
    );

}


/* =========================================================
   GAME END
========================================================= */

function checkGameEnd() {

    const moves =
        getAllLegalMoves(
            turn
        );


    if (
        moves.length === 0
    ) {

        gameOver = true;

        if (
            isInCheck(turn)
        ) {

            const winner =
                opposite(turn);

            finishGame(
                winner === playerColor
                    ? "win"
                    : "loss",
                winner === playerColor
                    ? "Checkmate! You win."
                    : "Checkmate! Computer wins."
            );

        } else {

            finishGame(
                "draw",
                "The game is a draw by stalemate."
            );

        }

    }

}


/* =========================================================
   STATUS
========================================================= */

function updateGameStatus() {

    if (gameOver) return;

    checkGameEnd();

    if (gameOver) return;


    const status =
        document.getElementById(
            "gameStatus"
        );

    const turnElement =
        document.getElementById(
            "turnText"
        );


    const side =
        turn === playerColor
            ? "Your turn"
            : "Computer's turn";


    if (isInCheck(turn)) {

        status.textContent =
            "Check!";

    } else {

        status.textContent =
            "Game in progress";

    }


    turnElement.textContent =
        side;

}


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame(
    result,
    message
) {

    gameOver = true;

    if (
        window.stopChessClock
    ) {

        window.stopChessClock();

    }


    if (window.saveGameResult) {

        window.saveGameResult(
            result
        );

    }


    const title =
        document.getElementById(
            "resultTitle"
        );

    const resultMessage =
        document.getElementById(
            "resultMessage"
        );

    const icon =
        document.getElementById(
            "resultIcon"
        );


    title.textContent =
        result === "win"
            ? "You Win!"
            : result === "loss"
                ? "You Lose"
                : "Draw";


    icon.textContent =
        result === "win"
            ? "♕"
            : result === "loss"
                ? "♟"
                : "½–½";


    resultMessage.textContent =
        message;


    document
        .getElementById(
            "resultModal"
        )
        .classList.remove(
            "hidden"
        );

}


/* =========================================================
   MOVE HISTORY
========================================================= */

function updateMoveHistory() {

    const element =
        document.getElementById(
            "moveHistory"
        );

    const count =
        document.getElementById(
            "moveCount"
        );

    if (!element) return;


    element.innerHTML = "";


    for (
        let i=0;
        i<moveHistory.length;
        i+=2
    ) {

        const row =
            document.createElement(
                "div"
            );

        const white =
            moveHistory[i];

        const black =
            moveHistory[i+1];


        row.innerHTML =
            `<span>${Math.floor(i/2)+1}.</span>
             ${white?.notation || ""}
             ${black?.notation || ""}`;


        element.appendChild(
            row
        );

    }


    count.textContent =
        moveHistory.length;

    element.scrollTop =
        element.scrollHeight;

}


/* =========================================================
   CAPTURED PIECES
========================================================= */

function updateCapturedPieces() {

    const capturedByWhite = [];

    const capturedByBlack = [];


    for (
        const move of moveHistory
    ) {

        if (!move.captured) continue;


        const capturedColor =
            move.captured[0];


        const piece =
            move.captured[1];


        if (
            capturedColor === "b"
        ) {

            capturedByWhite.push(
                PIECES.b[piece]
            );

        } else {

            capturedByBlack.push(
                PIECES.w[piece]
            );

        }

    }


    document.getElementById(
        "whiteCaptured"
    ).textContent =
        capturedByWhite.length
            ? capturedByWhite.join("")
            : "—";


    document.getElementById(
        "blackCaptured"
    ).textContent =
        capturedByBlack.length
            ? capturedByBlack.join("")
            : "—";


    const values = {

        p:1,
        n:3,
        b:3,
        r:5,
        q:9,
        k:0

    };


    let score = 0;


    for (
        const move of moveHistory
    ) {

        if (!move.captured)
            continue;


        const value =
            values[
                move.captured[1]
            ];


        if (
            move.captured[0] === "b"
        ) {

            score += value;

        } else {

            score -= value;

        }

    }


    const material =
        document.getElementById(
            "materialScore"
        );


    if (score > 0) {

        material.textContent =
            `White +${score}`;

    } else if (score < 0) {

        material.textContent =
            `Black +${Math.abs(score)}`;

    } else {

        material.textContent =
            "Material even";

    }

}


/* =========================================================
   CASTLING RIGHTS
========================================================= */

function updateCastlingRights(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol,
    captured
) {

    if (
        piece === "wk"
    ) {

        castlingRights.wK = false;
        castlingRights.wQ = false;

    }

    if (
        piece === "bk"
    ) {

        castlingRights.bK = false;
        castlingRights.bQ = false;

    }


    if (
        piece === "wr" &&
        fromRow === 7 &&
        fromCol === 0
    ) {

        castlingRights.wQ = false;

    }


    if (
        piece === "wr" &&
        fromRow === 7 &&
        fromCol === 7
    ) {

        castlingRights.wK = false;

    }


    if (
        piece === "br" &&
        fromRow === 0 &&
        fromCol === 0
    ) {

        castlingRights.bQ = false;

    }


    if (
        piece === "br" &&
        fromRow === 0 &&
        fromCol === 7
    ) {

        castlingRights.bK = false;

    }


    if (
        captured === "wr" &&
        toRow === 7 &&
        toCol === 0
    ) {

        castlingRights.wQ = false;

    }


    if (
        captured === "wr" &&
        toRow === 7 &&
        toCol === 7
    ) {

        castlingRights.wK = false;

    }


    if (
        captured === "br" &&
        toRow === 0 &&
        toCol === 0
    ) {

        castlingRights.bQ = false;

    }


    if (
        captured === "br" &&
        toRow === 0 &&
        toCol === 7
    ) {

        castlingRights.bK = false;

    }

}


/* =========================================================
   PROMOTION
========================================================= */

function showPromotionModal() {

    document
        .getElementById(
            "promotionModal"
        )
        .classList.remove(
            "hidden"
        );

}


function promotePiece(
    piece
) {

    if (!pendingPromotion)
        return;


    const {
        row,
        col,
        color
    } = pendingPromotion;


    board[row][col] =
        color + piece;


    pendingPromotion = null;


    document
        .getElementById(
            "promotionModal"
        )
        .classList.add(
            "hidden"
        );


    renderBoard();

    updateMoveHistory();

    updateGameStatus();


    if (
        turn === computerColor
    ) {

        computerMove();

    }

}


/* =========================================================
   UNDO
========================================================= */

function undoMove() {

    if (
        !undoStack.length ||
        gameOver
    ) return;


    const previous =
        undoStack.pop();


    restorePosition(
        previous
    );


    if (
        moveHistory.length
    ) {

        moveHistory.pop();

    }

    if (
        moveHistory.length &&
        turn !== playerColor
    ) {

        moveHistory.pop();

    }


    renderBoard();

    updateMoveHistory();

    updateCapturedPieces();

    updateGameStatus();

}


/* =========================================================
   SAVE POSITION
========================================================= */

function savePosition() {

    return {

        board:
            cloneBoard(board),

        turn,

        castlingRights:
            JSON.parse(
                JSON.stringify(
                    castlingRights
                )
            ),

        enPassantTarget:
            enPassantTarget
                ? {
                    ...enPassantTarget
                }
                : null

    };

}


function restorePosition(
    position
) {

    board =
        cloneBoard(
            position.board
        );

    turn =
        position.turn;

    castlingRights =
        JSON.parse(
            JSON.stringify(
                position.castlingRights
            )
        );

    enPassantTarget =
        position.enPassantTarget
            ? {
                ...position.enPassantTarget
            }
            : null;

}


/* =========================================================
   HELPERS
========================================================= */

function cloneBoard(
    position
) {

    return position.map(
        row => [...row]
    );

}


function opposite(color) {

    return color === "w"
        ? "b"
        : "w";

}


function coordinateNotation(
    fromRow,
    fromCol,
    toRow,
    toCol,
    piece,
    captured
) {

    const files =
        "abcdefgh";

    return (
        (
            piece[1] === "p"
                ? ""
                : piece[1].toUpperCase()
        ) +

        files[fromCol] +
        (8-fromRow) +

        (
            captured
                ? "x"
                : "-"
        ) +

        files[toCol] +
        (8-toRow)
    );

}


/* =========================================================
   AI
========================================================= */

const PIECE_VALUES = {

    p:100,
    n:320,
    b:330,
    r:500,
    q:900,
    k:20000

};


function evaluateBoard(
    position
) {

    let score = 0;


    for (
        let r=0;
        r<8;
        r++
    ) {

        for (
            let c=0;
            c<8;
            c++
        ) {

            const piece =
                position[r][c];

            if (!piece)
                continue;


            const value =
                PIECE_VALUES[
                    piece[1]
                ];


            if (
                piece[0] === "w"
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
    color,
    depth,
    alpha,
    beta
) {

    if (depth <= 0) {

        return evaluateBoard(
            position
        );

    }


    const moves =
        getAllLegalMovesForPosition(
            position,
            color
        );


    if (!moves.length) {

        const king =
            findKing(
                position,
                color
            );

        if (
            king &&
            isSquareAttacked(
                position,
                king.row,
                king.col,
                opposite(color)
            )
        ) {

            return color === "w"
                ? -100000
                : 100000;

        }

        return 0;

    }


    if (color === "w") {

        let value = -Infinity;


        for (
            const move of moves
        ) {

            const copy =
                cloneBoard(
                    position
                );

            applyMoveToBoard(
                copy,
                move
            );


            value =
                Math.max(
                    value,
                    minimax(
                        copy,
                        "b",
                        depth-1,
                        alpha,
                        beta
                    )
                );


            alpha =
                Math.max(
                    alpha,
                    value
                );


            if (
                alpha >= beta
            ) break;

        }


        return value;

    }


    let value = Infinity;


    for (
        const move of moves
    ) {

        const copy =
            cloneBoard(
                position
            );

        applyMoveToBoard(
            copy,
            move
        );


        value =
            Math.min(
                value,
                minimax(
                    copy,
                    "w",
                    depth-1,
                    alpha,
                    beta
                )
            );


        beta =
            Math.min(
                beta,
                value
            );


        if (
            alpha >= beta
        ) break;

    }


    return value;

}


function getAllLegalMovesForPosition(
    position,
    color
) {

    const result = [];


    for (
        let r=0;
        r<8;
        r++
    ) {

        for (
            let c=0;
            c<8;
            c++
        ) {

            const piece =
                position[r][c];

            if (
                !piece ||
                piece[0] !== color
            ) continue;


            const pseudo =
                getPseudoMoves(
                    position,
                    r,
                    c,
                    false
                );


            for (
                const move of pseudo
            ) {

                const copy =
                    cloneBoard(
                        position
                    );

                applyMoveToBoard(
                    copy,
                    move
                );


                const king =
                    findKing(
                        copy,
                        color
                    );


                if (
                    king &&
                    !isSquareAttacked(
                        copy,
                        king.row,
                        king.col,
                        opposite(color)
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
   FLIP BOARD
========================================================= */

function flipBoard() {

    boardFlipped =
        !boardFlipped;

    renderBoard();

}


/* =========================================================
   RESIGN
========================================================= */

function resignGame() {

    if (gameOver) return;

    finishGame(
        "loss",
        "You resigned the game."
    );

}


/* =========================================================
   DRAW
========================================================= */

function offerDraw() {

    if (gameOver) return;

    finishGame(
        "draw",
        "Game drawn by agreement."
    );

}


/* =========================================================
   COLOR
========================================================= */

function setPlayerColor(
    choice
) {

    if (
        choice === "white"
    ) {

        playerColor = "w";
        computerColor = "b";

    }

    else if (
        choice === "black"
    ) {

        playerColor = "b";
        computerColor = "w";

    }

    else {

        playerColor =
            Math.random() < .5
                ? "w"
                : "b";

        computerColor =
            opposite(
                playerColor
            );

    }


    updatePlayerLabels();

    newGame();


    if (
        playerColor === "b"
    ) {

        setTimeout(
            () => {

                computerMove();

            },
            500
        );

    }

}


function updatePlayerLabels() {

    document.getElementById(
        "whitePlayer"
    ).textContent =
        playerColor === "w"
            ? "You"
            : "Computer";


    document.getElementById(
        "blackPlayer"
    ).textContent =
        playerColor === "b"
            ? "You"
            : "Computer";


    document.getElementById(
        "sideDisplay"
    ).textContent =
        playerColor === "w"
            ? "White"
            : "Black";

}


/* =========================================================
   EXPORT GLOBAL FUNCTIONS
========================================================= */

window.newGame =
    newGame;

window.setPlayerColor =
    setPlayerColor;

window.flipBoard =
    flipBoard;

window.undoMove =
    undoMove;

window.resignGame =
    resignGame;

window.offerDraw =
    offerDraw;

window.promotePiece =
    promotePiece;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        newGame();

    }
);
