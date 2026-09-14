/* =========================================================
   CHESS ENGINE
   No database.
   No external libraries.
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


const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};


const FILES = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h"
];


const ChessGame = {

    board: [],
    turn: "w",

    selected: null,

    legalMoves: [],

    history: [],

    gameOver: false,

    winner: null,

    playerColor: "w",

    computerColor: "b",

    castling: {
        wK: true,
        wQ: true,
        bK: true,
        bQ: true
    },

    enPassant: null,


    init(playerColor = "w") {

        this.playerColor = playerColor;

        this.computerColor =
            playerColor === "w"
                ? "b"
                : "w";

        this.reset();

    },


    reset() {

        this.board = [
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
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ],

            [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ],

            [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ],

            [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ],

            [
                "P",
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

        this.turn = "w";

        this.selected = null;

        this.legalMoves = [];

        this.history = [];

        this.gameOver = false;

        this.winner = null;

        this.castling = {
            wK: true,
            wQ: true,
            bK: true,
            bQ: true
        };

        this.enPassant = null;

    },


    cloneBoard(board) {

        return board.map(
            row => row.slice()
        );

    },


    colorOf(piece) {

        if (!piece) {
            return null;
        }

        return piece === piece.toUpperCase()
            ? "w"
            : "b";

    },


    typeOf(piece) {

        return piece
            ? piece.toLowerCase()
            : null;

    },


    inside(r, c) {

        return (
            r >= 0 &&
            r < 8 &&
            c >= 0 &&
            c < 8
        );

    },


    opposite(color) {

        return color === "w"
            ? "b"
            : "w";

    },


    squareName(r, c) {

        return (
            FILES[c] +
            (8 - r)
        );

    },


    findKing(board, color) {

        const target =
            color === "w"
                ? "K"
                : "k";

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

                if (
                    board[r][c] === target
                ) {

                    return {
                        r,
                        c
                    };

                }

            }

        }

        return null;

    },


    isSquareAttacked(
        board,
        r,
        c,
        byColor
    ) {

        /*
         * Pawn attacks
         */

        const pawn =
            byColor === "w"
                ? "P"
                : "p";

        const pawnRow =
            byColor === "w"
                ? r + 1
                : r - 1;

        for (
            const dc of [-1, 1]
        ) {

            const pc =
                c + dc;

            if (
                this.inside(
                    pawnRow,
                    pc
                ) &&
                board[pawnRow][pc] === pawn
            ) {

                return true;

            }

        }


        /*
         * Knight attacks
         */

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

        for (
            const [
                dr,
                dc
            ] of knightOffsets
        ) {

            const nr = r + dr;
            const nc = c + dc;

            if (
                this.inside(nr, nc) &&
                board[nr][nc] === knight
            ) {

                return true;

            }

        }


        /*
         * King attacks
         */

        const king =
            byColor === "w"
                ? "K"
                : "k";

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
                ) {
                    continue;
                }

                const nr = r + dr;
                const nc = c + dc;

                if (
                    this.inside(nr, nc) &&
                    board[nr][nc] === king
                ) {

                    return true;

                }

            }

        }


        /*
         * Sliding pieces
         */

        const rook =
            byColor === "w"
                ? "R"
                : "r";

        const bishop =
            byColor === "w"
                ? "B"
                : "b";

        const queen =
            byColor === "w"
                ? "Q"
                : "q";


        const straight = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        for (
            const [
                dr,
                dc
            ] of straight
        ) {

            let nr = r + dr;
            let nc = c + dc;

            while (
                this.inside(nr, nc)
            ) {

                const piece =
                    board[nr][nc];

                if (piece) {

                    if (
                        piece === rook ||
                        piece === queen
                    ) {

                        return true;

                    }

                    break;

                }

                nr += dr;
                nc += dc;

            }

        }


        const diagonal = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];

        for (
            const [
                dr,
                dc
            ] of diagonal
        ) {

            let nr = r + dr;
            let nc = c + dc;

            while (
                this.inside(nr, nc)
            ) {

                const piece =
                    board[nr][nc];

                if (piece) {

                    if (
                        piece === bishop ||
                        piece === queen
                    ) {

                        return true;

                    }

                    break;

                }

                nr += dr;
                nc += dc;

            }

        }

        return false;

    },


    isInCheck(
        board,
        color
    ) {

        const king =
            this.findKing(
                board,
                color
            );

        if (!king) {
            return true;
        }

        return this.isSquareAttacked(
            board,
            king.r,
            king.c,
            this.opposite(color)
        );

    },


    pseudoMoves(
        board,
        r,
        c,
        color,
        includeCastle = true
    ) {

        const moves = [];

        const piece =
            board[r][c];

        if (!piece) {
            return moves;
        }

        if (
            this.colorOf(piece) !== color
        ) {

            return moves;

        }

        const type =
            this.typeOf(piece);


        /*
         * PAWN
         */

        if (type === "p") {

            const direction =
                color === "w"
                    ? -1
                    : 1;

            const startRow =
                color === "w"
                    ? 6
                    : 1;

            const promotionRow =
                color === "w"
                    ? 0
                    : 7;

            const oneR =
                r + direction;

            if (
                this.inside(oneR, c) &&
                !board[oneR][c]
            ) {

                if (
                    oneR === promotionRow
                ) {

                    for (
                        const promotion of [
                            "q",
                            "r",
                            "b",
                            "n"
                        ]
                    ) {

                        moves.push({
                            from: {r, c},
                            to: {
                                r: oneR,
                                c
                            },
                            promotion
                        });

                    }

                } else {

                    moves.push({
                        from: {r, c},
                        to: {
                            r: oneR,
                            c
                        }
                    });

                }


                if (
                    r === startRow
                ) {

                    const twoR =
                        r +
                        direction * 2;

                    if (
                        !board[twoR][c]
                    ) {

                        moves.push({
                            from: {r, c},
                            to: {
                                r: twoR,
                                c
                            },
                            doublePawn: true
                        });

                    }

                }

            }


            for (
                const dc of [-1, 1]
            ) {

                const nr =
                    r + direction;

                const nc =
                    c + dc;

                if (
                    !this.inside(nr, nc)
                ) {
                    continue;
                }

                const target =
                    board[nr][nc];

                if (
                    target &&
                    this.colorOf(target) !== color
                ) {

                    if (
                        nr === promotionRow
                    ) {

                        for (
                            const promotion of [
                                "q",
                                "r",
                                "b",
                                "n"
                            ]
                        ) {

                            moves.push({
                                from: {r, c},
                                to: {
                                    r: nr,
                                    c: nc
                                },
                                promotion
                            });

                        }

                    } else {

                        moves.push({
                            from: {r, c},
                            to: {
                                r: nr,
                                c: nc
                            }
                        });

                    }

                }


                /*
                 * En passant
                 */

                if (
                    this.enPassant &&
                    this.enPassant.r === nr &&
                    this.enPassant.c === nc
                ) {

                    moves.push({
                        from: {r, c},
                        to: {
                            r: nr,
                            c: nc
                        },
                        enPassant: true
                    });

                }

            }

        }


        /*
         * KNIGHT
         */

        if (type === "n") {

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

            for (
                const [
                    dr,
                    dc
                ] of offsets
            ) {

                const nr = r + dr;
                const nc = c + dc;

                if (
                    !this.inside(nr, nc)
                ) {
                    continue;
                }

                const target =
                    board[nr][nc];

                if (
                    !target ||
                    this.colorOf(target) !== color
                ) {

                    moves.push({
                        from: {r, c},
                        to: {
                            r: nr,
                            c: nc
                        }
                    });

                }

            }

        }


        /*
         * BISHOP / ROOK / QUEEN
         */

        if (
            type === "b" ||
            type === "r" ||
            type === "q"
        ) {

            let directions = [];

            if (
                type === "b" ||
                type === "q"
            ) {

                directions.push(
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                );

            }

            if (
                type === "r" ||
                type === "q"
            ) {

                directions.push(
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                );

            }

            for (
                const [
                    dr,
                    dc
                ] of directions
            ) {

                let nr = r + dr;
                let nc = c + dc;

                while (
                    this.inside(nr, nc)
                ) {

                    const target =
                        board[nr][nc];

                    if (!target) {

                        moves.push({
                            from: {r, c},
                            to: {
                                r: nr,
                                c: nc
                            }
                        });

                    } else {

                        if (
                            this.colorOf(target) !== color
                        ) {

                            moves.push({
                                from: {r, c},
                                to: {
                                    r: nr,
                                    c: nc
                                }
                            });

                        }

                        break;

                    }

                    nr += dr;
                    nc += dc;

                }

            }

        }


        /*
         * KING
         */

        if (type === "k") {

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
                    ) {
                        continue;
                    }

                    const nr = r + dr;
                    const nc = c + dc;

                    if (
                        !this.inside(nr, nc)
                    ) {
                        continue;
                    }

                    const target =
                        board[nr][nc];

                    if (
                        !target ||
                        this.colorOf(target) !== color
                    ) {

                        moves.push({
                            from: {r, c},
                            to: {
                                r: nr,
                                c: nc
                            }
                        });

                    }

                }

            }


            /*
             * CASTLING
             */

            if (
                includeCastle &&
                !this.isInCheck(board, color)
            ) {

                const row =
                    color === "w"
                        ? 7
                        : 0;


                // King side

                const kingRight =
                    color === "w"
                        ? this.castling.wK
                        : this.castling.bK;

                if (
                    kingRight &&
                    board[row][5] === null &&
                    board[row][6] === null
                ) {

                    const rook =
                        color === "w"
                            ? "R"
                            : "r";

                    if (
                        board[row][7] === rook &&
                        !this.isSquareAttacked(
                            board,
                            row,
                            5,
                            this.opposite(color)
                        ) &&
                        !this.isSquareAttacked(
                            board,
                            row,
                            6,
                            this.opposite(color)
                        )
                    ) {

                        moves.push({
                            from: {
                                r: row,
                                c: 4
                            },
                            to: {
                                r: row,
                                c: 6
                            },
                            castle: "K"
                        });

                    }

                }


                // Queen side

                const queenRight =
                    color === "w"
                        ? this.castling.wQ
                        : this.castling.bQ;

                if (
                    queenRight &&
                    board[row][1] === null &&
                    board[row][2] === null &&
                    board[row][3] === null
                ) {

                    const rook =
                        color === "w"
                            ? "R"
                            : "r";

                    if (
                        board[row][0] === rook &&
                        !this.isSquareAttacked(
                            board,
                            row,
                            3,
                            this.opposite(color)
                        ) &&
                        !this.isSquareAttacked(
                            board,
                            row,
                            2,
                            this.opposite(color)
                        )
                    ) {

                        moves.push({
                            from: {
                                r: row,
                                c: 4
                            },
                            to: {
                                r: row,
                                c: 2
                            },
                            castle: "Q"
                        });

                    }

                }

            }

        }

        return moves;

    },


    makeMoveOnBoard(
        board,
        move
    ) {

        const newBoard =
            this.cloneBoard(board);

        const piece =
            newBoard[
                move.from.r
            ][
                move.from.c
            ];

        newBoard[
            move.from.r
        ][
            move.from.c
        ] = null;


        /*
         * En passant capture
         */

        if (move.enPassant) {

            const captureRow =
                move.from.r;

            newBoard[
                captureRow
            ][
                move.to.c
            ] = null;

        }


        /*
         * Promotion
         */

        let finalPiece = piece;

        if (move.promotion) {

            finalPiece =
                this.colorOf(piece) === "w"
                    ? move.promotion.toUpperCase()
                    : move.promotion;

        }

        newBoard[
            move.to.r
        ][
            move.to.c
        ] = finalPiece;


        /*
         * Castling rook
         */

        if (move.castle) {

            const row =
                move.from.r;

            if (
                move.castle === "K"
            ) {

                newBoard[row][7] = null;

                newBoard[row][5] =
                    this.colorOf(piece) === "w"
                        ? "R"
                        : "r";

            } else {

                newBoard[row][0] = null;

                newBoard[row][3] =
                    this.colorOf(piece) === "w"
                        ? "R"
                        : "r";

            }

        }

        return newBoard;

    },


    getLegalMoves(
        color,
        board = this.board
    ) {

        const moves = [];

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

                if (
                    this.colorOf(board[r][c]) !== color
                ) {
                    continue;
                }

                const pseudo =
                    this.pseudoMoves(
                        board,
                        r,
                        c,
                        color
                    );

                for (
                    const move of pseudo
                ) {

                    const next =
                        this.makeMoveOnBoard(
                            board,
                            move
                        );

                    if (
                        !this.isInCheck(
                            next,
                            color
                        )
                    ) {

                        moves.push(move);

                    }

                }

            }

        }

        return moves;

    },


    getMovesForSquare(
        r,
        c
    ) {

        return this.getLegalMoves(
            this.turn
        ).filter(
            move =>
                move.from.r === r &&
                move.from.c === c
        );

    },


    updateCastlingRights(
        piece,
        from,
        to,
        captured
    ) {

        if (piece === "K") {
            this.castling.wK = false;
            this.castling.wQ = false;
        }

        if (piece === "k") {
            this.castling.bK = false;
            this.castling.bQ = false;
        }

        if (
            piece === "R" &&
            from.r === 7 &&
            from.c === 0
        ) {
            this.castling.wQ = false;
        }

        if (
            piece === "R" &&
            from.r === 7 &&
            from.c === 7
        ) {
            this.castling.wK = false;
        }

        if (
            piece === "r" &&
            from.r === 0 &&
            from.c === 0
        ) {
            this.castling.bQ = false;
        }

        if (
            piece === "r" &&
            from.r === 0 &&
            from.c === 7
        ) {
            this.castling.bK = false;
        }


        /*
         * Captured rook
         */

        if (
            captured === "R" &&
            to.r === 7 &&
            to.c === 0
        ) {
            this.castling.wQ = false;
        }

        if (
            captured === "R" &&
            to.r === 7 &&
            to.c === 7
        ) {
            this.castling.wK = false;
        }

        if (
            captured === "r" &&
            to.r === 0 &&
            to.c === 0
        ) {
            this.castling.bQ = false;
        }

        if (
            captured === "r" &&
            to.r === 0 &&
            to.c === 7
        ) {
            this.castling.bK = false;
        }

    },


    makeMove(move) {

        if (this.gameOver) {
            return false;
        }

        const piece =
            this.board[
                move.from.r
            ][
                move.from.c
            ];

        const captured =
            move.enPassant
                ? (
                    this.board[
                        move.from.r
                    ][
                        move.to.c
                    ]
                )
                : (
                    this.board[
                        move.to.r
                    ][
                        move.to.c
                    ]
                );


        const snapshot = {
            board:
                this.cloneBoard(
                    this.board
                ),

            turn:
                this.turn,

            castling:
                {
                    ...this.castling
                },

            enPassant:
                this.enPassant
                    ? {
                        ...this.enPassant
                    }
                    : null,

            move: {
                ...move
            },

            captured,

            piece

        };

        this.history.push(snapshot);


        this.updateCastlingRights(
            piece,
            move.from,
            move.to,
            captured
        );


        this.board =
            this.makeMoveOnBoard(
                this.board,
                move
            );


        /*
         * En passant target
         */

        this.enPassant = null;

        if (
            this.typeOf(piece) === "p" &&
            Math.abs(
                move.to.r -
                move.from.r
            ) === 2
        ) {

            this.enPassant = {
                r:
                    (
                        move.from.r +
                        move.to.r
                    ) / 2,

                c:
                    move.from.c
            };

        }


        this.turn =
            this.opposite(
                this.turn
            );

        this.selected = null;

        this.legalMoves = [];

        this.checkGameState();

        return true;

    },


    undo() {

        if (
            this.history.length === 0
        ) {
            return false;
        }

        const snapshot =
            this.history.pop();

        this.board =
            snapshot.board;

        this.turn =
            snapshot.turn;

        this.castling =
            snapshot.castling;

        this.enPassant =
            snapshot.enPassant;

        this.gameOver = false;

        this.winner = null;

        this.selected = null;

        this.legalMoves = [];

        return true;

    },


    checkGameState() {

        const legal =
            this.getLegalMoves(
                this.turn
            );

        if (
            legal.length === 0
        ) {

            this.gameOver = true;

            if (
                this.isInCheck(
                    this.board,
                    this.turn
                )
            ) {

                this.winner =
                    this.opposite(
                        this.turn
                    );

            } else {

                this.winner = "draw";

            }

            return;

        }


        /*
         * 50 move / repetition is omitted.
         */

        this.gameOver = false;

        this.winner = null;

    },


    getAllLegalMoves(color) {

        return this.getLegalMoves(
            color
        );

    },


    evaluateBoard(
        board,
        aiColor
    ) {

        let score = 0;

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
                    board[r][c];

                if (!piece) {
                    continue;
                }

                const value =
                    PIECE_VALUES[
                        this.typeOf(piece)
                    ];

                const color =
                    this.colorOf(piece);

                if (
                    color === aiColor
                ) {

                    score += value;

                } else {

                    score -= value;

                }


                /*
                 * Center control
                 */

                if (
                    r >= 2 &&
                    r <= 5 &&
                    c >= 2 &&
                    c <= 5
                ) {

                    score +=
                        color === aiColor
                            ? 8
                            : -8;

                }

            }

        }

        return score;

    },


    minimax(
        board,
        depth,
        maximizingColor,
        aiColor,
        alpha = -Infinity,
        beta = Infinity
    ) {

        const moves =
            this.getLegalMoves(
                maximizingColor,
                board
            );

        if (
            depth === 0 ||
            moves.length === 0
        ) {

            if (
                moves.length === 0 &&
                this.isInCheck(
                    board,
                    maximizingColor
                )
            ) {

                if (
                    maximizingColor === aiColor
                ) {

                    return -999999;

                }

                return 999999;

            }

            return this.evaluateBoard(
                board,
                aiColor
            );

        }


        const maximizing =
            maximizingColor === aiColor;


        if (maximizing) {

            let best =
                -Infinity;

            for (
                const move of moves
            ) {

                const next =
                    this.makeMoveOnBoard(
                        board,
                        move
                    );

                const score =
                    this.minimax(
                        next,
                        depth - 1,
                        this.opposite(
                            maximizingColor
                        ),
                        aiColor,
                        alpha,
                        beta
                    );

                best =
                    Math.max(
                        best,
                        score
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

        }


        let best =
            Infinity;

        for (
            const move of moves
        ) {

            const next =
                this.makeMoveOnBoard(
                    board,
                    move
                );

            const score =
                this.minimax(
                    next,
                    depth - 1,
                    this.opposite(
                        maximizingColor
                    ),
                    aiColor,
                    alpha,
                    beta
                );

            best =
                Math.min(
                    best,
                    score
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

    },


    findBestMove(
        difficulty
    ) {

        const moves =
            this.getLegalMoves(
                this.computerColor
            );

        if (
            moves.length === 0
        ) {
            return null;
        }


        /*
         * Beginner:
         * random legal move
         */

        if (
            difficulty === 1
        ) {

            return moves[
                Math.floor(
                    Math.random() *
                    moves.length
                )
            ];

        }


        /*
         * Easy:
         * prefer captures
         */

        if (
            difficulty === 2
        ) {

            const captures =
                moves.filter(
                    move =>
                        this.board[
                            move.to.r
                        ][
                            move.to.c
                        ] !== null
                );

            if (
                captures.length
            ) {

                return captures[
                    Math.floor(
                        Math.random() *
                        captures.length
                    )
                ];

            }

            return moves[
                Math.floor(
                    Math.random() *
                    moves.length
                )
            ];

        }


        /*
         * Medium / Hard
         */

        const depth =
            difficulty === 3
                ? 2
                : 3;

        let bestScore =
            -Infinity;

        let bestMoves = [];

        for (
            const move of moves
        ) {

            const next =
                this.makeMoveOnBoard(
                    this.board,
                    move
                );

            const score =
                this.minimax(
                    next,
                    depth - 1,
                    this.playerColor,
                    this.computerColor
                );


            if (
                score > bestScore
            ) {

                bestScore = score;

                bestMoves = [
                    move
                ];

            } else if (
                score === bestScore
            ) {

                bestMoves.push(
                    move
                );

            }

        }


        return bestMoves[
            Math.floor(
                Math.random() *
                bestMoves.length
            )
        ];

    },


    moveNotation(move, boardBefore) {

        const piece =
            boardBefore[
                move.from.r
            ][
                move.from.c
            ];

        const type =
            this.typeOf(piece);

        let notation = "";

        if (
            type !== "p"
        ) {

            notation +=
                type.toUpperCase();

        }


        if (
            move.castle === "K"
        ) {

            return "O-O";

        }

        if (
            move.castle === "Q"
        ) {

            return "O-O-O";

        }


        const capture =
            move.enPassant ||
            boardBefore[
                move.to.r
            ][
                move.to.c
            ] !== null;


        if (
            type === "p" &&
            capture
        ) {

            notation +=
                FILES[
                    move.from.c
                ];

        }


        if (capture) {

            notation += "x";

        }


        notation +=
            this.squareName(
                move.to.r,
                move.to.c
            );


        if (
            move.promotion
        ) {

            notation +=
                "=" +
                move.promotion.toUpperCase();

        }

        return notation;

    }

};


window.ChessGame = ChessGame;
