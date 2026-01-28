let timerMinutes = 5;
let secondsLeft;
let timerInterval;

const timerBox = document.getElementById("timer-box");
const alarmSound = document.getElementById("alarmSound");

renderTimerTask();

function renderTimerTask() {
  timerBox.innerHTML = `
      <h2 class="tasks-header">${t.timerTitle}</h2>
      <p class="tasks-text">
        ${t.timerIntro}
    <div class="time-intent">
      <p class="tasks-text">
        ${t.timerSelectTime}
      </p>

      <div class="time-value">
        <button id="leftBtn" class="timer-button">&minus;</button>
        <strong><span id="minutes">5</span> ${t.minutes}</strong>
        <button id="rightBtn" class="timer-button">&plus;</button>
      </div>

    </div>
      <button class="task-button" id="startBtn">${t.startTimer}</button>        
  `;
  document.getElementById("rightBtn").addEventListener("click", increment);
  document.getElementById("leftBtn").addEventListener("click", decrement);
  document.getElementById("startBtn").addEventListener("click", startTimer);
  updateMinutes();
}

function renderReflectionForm() {
  timerBox.innerHTML = `
    <h2 class="tasks-header">${t.timerTitle}</h2>
    <div class="reflection-header">
    <p class="tasks-text">
      ${t.timerReflection1} <strong>${timerMinutes} ${t.minutes}</strong> ${t.timerReflection2}
    </p>
    <span class="hint-icon" id="hintIcon">&quest;
    <span class="hint-text" id="hintText">
    ${t.timerHint}
    </span>
  </span>
  </div>
    <form id="timer-form">
      <textarea
        id="antwort-feld-timer"
        maxlength="3000"
        placeholder="${t.placeholder}"
        required></textarea>

      <button class="task-button" type="submit">${t.submitButton}</button>
    </form>
  `;

  document
    .getElementById("timer-form")
    .addEventListener("submit", handleFormSubmit);
}

function updateMinutes() {
  const minutesSpan = document.getElementById("minutes");
  if (minutesSpan) {
    minutesSpan.textContent = timerMinutes;
  }
}

function increment() {
  timerMinutes++;
  updateMinutes();
}

function decrement() {
  if (timerMinutes <= 3) return;
  timerMinutes--;
  updateMinutes();
}

function startTimer() {
  durationMs = timerMinutes * 60 * 1000;
  timerEndTime = Date.now() + durationMs
  disableAllButtons();

  timerBox.innerHTML = `
    <h2 class="tasks-header">${t.timerTitle}</h2>
    <p class="tasks-text">${t.timerRunningInfo}</p>
    <button id="stopBtn" class="stop-button">${t.cancelButton}</button>
  `;

  document.getElementById("stopBtn").addEventListener("click", stopTimer);

  timerInterval = setInterval(checkTimer, 1000);
}

function handleTimerTick() {
  secondsLeft--;

  if (secondsLeft <= 0) {
    finishTimer();
  }
}

function checkTimer() {
  const remaining = timerEndTime - Date.now();

  if (remaining <= 0) {
    finishTimer();
  }
}


function stopTimer() {
  clearInterval(timerInterval);
  renderTimerTask();
}

function finishTimer() {
  clearInterval(timerInterval);
  alarmSound.play();  
  enableAllButtons();
  renderReflectionForm();
}

function disableAllButtons() {
  document.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });
}

function enableAllButtons() {
  document.querySelectorAll("button").forEach((btn) => {
    btn.disabled = false;
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const antwort = document.getElementById("antwort-feld-timer").value;

  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    await supabaseClient.from("user_entries").insert([
      {
        user_id: user.id,
        task_type: "timer",
        timer_minutes: timerMinutes,
        textarea_response: antwort,
      },
    ]);

    showToast("Deine Antwort wurde gespeichert", "success");
    timerBox.innerHTML =
      `<h2 class="placeholder">${t.timerThankYou}</h2>
      <button id="cancelBtnTimer" class="stop-button">${t.backToTask}</button>`
      document.getElementById("cancelBtnTimer").addEventListener("click", stopTimer);


  } catch (error) {
    alert("Fehler: " + error.message);
  }
}
