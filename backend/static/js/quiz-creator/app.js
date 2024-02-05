fetch('/quiz-creator/data')
    .then(response => response.json())
    .then(data => {
        // console.log('Data from backend:', data);
        // Update your frontend with the received data
    })
    .catch(error => console.error('Error fetching data:', error));

//MAIN QUIZ/QUESTION CONTAINERS
let quiz = { name: '', length: 0, questions: [], answers: [] };
class Question {
    constructor({ question, answers, answer }) {
        this.question = question;
        this.answers = answers;
        this.answer = answer;
    }
}


//HELPER FUNCTIONS FOR QUICKER DEVELOPMENT
const getElement = (id) => document.getElementById(id);
const createEl = (type, className) => Object.assign(document.createElement(type), { className });
const addElement = (parent, type, textContent, eventListener) => {
    const el = createEl(type);
    if (textContent) el.textContent = textContent;
    if (eventListener) el.addEventListener('click', eventListener);
    parent.appendChild(el);
    return el;
};


//ALL GLOBAL VARIABLES
const quizName = getElement('quiz-name')
const newQuestion = getElement('add-question')
const saveQuizButton = getElement('save-quiz')
const questionContainer = getElement('questions')
const savedQuizzes = getElement('saved-quizzes')


//MODAL SHOW/HIDE CODE
const span = getElement("close");
const modal = getElement("main-modal");
const modalContent = getElement("modal-content");

const showModal = () => {
    modal.style.display = 'block';
    setTimeout(() => {
        Object.assign(modal.style, { opacity: '1', pointerEvents: 'all' });
        modalContent.style.transform = 'translate(-50%, 50%)';
    }, 10);
};
const hideModal = () => {
    Object.assign(modal.style, { opacity: '0', pointerEvents: 'none' });
    modalContent.style.transform = 'translate(-50%, 0%)';
    setTimeout(() => modal.style.display = 'none', 500);
};
span.onclick = hideModal;
window.onclick = (event) => {
    // Check if the clicked target is the modal
    if (event.target == modal) {
        // Exclude links from hiding the modal
        if (!event.target.closest('a')) {
            hideModal();
        }
    }
};


//FUNCTION TO ADD A NEW QUESTION
const addNewQuestionBox = () => {
    quiz.length++
    const qbox = addElement(questionContainer, 'li', null);
    qbox.className = 'question'
    qbox.id = parseInt(quiz.length);
    qbox.dataset.correctAnswer = 'null';

    const q = addElement(qbox, 'input', null);
    q.className = 'question-answer-box'
    q.setAttribute('type', 'text')
    q.placeholder = 'Write a new question...';

    const answers = addElement(qbox, 'ul');
    answers.className = 'answer-box'
    const buttonBox = addElement(qbox, 'div')
    const addButton = addElement(buttonBox, 'button', 'Add Answer', () => addNewAnswerBox(answers, qbox.id));
    addButton.className = 'sub-button'
};


//FUNCTION TO ADD A NEW ANSWER
const addNewAnswerBox = (answers, index) => {
    const answerBox = addElement(answers, 'li');
    answerBox.className = 'answer'
    answerBox.dataset.number = answers.childElementCount;

    const correctAnswerCheck = addElement(answerBox, 'div');
    correctAnswerCheck.className = 'checkbox';
    correctAnswerCheck.checked = false;
    correctAnswerCheck.addEventListener('click', (e) => {
        correctAnswerCheck.checked = !correctAnswerCheck.checked
        setCorrectAnswer(index, parseInt(e.target.parentElement.dataset.number), correctAnswerCheck);
    })
    const answer = addElement(answerBox, 'input', null);
    answer.className = 'question-answer-box'
    answer.setAttribute('type', 'text')
    answer.placeholder = 'Write a new answer...';
};


//FUNCTION THAT SETS CORRECT ANSWER TO FOCUSED QUESTION
const setCorrectAnswer = (questionNumber, answerNumber, checked) => {
    const allAnswers = questionContainer.children[questionNumber - 1].children[1].children;

    if (questionContainer.children[questionNumber - 1].dataset.correctAnswer != 'null') {
        allAnswers[questionContainer.children[questionNumber - 1].dataset.correctAnswer - 1].children[0].checked = false;
        questionContainer.children[questionNumber - 1].dataset.correctAnswer = 'null';

        if (allAnswers[answerNumber - 1].children[0].checked == true) {
            questionContainer.children[questionNumber - 1].dataset.correctAnswer = answerNumber;
        }
    } else {
        questionContainer.children[questionNumber - 1].dataset.correctAnswer = answerNumber;
    }

    Array.from(allAnswers).forEach(ans => {
        const checkbox = ans.children[0];
        const isChecked = checkbox.checked;
    
        checkbox.classList.toggle('checkbox-active', isChecked);
        checkbox.classList.toggle('checkbox', !isChecked);
    });
};


//ADDS ALL QUIZ/QUESTION INFO TO RESPECTIVE CONTAINERS AND PUSHES QUIZ TO DB/LOCALSTORAGE
const saveQuiz = () => {
    quiz.answers = [];
    quiz.questions = [];
    quiz.name = quizName.value;

    const questions = Array.from(questionContainer.children);

    if (questions.length < 1) showModal();

    questions.forEach((question) => {
        const title = question.children[0].value;
        const answers = Array.from(question.children[1].children).map(z => z.children[1].value);
        const correct = parseInt(question.dataset.correctAnswer) + 1;

        const ques = new Question({ question: { title }, answers, answer: { correct } });
        quiz.answers.push(answers);
        

        if (quiz.name == '' || title == '' || answers.length < 2 || !correct || correct == 0) showModal();

        quiz.questions.push(title);
    });

    if (quiz.name && quiz.questions.length > 0) {
        const quizId = generateUniqueId();
        localStorage.setItem(quizId, JSON.stringify(quiz));

        // window.open(`/quiz.html?id=${quizId}`)
        pushQuiz()
    }
    

};


//GENERATES UNIQUE ID FOR QUIZ TO BE USED FOR URL PARAMS
const generateUniqueId = () => {
    const timestamp = new Date().getTime().toString(16);
    const randomPart = Math.floor(Math.random() * 1000000).toString(16);
    return timestamp + randomPart;
};

async function pushQuiz() {
    const response = await fetch('/quiz-creator/postQuiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
    })
    if (response.ok) {
        alert('Data successfully sent to the database.')
        const data = await response.json()
        const id = data.id

        window.location.href = `/quiz-creator/quiz/${id}`
    } else {
        alert('Failed to send data to the database.')
    }
}


//INITIAL EVENT LISTENERS
newQuestion.addEventListener('click', addNewQuestionBox);
saveQuizButton.addEventListener('click', saveQuiz);