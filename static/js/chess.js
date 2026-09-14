const PIECES = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",

    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟"
};


const VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};


let board;

let turn;

let selectedSquare;

let moveHistory;

let gameOver;

let castling;

let enPassant;


/* ================= BOARD ================= */

function createBoard() {

    return [

        ["r","n","b","q","k","b","n","r"],

        ["p","p","p","p","p","p","p","p"],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        ["P","P","P","P","P","P","P","P"],

        ["R","N","B","Q","K","B","N","R"]

    ];

}


function pieceColor(piece) {

    if (!piece) return null;

    return piece === piece.toUpperCase()
        ? "w"
        : "b";
}


function inside(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );

}


function copyBoard(source) {

    return source.map(row => [...row]);

}


/* ================= MOVEMENT ================= */

function pseudoMoves(
    currentBoard,
    row,
    col,
    ignoreCastling = false
) {

    const piece =
        currentBoard[row][col];

    if (!piece)
        return [];

    const side =
        pieceColor(piece);

    const type =
        piece.toLowerCase();

    const moves = [];


    function addMove(r, c) {

        if (!inside(r, c))
            return;

        const target =
            currentBoard[r][c];

        if (!target ||
            pieceColor(target) !== side) {

            moves.push([r,c]);

        }

    }


    /* PAWN */

    if (type === "p") {

        const direction =
            side === "w" ? -1 : 1;

        const startRow =
            side === "w" ? 6 : 1;


        if (
            inside(row + direction, col) &&
            !currentBoard[row + direction][col]
        ) {

            moves.push([
                row + direction,
                col
            ]);


            if (
                row === startRow &&
                !currentBoard[row + direction * 2][col]
            ) {

                moves.push([
                    row + direction * 2,
                    col
                ]);

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
                inside(r,c) &&
                currentBoard[r][c] &&
                pieceColor(currentBoard[r][c]) !== side
            ) {

                moves.push([r,c]);

            }


            if (
                enPassant &&
                enPassant[0] === r &&
                enPassant[1] === c
            ) {

                moves.push([r,c]);

            }

        }

    }


    /* KNIGHT */

    else if (type === "n") {

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
                addMove(
                    row + dr,
                    col + dc
                )
        );

    }


    /* KING */

    else if (type === "k") {

        for (
            let dr=-1;
            dr<=1;
            dr++
        ) {

            for (
                let dc=-1;
                dc<=1;
                dc++
            ) {

                if (dr || dc) {

                    addMove(
                        row + dr,
                        col + dc
                    );

                }

            }

        }


        /* CASTLING */

        if (!ignoreCastling) {

            const homeRow =
                side === "w" ? 7 : 0;


            if (
                row === homeRow &&
                col === 4
            ) {

                const kingSide =
                    side === "w"
                        ? "K"
                        : "k";

                const queenSide =
                    side === "w"
                        ? "Q"
                        : "q";


                if (
                    castling[kingSide] &&
                    !currentBoard[row][5] &&
                    !currentBoard[row][6]
                ) {

                    moves.push([
                        row,
                        6
                    ]);

                }


                if (
                    castling[queenSide] &&
                    !currentBoard[row][1] &&
                    !currentBoard[row][2] &&
                    !currentBoard[row][3]
                ) {

                    moves.push([
                        row,
                        2
                    ]);

                }

            }

        }

    }


    /* SLIDING PIECES */

    else {

        let directions;


        if (type === "b") {

            directions = [

                [1,1],
                [1,-1],
                [-1,1],
                [-1,-1]

            ];

        }

        else if (type === "r") {

            directions = [

                [1,0],
                [-1,0],
                [0,1],
                [0,-1]

            ];

        }

        else {

            directions = [

                [1,1],
                [1,-1],
                [-1,1],
                [-1,-1],

                [1,0],
                [-1,0],
                [0,1],
                [0,-1]

            ];

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
                inside(r,c)
            ) {

                if (
                    !currentBoard[r][c]
                ) {

                    moves.push([r,c]);

                }

                else {

                    if (
                        pieceColor(
                            currentBoard[r][c]
                        ) !== side
                    ) {

                        moves.push([r,c]);

                    }

                    break;

                }


                r += dr;
                c += dc;

            }

        }

    }


    return moves;

}


