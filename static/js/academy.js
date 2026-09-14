const lessons = [

    {
        id: 1,
        title: "What Is Chess?",
        text:
            "Learn the goal of chess, turns, checkmate and the basic rules."
    },

    {
        id: 2,
        title: "The Chess Board",
        text:
            "Learn files, ranks, coordinates and how to correctly set up the board."
    },

    {
        id: 3,
        title: "The Pieces",
        text:
            "Learn how the King, Queen, Rook, Bishop, Knight and Pawn move."
    },

    {
        id: 4,
        title: "Special Moves",
        text:
            "Learn castling, en passant and pawn promotion."
    },

    {
        id: 5,
        title: "Check & Checkmate",
        text:
            "Understand check, checkmate, stalemate and legal responses."
    },

    {
        id: 6,
        title: "Opening Principles",
        text:
            "Control the center, develop pieces and protect your king."
    },

    {
        id: 7,
        title: "Chess Tactics",
        text:
            "Learn forks, pins, skewers, discovered attacks and double attacks."
    },

    {
        id: 8,
        title: "Chess Strategy",
        text:
            "Learn pawn structures, weak squares, open files and outposts."
    },

    {
        id: 9,
        title: "Endgames",
        text:
            "Learn king and pawn endings, opposition and basic rook endings."
    },

    {
        id: 10,
        title: "Calculation",
        text:
            "Learn candidate moves and calculate variations before moving."
    },

    {
        id: 11,
        title: "Advanced Strategy",
        text:
            "Learn positional evaluation, planning and long-term advantages."
    },

    {
        id: 12,
        title: "Master Training",
        text:
            "Combine tactics, strategy, calculation, openings and endgames."
    }

];


function getCompletedLessons() {

    return JSON.parse(
        localStorage.getItem(
            "completedLessons"
        ) || "[]"
    );

}


function renderLessons() {

    const container =
        document.getElementById(
            "lessonContainer"
        );


    const completed =
        getCompletedLessons();


    container.innerHTML = "";


    lessons.forEach(
        lesson => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "lesson";


            if (
                completed.includes(
                    lesson.id
                )
            ) {

                card.classList.add(
                    "completed"
                );

            }


            card.innerHTML = `

                <h3>
                    ${lesson.id}.
                    ${lesson.title}
                </h3>

                <p>
                    ${lesson.text}
                </p>

                <button>
                    ${
                        completed.includes(
                            lesson.id
                        )
                        ? "Completed ✓"
                        : "Complete Lesson"
                    }
                </button>

            `;


            card
                .querySelector("button")
                .onclick = () => {

                    let current =
                        getCompletedLessons();


                    if (
                        !current.includes(
                            lesson.id
                        )
                    ) {

                        current.push(
                            lesson.id
                        );

                    }


                    localStorage.setItem(
                        "completedLessons",
                        JSON.stringify(
                            current
                        )
                    );


                    renderLessons();

                };


            container.appendChild(
                card
            );

        }
    );

}


renderLessons();
