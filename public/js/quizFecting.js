function toggleCustom(show) {
    document.getElementById("custom-answer").style.display = show ? "block" : "none";
}
let questions = [];
let currentQuestion = 0;
let score = 0;
const userAnswers = {};
async function fetchQuestions() {
    const res = await fetch('/quiz/questions');
    questions = await res.json();
    loadQuestion();
}
function loadQuestion() {
    const q = questions[currentQuestion];
    document.getElementById("question-title").textContent = `Q${currentQuestion + 1}: ${q.question}`;
    document.getElementById("labelA").textContent = q.options.A;
    document.getElementById("labelB").textContent = q.options.B;
    document.getElementById("labelC").textContent = q.options.C;
    document.getElementById("labelD").textContent = q.options.D;
    document.querySelectorAll('input[name="option"]').forEach(el => el.checked = false);
    toggleCustom(false);
    document.getElementById("custom-answer").value = "";
}
function toggleCustom(show) {
    document.getElementById("custom-answer").style.display = show ? "inline-block" : "none";
}
function submitAnswer() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) return alert("Please select an answer.");
    const answerKey = selected.value;
    const q = questions[currentQuestion];
    let answerText = "";
    if (answerKey === "E") {
      const customInput = document.getElementById("custom-answer").value.trim();
      if (!customInput) return alert("Please enter your custom answer.");
      answerText = customInput;
    } else {
      answerText = q.options[answerKey];
    }
    const feedback = q.feedback[answerKey] || "Thanks for your answer!";
    userAnswers[currentQuestion] = answerText;
    document.getElementById("feedback-screen").textContent = feedback;
    document.getElementById("feedback-screen").style.display = "flex";
    document.getElementById("quiz-container").style.display = "none";
    setTimeout(() => {
    document.getElementById("feedback-screen").style.display = "none";
    currentQuestion++;
    if (currentQuestion < questions.length) {
      document.getElementById("quiz-container").style.display = "block";
      loadQuestion();
    } else {
      showResult();
    }
  }, 10000); // seconds
}
function showResult() {
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("score").textContent = score;
    document.getElementById("result").style.display = "block";
    let output = "";
    questions.forEach((q, i) => {
      output += `Q${i + 1}: ${userAnswers[i] || "Not Answered"}\n`;
    });
    document.getElementById("user-answers-output").textContent = output;
}
fetchQuestions();