/* ================= CHECK ================= */

function isAttacked(
    currentBoard,
    row,
    col,
    attacker
) {

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

            if (
                pieceColor(
                    currentBoard[r][c]
                ) !== attacker
            )
                continue;


            const piece =
                currentBoard[r][c];


            if (
                piece.toLowerCase()
                === "p"
            ) {

                const direction =
                    attacker === "w"
                        ? -1
                        : 1;


                if (
                    r + direction === row &&
                    Math.abs(c-col) === 1
                )
                    return true;

            }


            else {

                const moves =
                    pseudoMoves(
                        currentBoard,
                        r,
                        c,
                        true
                    );


                if (
                    moves.some(
                        move =>
                            move[0] === row &&
                            move[1] === col
                    )
                )
                    return true;

            }

        }

    }


    return false;

}


function isInCheck(
    currentBoard,
    side
) {

    const king =
        side === "w"
            ? "K"
            : "k";


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

            if (
                currentBoard[r][c]
                === king
            ) {

                return isAttacked(
                    currentBoard,
                    r,
                    c,
                    side === "w"
                        ? "b"
                        : "w"
                );

            }

        }

    }


    return true;

}


/* ================= APPLY MOVE ================= */

function applyMove(
    currentBoard,
    from,
    to
) {

    const newBoard =
        copyBoard(currentBoard);


    const piece =
        newBoard[from[0]][from[1]];


    const captured =
        newBoard[to[0]][to[1]];


    newBoard[to[0]][to[1]]
        = piece;

    newBoard[from[0]][from[1]]
        = null;


    /* EN PASSANT */

    if (
        piece.toLowerCase() === "p" &&
        enPassant &&
        to[0] === enPassant[0] &&
        to[1] === enPassant[1] &&
        !captured
    ) {

        newBoard[
            from[0]
        ][to[1]] = null;

    }


    /* PROMOTION */

    if (
        piece.toLowerCase() === "p" &&
        (to[0] === 0 ||
         to[0] === 7)
    ) {

        newBoard[to[0]][to[1]]
            = pieceColor(piece) === "w"
                ? "Q"
                : "q";

    }


    /* CASTLING */

    if (
        piece.toLowerCase() === "k" &&
        Math.abs(
            to[1] - from[1]
        ) === 2
    ) {

        const row =
            from[0];


        if (to[1] === 6) {

            newBoard[row][5]
                = newBoard[row][7];

            newBoard[row][7]
                = null;

        }

        else {

            newBoard[row][3]
                = newBoard[row][0];

            newBoard[row][0]
                = null;

        }

    }


    return newBoard;

}


/* ================= LEGAL MOVES ================= */

function legalMoves(
    currentBoard,
    side
) {

    const result = [];


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
                pieceColor(
                    currentBoard[row][col]
                ) !== side
            )
                continue;


            const moves =
                pseudoMoves(
                    currentBoard,
                    row,
                    col
                );


            for (
                const to of moves
            ) {

                const newBoard =
                    applyMove(
                        currentBoard,
                        [row,col],
                        to
                    );


                if (
                    !isInCheck(
                        newBoard,
                        side
                    )
                ) {

                    result.push({
                        from:[row,col],
                        to:to
                    });

                }

            }

        }

    }


    return result;

}


/* ================= MAKE MOVE ================= */

function makeMove(
    from,
    to
) {

    const piece =
        board[from[0]][from[1]];


    board =
        applyMove(
            board,
            from,
            to
        );


    moveHistory.push({
        from,
        to,
        piece
    });


    updateCastling(
        piece,
        from
    );


    if (
        piece.toLowerCase()
        === "p" &&
        Math.abs(
            to[0] - from[0]
        ) === 2
    ) {

        enPassant = [
            (to[0] + from[0]) / 2,
            to[1]
        ];

    }

    else {

        enPassant = null;

    }


    turn =
        turn === "w"
            ? "b"
            : "w";


    selectedSquare = null;


    renderBoard();

    updateGameStatus();

}


/* ================= CASTLING RIGHTS ================= */

