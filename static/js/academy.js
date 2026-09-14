/* =========================================================
   CHESS ACADEMY
========================================================= */

const Academy = {

    lessons: [

        {
            id: 1,
            level: "BEGINNER",
            title: "The Chessboard",
            description:
                "Learn the board, files, ranks, squares and starting position.",
            content: `
                <div class="lesson-content">

                    <h2>The Chessboard</h2>

                    <p>
                        A chessboard contains 64 squares arranged
                        in 8 files and 8 ranks.
                    </p>

                    <h3>Files</h3>

                    <p>
                        Files are the vertical columns and are named
                        from <strong>a</strong> to <strong>h</strong>.
                    </p>

                    <h3>Ranks</h3>

                    <p>
                        Ranks are the horizontal rows and are numbered
                        from <strong>1</strong> to <strong>8</strong>.
                    </p>

                    <div class="example">
                        The square where the White king starts is
                        <strong>e1</strong>.
                    </div>

                    <h3>Starting Position</h3>

                    <p>
                        White pieces start on ranks 1 and 2.
                        Black pieces start on ranks 7 and 8.
                    </p>

                </div>
            `
        },

        {
            id: 2,
            level: "BEGINNER",
            title: "The Pieces",
            description:
                "Learn how every chess piece moves.",
            content: `
                <div class="lesson-content">

                    <h2>The Chess Pieces</h2>

                    <h3>King</h3>
                    <p>
                        The king moves one square in any direction.
                    </p>

                    <h3>Queen</h3>
                    <p>
                        The queen moves any number of squares
                        horizontally, vertically or diagonally.
                    </p>

                    <h3>Rook</h3>
                    <p>
                        The rook moves horizontally or vertically.
                    </p>

                    <h3>Bishop</h3>
                    <p>
                        The bishop moves diagonally.
                    </p>

                    <h3>Knight</h3>
                    <p>
                        The knight moves in an L-shape:
                        two squares in one direction and one
                        square perpendicular to it.
                    </p>

                    <h3>Pawn</h3>
                    <p>
                        Pawns normally move forward and capture
                        diagonally.
                    </p>

                </div>
            `
        },

        {
            id: 3,
            level: "BEGINNER",
            title: "How to Start a Game",
            description:
                "Understand opening principles and good first moves.",
            content: `
                <div class="lesson-content">

                    <h2>Starting a Chess Game</h2>

                    <p>
                        The opening is the first stage of the game.
                    </p>

                    <h3>Three Main Goals</h3>

                    <ul>
                        <li>Control the center.</li>
                        <li>Develop your pieces.</li>
                        <li>Keep your king safe.</li>
                    </ul>

                    <div class="example">
                        Developing a knight or bishop is usually
                        more useful than moving the same piece
                        repeatedly.
                    </div>

                </div>
            `
        },

        {
            id: 4,
            level: "BEGINNER",
            title: "Check and Checkmate",
            description:
                "Learn the most important concepts in chess.",
            content: `
                <div class="lesson-content">

                    <h2>Check and Checkmate</h2>

                    <h3>Check</h3>

                    <p>
                        A king is in check when an enemy piece
                        attacks it.
                    </p>

                    <h3>Getting Out of Check</h3>

                    <ul>
                        <li>Move the king.</li>
                        <li>Capture the attacking piece.</li>
                        <li>Block the attack when possible.</li>
                    </ul>

                    <h3>Checkmate</h3>

                    <p>
                        Checkmate occurs when the king is in check
                        and there is no legal way to escape.
                    </p>

                </div>
            `
        },

        {
            id: 5,
            level: "BEGINNER",
            title: "Piece Values",
            description:
                "Learn the basic relative value of pieces.",
            content: `
                <div class="lesson-content">

                    <h2>Piece Values</h2>

                    <div class="example">
                        Pawn = 1<br>
                        Knight = 3<br>
                        Bishop = 3<br>
                        Rook = 5<br>
                        Queen = 9
                    </div>

                    <p>
                        These values are guidelines rather than
                        absolute rules.
                    </p>

                    <p>
                        A piece can be worth more or less depending
                        on its position and the situation.
                    </p>

                </div>
            `
        },

        {
            id: 6,
            level: "INTERMEDIATE",
            title: "Opening Principles",
            description:
                "Improve your opening decisions.",
            content: `
                <div class="lesson-content">

                    <h2>Opening Principles</h2>

                    <ul>
                        <li>Fight for the center.</li>
                        <li>Develop knights and bishops.</li>
                        <li>Castle early when appropriate.</li>
                        <li>Avoid unnecessary queen moves.</li>
                        <li>Do not move the same piece repeatedly.</li>
                    </ul>

                    <h3>Think in Development</h3>

                    <p>
                        A strong opening creates active pieces
                        and prepares the middlegame.
                    </p>

                </div>
            `
        },

        {
            id: 7,
            level: "INTERMEDIATE",
            title: "Tactics",
            description:
                "Understand forks, pins, skewers and discovered attacks.",
            content: `
                <div class="lesson-content">

                    <h2>Chess Tactics</h2>

                    <h3>Fork</h3>

                    <p>
                        One piece attacks two or more enemy pieces.
                    </p>

                    <h3>Pin</h3>

                    <p>
                        A piece cannot move because moving it would
                        expose a more valuable piece behind it.
                    </p>

                    <h3>Skewer</h3>

                    <p>
                        A valuable piece is attacked and forced away,
                        exposing a less valuable piece behind it.
                    </p>

                    <h3>Discovered Attack</h3>

                    <p>
                        Moving one piece reveals an attack from
                        another piece behind it.
                    </p>

                </div>
            `
        },

        {
            id: 8,
            level: "INTERMEDIATE",
            title: "Pawn Structure",
            description:
                "Learn isolated, doubled, passed and backward pawns.",
            content: `
                <div class="lesson-content">

                    <h2>Pawn Structure</h2>

                    <p>
                        Pawns determine the long-term shape of the
                        position.
                    </p>

                    <h3>Passed Pawn</h3>

                    <p>
                        A pawn with no opposing pawn able to stop it
                        on its file or adjacent files.
                    </p>

                    <h3>Isolated Pawn</h3>

                    <p>
                        A pawn without friendly pawns on adjacent files.
                    </p>

                    <h3>Doubled Pawns</h3>

                    <p>
                        Two friendly pawns stacked on the same file.
                    </p>

                </div>
            `
        },

        {
            id: 9,
            level: "ADVANCED",
            title: "Middlegame Planning",
            description:
                "Learn how to create plans instead of making random moves.",
            content: `
                <div class="lesson-content">

                    <h2>Middlegame Planning</h2>

                    <p>
                        Strong chess players do not simply search for
                        individual moves. They create plans.
                    </p>

                    <h3>Ask These Questions</h3>

                    <ul>
                        <li>Which king is safer?</li>
                        <li>Which piece is badly placed?</li>
                        <li>What pawn breaks are available?</li>
                        <li>Which files or diagonals can be opened?</li>
                        <li>What is my opponent threatening?</li>
                    </ul>

                </div>
            `
        },

        {
            id: 10,
            level: "ADVANCED",
            title: "Endgames",
            description:
                "Learn the fundamental ideas of king and pawn endgames.",
            content: `
                <div class="lesson-content">

                    <h2>Endgames</h2>

                    <p>
                        In endgames, the king becomes an active piece.
                    </p>

                    <h3>King Activity</h3>

                    <p>
                        Unlike the opening, the king often belongs
                        near the center in an endgame.
                    </p>

                    <h3>Passed Pawns</h3>

                    <p>
                        Creating and supporting a passed pawn is often
                        the main objective.
                    </p>

                </div>
            `
        },

        {
            id: 11,
            level: "ADVANCED",
            title: "Calculation",
            description:
                "Learn a disciplined method for calculating variations.",
            content: `
                <div class="lesson-content">

                    <h2>Calculation</h2>

                    <p>
                        Strong calculation begins by looking at forcing
                        moves.
                    </p>

                    <div class="example">
                        Candidate order:
                        Checks → Captures → Threats
                    </div>

                    <p>
                        Calculate the opponent's strongest response,
                        not the response you hope they will play.
                    </p>

                </div>
            `
        },

        {
            id: 12,
            level: "MASTER",
            title: "Chess Thinking System",
            description:
                "Build a professional thinking process for serious games.",
            content: `
                <div class="lesson-content">

                    <h2>Chess Thinking System</h2>

                    <h3>1. Observe</h3>

                    <p>
                        Identify king safety, material and piece activity.
                    </p>

                    <h3>2. Identify Threats</h3>

                    <p>
                        Ask what your opponent wants to do.
                    </p>

                    <h3>3. Generate Candidates</h3>

                    <p>
                        Look for forcing moves first.
                    </p>

                    <h3>4. Calculate</h3>

                    <p>
                        Calculate the important variations carefully.
                    </p>

                    <h3>5. Compare</h3>

                    <p>
                        Compare the resulting positions.
                    </p>

                    <h3>6. Play</h3>

                    <p>
                        Choose the move that best fits the position.
                    </p>

                </div>
            `
        }

    ],


    completed: [],

    currentLesson: null,


    init() {

        this.loadProgress();

        this.render();

        this.bindModal();

    },


    loadProgress() {

        try {

            const saved =
                localStorage.getItem(
                    "chessAcademyProgress"
                );

            if (saved) {

                this.completed =
                    JSON.parse(saved);

            }

        } catch (error) {

            this.completed = [];

        }

    },


    saveProgress() {

        localStorage.setItem(
            "chessAcademyProgress",
            JSON.stringify(
                this.completed
            )
        );

    },


    render() {

        const container =
            document.getElementById(
                "lessonContainer"
            );

        if (!container) {
            return;
        }


        container.innerHTML = "";


        this.lessons.forEach(
            lesson => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "lesson-card";


                const completed =
                    this.completed.includes(
                        lesson.id
                    );


                if (completed) {

                    card.classList.add(
                        "completed"
                    );

                }


                card.innerHTML = `

                    <span class="lesson-level">
                        ${lesson.level}
                    </span>

                    <h3>
                        ${lesson.id}. ${lesson.title}
                    </h3>

                    <p>
                        ${lesson.description}
                    </p>

                    <button
                        class="lesson-button"
                        data-lesson="${lesson.id}"
                    >
                        ${
                            completed
                                ? "✓ Completed"
                                : "Open Lesson"
                        }
                    </button>

                `;


                const button =
                    card.querySelector(
                        ".lesson-button"
                    );


                button.addEventListener(
                    "click",
                    () => {

                        this.openLesson(
                            lesson.id
                        );

                    }
                );


                container.appendChild(
                    card
                );

            }
        );


        this.updateProgress();

    },


    updateProgress() {

        const total =
            this.lessons.length;

        const completed =
            this.completed.length;

        const percentage =
            Math.round(
                (
                    completed /
                    total
                ) * 100
            );


        const bar =
            document.getElementById(
                "academyProgressBar"
            );

        const text =
            document.getElementById(
                "academyProgressText"
            );


        if (bar) {

            bar.style.width =
                percentage + "%";

        }

        if (text) {

            text.textContent =
                percentage + "%";

        }

    },


    openLesson(id) {

        const lesson =
            this.lessons.find(
                item =>
                    item.id === id
            );

        if (!lesson) {
            return;
        }


        this.currentLesson = lesson;


        document.getElementById(
            "lessonContent"
        ).innerHTML =
            lesson.content;


        const modal =
            document.getElementById(
                "lessonModal"
            );

        modal.classList.remove(
            "hidden"
        );


        const completeButton =
            document.getElementById(
                "completeLesson"
            );


        if (
            this.completed.includes(
                id
            )
        ) {

            completeButton.textContent =
                "✓ Lesson Completed";

        } else {

            completeButton.textContent =
                "Mark Lesson Complete";

        }

    },


    completeCurrentLesson() {

        if (
            !this.currentLesson
        ) {
            return;
        }


        const id =
            this.currentLesson.id;


        if (
            !this.completed.includes(id)
        ) {

            this.completed.push(id);

        }


        this.saveProgress();

        this.render();


        document.getElementById(
            "completeLesson"
        ).textContent =
            "✓ Lesson Completed";

    },


    closeLesson() {

        document.getElementById(
            "lessonModal"
        ).classList.add(
            "hidden"
        );

    },


    bindModal() {

        document.getElementById(
            "closeLesson"
        ).addEventListener(
            "click",
            () => {

                this.closeLesson();

            }
        );


        document.getElementById(
            "completeLesson"
        ).addEventListener(
            "click",
            () => {

                this.completeCurrentLesson();

            }
        );


        document.getElementById(
            "lessonModal"
        ).addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "lessonModal"
                ) {

                    this.closeLesson();

                }

            }
        );

    }

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        Academy.init();

    }
);
