let questions = [];
let currentQuestion = 0;
const userResponses = [];
const answerScores = { A: 1, B: 2, C: 3, D: 4, E: 5 };

async function fetchQuestions() {
  try {
    const res = await fetch("/dailyMCQ/questions");
    const data = await res.json();

    if (data.alreadySubmitted) {
      alert("You've already completed today's quiz.");
      window.location.href = "/dashboard";
      return;
    }

    questions = data;
    document.getElementById("loading-screen").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");

    loadQuestion();
  } catch (error) {
    console.error("Error loading questions:", error);
    alert("Failed to load questions. Please try again later.");
  }
}

function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question-title").textContent = `Q${
    currentQuestion + 1
  }: ${q.text}`;
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
  const score = answerScores[answerKey];
  const q = questions[currentQuestion];

  userResponses.push({
    text: q.text,
    options: q.options,
    userAnswer: answerKey,
    userScore: score,
  });

  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    submitToServer();
  }
}

function submitToServer() {
  document.getElementById("quiz-container").classList.add("hidden");

  fetch("/dailyMCQ/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions: userResponses }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.alreadySubmitted) {
        alert(data.message);
        window.location.href = "/dashboard";
      } else {
        document.getElementById("summary-text").textContent = data.summary;
        document.getElementById("result-screen").classList.remove("hidden");
      }
    })
    .catch((err) => {
      console.error("Submit error:", err);
      alert("Error submitting quiz. Please try again.");
    });
}

fetchQuestions();
