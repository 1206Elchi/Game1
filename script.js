let questions;
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let backgroundMusic, correctSound, wrongSound;
let jokersUsed = {
    fiftyFifty: false,
    phoneFriend: false,
    askAudience: false
};
let phoneTimerInterval;

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.querySelector('.start-btn');
    startBtn.addEventListener('click', startQuiz);

    backgroundMusic = document.getElementById('background-music');
    correctSound = document.getElementById('correct-sound');
    wrongSound = document.getElementById('wrong-sound');

    backgroundMusic.volume = 0.1;
});

function startQuiz() {
    backgroundMusic.play();
    fetch('qa.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            document.getElementById('quiz-info').style.display = 'flex';
            showQuestion();
            updateQuestionCounter();
            setupJokers();
        });
}

function showQuestion() {
    const quizContent = document.getElementById('quiz-content');
    const question = questions[currentQuestion];

    quizContent.innerHTML = `
        <div class="question">
            <h2>${question.question}</h2>
            ${question.answers.map((answer, index) => `
                <button class="answer-btn" data-index="${index}">${answer}</button>
            `).join('')}
        </div>
    `;

    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns.forEach(btn => {
        btn.addEventListener('click', handleAnswer);
    });

    updateQuestionCounter();
}

function handleAnswer(e) {
    const selectedAnswer = parseInt(e.target.dataset.index);
    const question = questions[currentQuestion];

    userAnswers.push(selectedAnswer);

    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.index) === question.correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (selectedAnswer === question.correctAnswer) {
        score++;
        correctSound.play();
    } else {
        wrongSound.play();
    }

    if (phoneTimerInterval) {
        clearInterval(phoneTimerInterval);
        document.getElementById('timer').style.display = 'none';
    }

    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML += `
        <button class="continue-btn">Fortsetzen</button>
    `;

    const continueBtn = document.querySelector('.continue-btn');
    continueBtn.addEventListener('click', nextQuestion);
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
        updateQuestionCounter();
    } else {
        showResults();
    }
}

function showResults() {
    const quizContent = document.getElementById('quiz-content');
    document.getElementById('quiz-info').style.display = 'none';
    quizContent.innerHTML = `
        <div class="results">
            <h2>Quiz beendet!</h2>
            <p>Du hast ${score} von ${questions.length} Fragen richtig beantwortet.</p>
            <button class="results-btn">Ergebnisse anzeigen</button>
        </div>
    `;

    const resultsBtn = document.querySelector('.results-btn');
    resultsBtn.addEventListener('click', showDetailedResults);
}

function showDetailedResults() {
    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML = `
        <div class="results">
            <h2>Detaillierte Ergebnisse</h2>
            <ul class="results-list">
                ${questions.map((q, index) => `
                    <li>
                        <strong>Frage ${index + 1}:</strong> ${q.question}<br>
                        Deine Antwort: ${q.answers[userAnswers[index]]}<br>
                        Richtige Antwort: ${q.answers[q.correctAnswer]}
                    </li>
                `).join('')}
            </ul>
            <button class="start-btn" onclick="location.reload()">Erneut spielen</button>
        </div>
    `;
}

function updateQuestionCounter() {
    const counter = document.getElementById('question-counter');
    counter.textContent = `Frage: ${currentQuestion + 1} / ${questions.length}`;
}

function setupJokers() {
    document.getElementById('fifty-fifty').addEventListener('click', useFiftyFifty);
    document.getElementById('phone-friend').addEventListener('click', usePhoneFriend);
    document.getElementById('ask-audience').addEventListener('click', useAskAudience);
}

function useFiftyFifty() {
    if (jokersUsed.fiftyFifty) return;
    jokersUsed.fiftyFifty = true;
    document.getElementById('fifty-fifty').disabled = true;

    const correctAnswerIndex = questions[currentQuestion].correctAnswer;
    const answerButtons = document.querySelectorAll('.answer-btn');
    let removedCount = 0;

    answerButtons.forEach((btn, index) => {
        if (index !== correctAnswerIndex && removedCount < 2) {
            btn.classList.add('wrong-answer');
            btn.disabled = true;
            removedCount++;
        }
    });
}

function usePhoneFriend() {
    if (jokersUsed.phoneFriend) return;
    jokersUsed.phoneFriend = true;
    document.getElementById('phone-friend').disabled = true;

    const timerElement = document.getElementById('timer');
    timerElement.style.display = 'block';
    let timeLeft = 120;

    phoneTimerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Zeit übrig: ${timeLeft} Sekunden`;

        if (timeLeft <= 0) {
            clearInterval(phoneTimerInterval);
            timerElement.style.display = 'none';
        }
    }, 1000);
}

function useAskAudience() {
    if (jokersUsed.askAudience) return;
    jokersUsed.askAudience = true;
    document.getElementById('ask-audience').disabled = true;
}
