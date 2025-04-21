document.addEventListener("DOMContentLoaded", () => {
    startQuizTrivia();

    function startQuizTrivia() {
        const headerButton = document.querySelector("header button");
        const header = document.querySelector("header");
        const main = document.querySelector("main");

        headerButton.addEventListener("click", () => {
            // Counter to track current question
            let currentIndex = 0;

            header.setAttribute("class", "hidden");
            main.className = "";
            fetchQuestionsFromServer(currentIndex);
        })
    }

    function fetchQuestionsFromServer(currentIndex) {
        fetch("https://opentdb.com/api.php?amount=5&type=multiple")
            .then(response => response.json())
            .then(obj => displayQuestionsOnWebPage(currentIndex, obj.results))
            .catch(error => alert(error.message))
    }

    function displayQuestionsOnWebPage(currentIndex, triviaQuestionsArray) {
        let score = 0, timeTaken = 0, countDown, runDown;
        const arrayForFailedQuestions = [];

        const questionElement = document.querySelector("#questionDisplay");
        const questionNumber = document.querySelector("#questionNumber");
        const radioLabels = document.querySelectorAll("label");
        const radioInputs = document.querySelectorAll("input[type='radio']");
        const displayResults = document.querySelector("#displayResults");
        const timerDisplay = document.querySelector("#timerDisplay");

        function updateQuestion() {
            countDown = 30;
            if (runDown) clearInterval(runDown);
            const countDownTimer = document.querySelector("#countDownTimer");

            runDown = setInterval(() => {
                // Change Color of countDownTimer from green to red when time left is 10 secs
                (countDown > 10) ? countDownTimer.className = "relaxedZone" : countDownTimer.className = "dangerZone";

                if (countDown <= 0) {
                    clearInterval(runDown);
                    countDownTimer.textContent = "Time's up, Click on the Next button to continue";
                    radioInputs.forEach((input) => {
                        input.disabled = true;
                    });
                    // WHEN RADIO INPUT NOT SELECTED REGISTER IT AS A FAILED ATTEMPT
                    updateArrayForFailedQuestions();
                } else {
                    // Change plurals of seconds depending on value
                    countDownTimer.textContent = (countDown === 1)
                        ? `Time Left: ${countDown} second`
                        : `Time Left: ${countDown} seconds`;

                    --countDown;
                }
            }, 1000);

            const currentTriviaQuestion = triviaQuestionsArray[currentIndex];

            questionNumber.textContent = `Question ${currentIndex + 1} of ${triviaQuestionsArray.length}`;

            // Update the question
            questionElement.textContent = currentTriviaQuestion.question;

            // Combine correct and incorrect answers and shuffle them
            const allAnswers = [currentTriviaQuestion.correct_answer, ...currentTriviaQuestion.incorrect_answers]

            // Update radio inputs and labels with the answers
            shuffleArrayElements(allAnswers).forEach((answerElement, answerElementIndex) => {
                radioInputs[answerElementIndex].value = answerElement;
                radioLabels[answerElementIndex].textContent = answerElement;
            });
        }

        // Initialize the first question
        updateQuestion();

        // Start timer
        let timer = setInterval(() => {

            if (timeTaken < 60) {

                // Change plurals of seconds depending on value
                timerDisplay.textContent = (timeTaken === 1)
                    ? `TOTAL TIME TAKEN: ${timeTaken} second`
                    : `TOTAL TIME TAKEN: ${timeTaken} seconds`;

                ++timeTaken;

            } else {
                let minutes;
                let seconds;

                // Change plurals of minutes depending on value
                minutes = (Math.floor(timeTaken / 60)) === 1
                    ? `${Math.floor(timeTaken / 60)} minute`
                    : `${Math.floor(timeTaken / 60)} minutes`;

                // Change plurals of seconds depending on value
                seconds = (timeTaken % 60) === 1
                    ? `${timeTaken % 60} second`
                    : `${timeTaken % 60} seconds`;

                timerDisplay.textContent = `TOTAL TIME TAKEN: 
            ${minutes} ${seconds}`;
                ++timeTaken;
            }

        }, 1000);

        function updateArrayForFailedQuestions() {
            const currentTriviaQuestion = triviaQuestionsArray[currentIndex];

            const objectForFailedQuestion = {
                "question": currentTriviaQuestion.question,
                "correctAnswer": currentTriviaQuestion.correct_answer
            };

            arrayForFailedQuestions.push(objectForFailedQuestion);

            displayResults.className = "wrong";
            displayResults.textContent = `Wrong, the correct answer is ${currentTriviaQuestion.correct_answer} and your score is ${score} out of ${triviaQuestionsArray.length}`;
            setTimeout(() => displayResults.setAttribute("class", "hidden"), 5000);
        }

        // SELECTING ANSWERS
        document.querySelector("form").addEventListener("change", (event) => {
            event.preventDefault();
            radioInputs.forEach((input) => {
                input.disabled = true;
            });

            // Stop the countdown timer when an answer is selected
            clearInterval(runDown);

            displayResults.className = "";

            const currentTriviaQuestion = triviaQuestionsArray[currentIndex];

            if (event.target.value === currentTriviaQuestion.correct_answer) {
                displayResults.className = "right";
                displayResults.textContent = `YOU GOT IT CORRECT. YOUR SCORE IS ${score += 1} out of ${triviaQuestionsArray.length}`;
            } else {
                updateArrayForFailedQuestions();
            }

            setTimeout(() => displayResults.setAttribute("class", "hidden"), 5000);
        })

        // Event listener for the "NEXT" button
        document.querySelector("#nextButton").addEventListener("click", () => {
            displayResults.className = "hidden";
            const selectedRadioInput = document.querySelector("input:checked");
            if (selectedRadioInput || (countDown <= 0)) {
                radioInputs.forEach((input) => {
                    input.disabled = false;
                    input.checked = false;
                });

                // Stop the countdown timer when moving to the next question
                clearInterval(runDown);

                const totalScore = `${score} / ${triviaQuestionsArray.length}`

                currentIndex = (currentIndex + 1);

                if (currentIndex < triviaQuestionsArray.length) {
                    updateQuestion();
                } else {
                    clearInterval(timer);
                    displayFinalResults(arrayForFailedQuestions, totalScore, timeTaken);
                }
            } else {
                displayResults.className = "";
                displayResults.className = "neutral";
                displayResults.textContent = "SELECT AN ANSWER BEFORE PROCEEDING TO THE NEXT QUESTION";
                setTimeout(() => displayResults.setAttribute("class", "hidden"), 5000);
            }
        });
    }

    function shuffleArrayElements(array) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex > 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    function displayFinalResults(arrayForFailedQuestions, totalScore, timeTaken) {
        let finalTimeTaken;

        if (timeTaken < 60) {
            // Change plurals of seconds depending on value
            finalTimeTaken = (timeTaken === 1)
                ? `TOTAL TIME TAKEN: ${timeTaken} second`
                : `TOTAL TIME TAKEN: ${timeTaken} seconds`;
        } else {
            let minutes;
            let seconds;

            // Change plurals of minutes depending on value
            minutes = (Math.floor(timeTaken / 60)) === 1
                ? `${Math.floor(timeTaken / 60)} minute`
                : `${Math.floor(timeTaken / 60)} minutes`;

            // Change plurals of seconds depending on value
            seconds = (timeTaken % 60) === 1
                ? `${timeTaken % 60} second`
                : `${timeTaken % 60} seconds`;

            finalTimeTaken = `TOTAL TIME TAKEN: ${minutes} ${seconds}`;
        }

        const main = document.querySelector("main");
        main.setAttribute("class", "hidden");

        const section = document.querySelector("section");
        section.className = "";

        const totalScoreDisplay = document.querySelector("#totalScoreDisplay");
        const totalTimeDisplay = document.querySelector("#totalTimeDisplay");

        totalScoreDisplay.textContent = `TOTAL SCORE: ${totalScore}`;
        totalTimeDisplay.textContent = finalTimeTaken;

        const failedQuestionsDisplay = document.querySelector("ul");

        if (arrayForFailedQuestions.length !== 0) {
            arrayForFailedQuestions.forEach((failedQuestion) => {
                const li = document.createElement("li");
                const question = document.createElement("p");
                const answer = document.createElement("p");

                question.textContent = `Question: ${failedQuestion.question}`;
                answer.textContent = `Answer: ${failedQuestion.correctAnswer}`;
                li.append(question, answer);
                failedQuestionsDisplay.append(li);
            })
        } else {
            failedQuestionsDisplay.textContent = "GENIUS";
        }

        const restartButton = document.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            section.className = "hidden";

            const header = document.querySelector("header");
            header.className = "";
            startQuizTrivia();
        })

    }

    // Ensure next button only works when an answer is selected

    // PENDING
    // Select the number of questions, the category, difficulty and type of questions I want to be quizzed on and the webpage should make the fetch request to display the quiz.
})