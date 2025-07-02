let questions = [];
let currentQuestion = 0;

const userAnswers = {};
const answerScores = { A: 1, B: 2, C: 3, D: 4, E: 5 };

const traitTracker = {};
const traitScores = {};
async function fetchQuestions() {
  const res = await fetch("/quiz/questions");
  questions = await res.json();
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question-title").textContent = `Q${
    currentQuestion + 1
  }: ${q.question}`;
  document.getElementById("labelA").textContent = q.options.A;
  document.getElementById("labelB").textContent = q.options.B;
  document.getElementById("labelC").textContent = q.options.C;
  document.getElementById("labelD").textContent = q.options.D;
  document.getElementById("labelE").textContent = q.options.E;
  document
    .querySelectorAll('input[name="option"]')
    .forEach((el) => (el.checked = false));
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

    // Check if all questions are done
    if (currentQuestion < questions.length) {
      document.getElementById("quiz-container").style.display = "block";
      loadQuestion();
    } else {
      try {
        showResult();
      } catch (err) {
        console.error("Error in showResult():", err);
      }
    }
  }, 2000);
}
function showResult() {
  const resultScreen = document.getElementById("result-screen");
  const traitContainer = document.getElementById("trait-progress-bars");
  traitContainer.innerHTML = "";

  for (const trait in traitTracker) {
    const { total, count } = traitTracker[trait];
    const score = parseFloat(((total / (count * 5)) * 100).toFixed(1));
    traitScores[trait] = score;

    let color = "bg-danger";
    if (score >= 70) color = "bg-success";
    else if (score >= 50) color = "bg-warning";

    const progress = document.createElement("div");
    progress.className = "col-12 mb-3";
    progress.innerHTML = `
      <h5>${trait}</h5>
      <div class="progress">
        <div class="progress-bar ${color} progress-bar-striped progress-bar-animated"
             style="width: ${score}%" role="progressbar"
             aria-valuenow="${score}" aria-valuemin="0" aria-valuemax="100">
          ${score}%
        </div>
      </div>
    `;
    traitContainer.appendChild(progress);
  }

  // Show result screen, hide quiz and feedback
  document.getElementById("quiz-container").classList.add("hidden");
  document.getElementById("feedback-screen").classList.add("hidden");
  document.getElementById("result-screen").style.display = "block";

  // Save result to DB
  fetch("/quiz/submit-scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traitScores }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Scores saved");

      return fetch("/quiz/analyze-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traitScores }),
      });
    })
    .then((res) => res.json())
    .then((data) => {
      console.log("Gemini analysis complete");
    })
    .catch((err) => {
      console.error("Error saving result or Gemini analysis:", err);
    });
}

fetchQuestions();