function updateCastling(
    piece,
    from
) {

    if (
        piece === "K"
    ) {

        castling.K = false;
        castling.Q = false;

    }


    if (
        piece === "k"
    ) {

        castling.k = false;
        castling.q = false;

    }


    if (
        piece === "R"
    ) {

        if (
            from[0] === 7 &&
            from[1] === 0
        )
            castling.Q = false;

        if (
            from[0] === 7 &&
            from[1] === 7
        )
            castling.K = false;

    }


    if (
        piece === "r"
    ) {

        if (
            from[0] === 0 &&
            from[1] === 0
        )
            castling.q = false;

        if (
            from[0] === 0 &&
            from[1] === 7
        )
            castling.k = false;

    }

}


/* ================= RENDER ================= */

function renderBoard() {

    const container =
        document.getElementById(
            "chessBoard"
        );


    container.innerHTML = "";


    const whiteMoves =
        legalMoves(
            board,
            "w"
        );


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

            const square =
                document.createElement(
                    "div"
                );


            square.className =
                "square " +
                (
                    (row + col) % 2
                    ? "dark-square"
                    : "light-square"
                );


            if (
                selectedSquare &&
                selectedSquare[0] === row &&
                selectedSquare[1] === col
            ) {

                square.classList.add(
                    "selected"
                );

            }


            if (
                selectedSquare &&
                whiteMoves.some(
                    move =>
                        move.from[0]
                            === selectedSquare[0] &&
                        move.from[1]
                            === selectedSquare[1] &&
                        move.to[0] === row &&
                        move.to[1] === col
                )
            ) {

                square.classList.add(
                    "legal-move"
                );

            }


            const piece =
                board[row][col];


            if (piece)
                square.textContent =
                    PIECES[piece];


            square.onclick =
                () =>
                    selectSquare(
                        row,
                        col
                    );


            container.appendChild(
                square
            );

        }

    }


    renderMoveHistory();

}


/* ================= PLAYER INPUT ================= */

function selectSquare(
    row,
    col
) {

    if (
        gameOver ||
        turn !== "w"
    )
        return;


    const piece =
        board[row][col];


    if (selectedSquare) {

        const moves =
            legalMoves(
                board,
                "w"
            );


        const valid =
            moves.some(
                move =>
                    move.from[0]
                        === selectedSquare[0] &&
                    move.from[1]
                        === selectedSquare[1] &&
                    move.to[0] === row &&
                    move.to[1] === col
            );


        if (valid) {

            makeMove(
                selectedSquare,
                [row,col]
            );


            setTimeout(
                computerMove,
                200
            );

            return;

        }


        selectedSquare = null;

    }


    if (
        piece &&
        pieceColor(piece) === "w"
    ) {

        selectedSquare =
            [row,col];

    }


    renderBoard();

}


/* ================= AI ================= */

function evaluatePosition(
    currentBoard
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
                currentBoard[r][c];


            if (!piece)
                continue;


            const value =
                VALUES[
                    piece.toLowerCase()
                ];


            score +=
                pieceColor(piece)
                === "w"
                    ? value
                    : -value;

        }

    }


    return score;

}


function minimax(
    currentBoard,
    side,
    depth,
    alpha,
    beta
) {

    const moves =
        legalMoves(
            currentBoard,
            side
        );


    if (
        depth === 0 ||
        moves.length === 0
    ) {

        if (
            moves.length === 0 &&
            isInCheck(
                currentBoard,
                side
            )
        ) {

            return side === "w"
                ? -999999
                : 999999;

        }


        return evaluatePosition(
            currentBoard
        );

    }


    if (side === "w") {

        let best =
            -Infinity;


        for (
            const move of moves
        ) {

            const value =
                minimax(
                    applyMove(
                        currentBoard,
                        move.from,
                        move.to
                    ),
                    "b",
                    depth - 1,
                    alpha,
                    beta
                );


            best =
                Math.max(
                    best,
                    value
                );


            alpha =
                Math.max(
                    alpha,
                    value
                );


            if (
                beta <= alpha
            )
                break;

        }


        return best;

    }


    let best =
        Infinity;


    for (
        const move of moves
    ) {

        const value =
            minimax(
                applyMove(
                    currentBoard,
                    move.from,
                    move.to
                ),
                "w",
                depth - 1,
                alpha,
                beta
            );


        best =
            Math.min(
                best,
                value
            );


        beta =
            Math.min(
                beta,
                value
            );


        if (
            beta <= alpha
        )
            break;

    }


    return best;

}


