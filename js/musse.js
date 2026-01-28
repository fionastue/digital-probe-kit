


renderMusseTask();

function renderMusseTask() {
  const t = TEXT[getLang()];

  const musseBox = document.getElementById("musse-box");
  musseBox.innerHTML = `
    <h2 class="tasks-header">${t.musseTitle}</h2>
    <p class="tasks-text" id="musse-text">
    ${t.musseIntro}
  </p>
  <button class="task-button" id="musseBtn">${t.musseButton}</button>
  `

  document.getElementById("musseBtn").addEventListener("click", openMusseForm);
}

function openMusseForm() {
  const musseBox = document.getElementById("musse-box");
  musseBox.innerHTML = `
        <h2 class="tasks-header">${t.musseTitle}</h2>
        <div class="reflection-header">
          <p class="tasks-text" id="musse-text">${t.musseWritePrompt}</p>
              <span class="hint-icon" id="hintIcon">&quest;
    <span class="hint-text" id="hintText">
    ${t.musseHint}
    </span>
  </span>
        </div>
        <form id="musse-form">
        <textarea 
          name="antwort-feld-musse" 
          id="antwort-feld-musse" 
          maxlength="3000" 
          placeholder="${t.placeholder}"
          required></textarea>
        <button class="task-button" type="submit">${t.submitButton}</button>
        </form>
      <button id="cancelBtn" class="stop-button">${t.backToTask}</button>
        `;

    document
    .getElementById("musse-form")
    .addEventListener("submit", handleMusseFormSubmit);
    document.getElementById("cancelBtn").addEventListener("click", renderMusseTask);
}


async function handleMusseFormSubmit(e) {
  e.preventDefault();
  const antwort = document.getElementById("antwort-feld-musse").value;
  const musseBox = document.getElementById("musse-box")

  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    await supabaseClient.from("user_entries").insert([
      {
        user_id: user.id,
        task_type: "musse",
        textarea_response: antwort,
      },
    ]);

    showToast("Deine Antwort wurde gespeichert", "success");
    const modal = document.getElementById("modal-figal")
    modal.style.display = "flex"
    document.getElementById("closeModal-figal").addEventListener("click", () => (modal.style.display = "none"));


    musseBox.innerHTML =
      `<h2 class="placeholder">${t.musseThankYou}</h2>
        <button id="cancelBtn" class="stop-button">${t.backToTask}</button>
      `
      document.getElementById("cancelBtn").addEventListener("click", renderMusseTask);

  } catch (error) {
    alert("Fehler: " + error.message);
  }
}
