let questions = [];
let currentQuestion = 0;

const userAnswers = {};
const answerScores = { A: 1, B: 2, C: 3, D: 4, E: 5 };

const traitTracker = {};

const traitScores = {}; 
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
  document.getElementById("labelE").textContent = q.options.E;
  document.querySelectorAll('input[name="option"]').forEach(el => el.checked = false);
}

function submitAnswer() {
  const selected = document.querySelector('input[name="option"]:checked');
  if (!selected) return alert("Please select an answer.");

  const answerKey = selected.value;
  const q = questions[currentQuestion];
  const answerText = q.options[answerKey];
  const trait = q.trait;
  const score = answerScores[answerKey];

  userAnswers[q.question] = answerText;

  if (!traitTracker[trait]) traitTracker[trait] = { total: 0, count: 0 };
  traitTracker[trait].total += score;
  traitTracker[trait].count++;


  const feedback = q.feedback?.[answerKey] || "Answer recorded!";
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
  }, 1000);
}
function showResult() {
  // Calculate trait percentages
  for (const trait in traitTracker) {
    const { total, count } = traitTracker[trait];
    traitScores[trait] = parseFloat(((total / (count * 5)) * 100).toFixed(1));
  }

  // Display result screen
  document.getElementById("quiz-container")?.classList.add("hidden");
  document.getElementById("feedback-screen")?.classList.add("hidden");

  const resultScreen = document.getElementById("result-screen");
  resultScreen.style.display = "block";

  const scoreText = Object.entries(traitScores)
    .map(([trait, score]) => `${trait}: ${score}%`)
    .join(" | ");
  document.getElementById("score").textContent = `Your Score: ${scoreText}`;

  let output = "";
  questions.forEach((q, i) => {
    output += `Q${i + 1}: ${userAnswers[q.question] || "Not Answered"}\n`;
  });
  document.getElementById("user-answers-output").textContent = output;

  console.log("Final traitScores:", traitScores);

  // Send traitScores to server
  fetch('/quiz/submit-scores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ traitScores })
  })
  .then(res => res.json())
  .then(data => console.log("Saved to DB:", data))
  .catch(err => console.error("Save error:", err));
}


fetchQuestions()