function computerMove() {

    if (
        gameOver ||
        turn !== "b"
    )
        return;


    const moves =
        legalMoves(
            board,
            "b"
        );


    if (!moves.length)
        return;


    const depth =
        Number(
            document.getElementById(
                "difficulty"
            ).value
        );


    let bestValue =
        Infinity;

    let bestMove =
        moves[
            Math.floor(
                Math.random()
                * moves.length
            )
        ];


    for (
        const move of moves
    ) {

        const value =
            minimax(
                applyMove(
                    board,
                    move.from,
                    move.to
                ),
                "w",
                depth - 1,
                -Infinity,
                Infinity
            );


        if (
            value < bestValue
        ) {

            bestValue = value;

            bestMove = move;

        }

    }


    makeMove(
        bestMove.from,
        bestMove.to
    );

}


/* ================= STATUS ================= */

function updateGameStatus() {

    const moves =
        legalMoves(
            board,
            turn
        );


    const check =
        isInCheck(
            board,
            turn
        );


    if (!moves.length) {

        gameOver = true;


        if (check) {

            document.getElementById(
                "gameStatus"
            ).textContent =
                turn === "w"
                    ? "Checkmate — Computer Wins"
                    : "Checkmate — You Win";

            saveResult(
                turn === "w"
                    ? "loss"
                    : "win"
            );

        }

        else {

            document.getElementById(
                "gameStatus"
            ).textContent =
                "Draw — Stalemate";

            saveResult("draw");

        }


        return;

    }


    document.getElementById(
        "gameStatus"
    ).textContent =
        check
            ? "Check!"
            : turn === "w"
                ? "Your Turn"
                : "Computer Thinking...";


    document.getElementById(
        "turnText"
    ).textContent =
        turn === "w"
            ? "White"
            : "Black";

}


/* ================= MOVE HISTORY ================= */

function renderMoveHistory() {

    const element =
        document.getElementById(
            "moveHistory"
        );


    if (!moveHistory.length) {

        element.textContent =
            "No moves yet.";

        return;

    }


    element.innerHTML =
        moveHistory
            .map(
                (move,index) => {

                    const from =
                        String.fromCharCode(
                            97 + move.from[1]
                        ) +
                        (8 - move.from[0]);


                    const to =
                        String.fromCharCode(
                            97 + move.to[1]
                        ) +
                        (8 - move.to[0]);


                    return `
                        ${index + 1}.
                        ${from}
                        →
                        ${to}
                    `;

                }
            )
            .join("<br>");

}


/* ================= STATS ================= */

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


    if (result === "win")
        stats.wins++;

    if (result === "loss")
        stats.losses++;

    if (result === "draw")
        stats.draws++;


    localStorage.setItem(
        "chessStats",
        JSON.stringify(stats)
    );


    updateStats();

}


function updateStats() {

    const stats =
        JSON.parse(
            localStorage.getItem(
                "chessStats"
            ) ||
            '{"games":0,"wins":0,"losses":0,"draws":0}'
        );


    document.getElementById(
        "games"
    ).textContent = stats.games;


    document.getElementById(
        "wins"
    ).textContent = stats.wins;


    document.getElementById(
        "losses"
    ).textContent = stats.losses;


    document.getElementById(
        "draws"
    ).textContent = stats.draws;

}


/* ================= NEW GAME ================= */

function newGame() {

    board =
        createBoard();

    turn = "w";

    selectedSquare = null;

    moveHistory = [];

    gameOver = false;

    castling = {
        K:true,
        Q:true,
        k:true,
        q:true
    };

    enPassant = null;


    renderBoard();

    updateGameStatus();

}


/* ================= START ================= */

window.startChess =
    newGame;


window.newChessGame =
    newGame;


newGame();

updateStats();
