// Supabase Setup
const supabaseUrl = "https://hrswrvqavtkqcrvprrsm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc3dydnFhdnRrcWNydnBycnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTEyOTksImV4cCI6MjA4MDY4NzI5OX0.pTWsDXH8c4MQZE7KoJ1JEyOk0XY_FP5KdMOgzmdDftk";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
let currentUser = null;

const dailyBox = document.getElementById("daily-box");

const daily_questions = {
  de: {
    1: {
      text: "Wie organisierst du deinen Alltag? Nutzt du dafür analoge oder digitale Hilfsmittel, zum Beispiel Kalender, To-do-Listen oder Handy-Apps?",
      img: null,
    },
    2: {
      text: "Wann fühlt sich ein Tag für dich „produktiv“ an? Denkst du, deine Sichtweise unterscheidet sich von der von anderen? Wenn ja, inwiefern?",
      img: null,
    },
    3: {
      text: "Bitte lies dir den folgenden Textausschnitt durch. Es handelt sich dabei um einen Auszug aus einem Ratgeber für Studierende, der dabei helfen soll, eine Lebensvision zu entwickeln. Notiere spontan, welche Gedanken oder Gefühle dabei in dir auftauchen.<p id='magazinlink'>Den vollständigen Artikel findest du <a target='_blank' id='magazinurl' href='https://issuu.com/zeitmagazine/docs/heft-pdf_ratgeber_mental_health/32'>hier</a>.</p>",
      img: "assets/img/zeitmagazin2024.jpg",
    },
    4: {
      text: "Bitte sieh dir die beiden abgebildeten Kalender an. Welcher spricht dich eher an? Welche Annahmen verbindest du mit Personen, die ihren Kalender in der jeweiligen Form nutzen?",
      img: "assets/img/kalendervergleich.jpg",
    },
    5: {
      text: "Haben die Fragen und Aufgaben der vergangenen Tage etwas in dir verändert? Ist dir zum Beispiel etwas aufgefallen, was vorher keine Rolle gespielt hat?",
      img: null,
    },
  },

  en: {
    1: {
      text: "How do you organize your daily life? Do you use analog or digital tools such as calendars, to-do lists, or smartphone apps?",
      img: null,
    },
    2: {
      text: "When does a day feel “productive” to you? Do you think your perspective differs from that of others? If so, in what way?",
      img: null,
    },
    3: {
      text: "Please read the following excerpt. It is taken from a guide for students that aims to help develop a life vision. Write down any thoughts or feelings that arise spontaneously while reading.<p id='magazinlink'>You can find the full article <a target='_blank' id='magazinurl' href='https://issuu.com/zeitmagazine/docs/heft-pdf_ratgeber_mental_health/32'>here</a>.</p>",
      img: "assets/img/zeitmagazin2024.jpg",
    },
    4: {
      text: "Please look at the two calendars shown. Which one appeals to you more? What assumptions do you associate with people who use their calendars in these respective ways?",
      img: "assets/img/kalendervergleich.jpg",
    },
    5: {
      text: "Have the questions and tasks of the past days changed anything for you? For example, have you noticed something that did not play a role before?",
      img: null,
    },
  },
};

const short_questions = {
  de: {
    1: "Wie organisierst du deinen Alltag?",
    2: "Wann fühlt sich ein Tag für dich „produktiv“ an?",
    3: "Was denkst du über den Artikel zur Entwicklung der Lebensvision?",
    4: "Welcher Kalender spricht dich eher an?",
    5: "Haben die Fragen und Aufgaben der vergangenen Tage etwas in dir verändert?",
  },
  en: {
    1: "How do you organize your daily life?",
    2: "When does a day feel “productive” to you?",
    3: "What do you think about the article on developing a life vision?",
    4: "Which calendar appeals to you more?",
    5: "Have the questions and tasks of the past days changed anything for you?",
  },
};

let dayCounter = 0;

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", logout);

// Teilnahme beenden
async function teilnahmeBeenden() {
  const modal = document.getElementById("modal-teilnahme");
  const close = document.getElementById("closeModal-teilnahme");

  document
    .getElementById("teilnahmeBtn")
    .addEventListener("click", () => (modal.style.display = "flex"));
  close.addEventListener("click", () => (modal.style.display = "none"));

  const checkboxBenachrichigung = document.getElementById("benachrichtigung");
  document
    .getElementById("teilnahmeBeendenBtn")
    .addEventListener("click", async () => {
      await supabaseClient
        .from("user_profiles")
        .update({ participation_ended: true })
        .eq("user_id", currentUser.id);

      if (checkboxBenachrichigung.checked) {
        await supabaseClient
          .from("user_profiles")
          .update({ is_interested: true, participation_ended: true })
          .eq("user_id", currentUser.id);
      }
      modal.style.display = "none";
      window.location.reload();
    });
}

function showToast(message, type) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.textContent = message;

  container.appendChild(toast);

  // Toast nach 3 Sekunden entfernen
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Prüfen ob User eingeloggt ist

async function checkUser() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "index.html"; // zurück zum Login
    return;
  }
  currentUser = user;
}

(async () => {
  await checkUser();
  await checkWillkommenstext();
  await teilnahmeBeenden();
  await checkTeilnahme();
  await checkDay();
  await loadUserImages();
})();

async function getDiaryEntries() {
  const { data, error } = await supabaseClient
    .from("user_entries")
    .select()
    .eq("user_id", currentUser.id)
    .eq("task_type", "tagebuch")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

async function checkTeilnahme() {
  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("participation_ended")
    .eq("user_id", currentUser.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data.participation_ended == false) {
    return;
  } else {
    const tasksContainer = document.getElementById("tasks");
    tasksContainer.replaceChildren();
    document.getElementById("teilnahmeBtn").remove();
  }
}

async function checkWillkommenstext() {
  const modalwillkommen = document.getElementById("modal-willkommen");
  const closeBtn = document.getElementById("closeModal-willkommen");
  const checkboxWillkommen = document.getElementById("willkommensnachricht");
  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("show_welcometext")
    .eq("user_id", currentUser.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data.show_welcometext == true) {
    modalwillkommen.style.display = "flex";
    closeBtn.addEventListener("click", async () => {
      modalwillkommen.style.display = "none";

      if (checkboxWillkommen.checked) {
        await supabaseClient
          .from("user_profiles")
          .update({ show_welcometext: false })
          .eq("user_id", currentUser.id);
      }
    });
  }
}

async function checkDay() {
  const entries = await getDiaryEntries();

  dayCounter = entries.length + 1;
  let isAlreadyAnswered = false;

  if (entries.length > 0) {
    const today = new Date().toDateString();
    const lastEntryDate = new Date(entries.at(-1).created_at).toDateString();

    isAlreadyAnswered = today === lastEntryDate;
  }

  if (isAlreadyAnswered == false) {
    showDailyTask(dayCounter);
  } else {
    dailyBox.innerHTML = `<h2 class="placeholder">${t.dailyAlreadyDone}</h2>`;
  }

  return { dayCounter, isAlreadyAnswered };
}
const lang = getLang();
const t = TEXT[getLang()];

function showDailyTask(dayCounter) {
  if (dayCounter >= 6) {
    const dailyBox = document.getElementById("daily-box");
    dailyBox?.replaceChildren();
    const successtext = document.createElement("h2");
    successtext.textContent = t.allQuestionsAnswered;
    dailyBox?.appendChild(successtext);
    return;
  }
  dailyBox.innerHTML = `
    <h2 class="tasks-header">${t.day} ${dayCounter}</h2>
    <form id="antwort-form">

      <h3 id="dailyquestion">
      ${t.dailyQuestionTitle}</h3>

    <textarea
      id="daily-feld"
      name="daily-feld"
      placeholder="${t.placeholder}"
      maxlength="1000"
      required
    ></textarea>
    <div style="display: flex; flex-direction: column;">
    <p style="margin:0 auto">${t.addPhotosHint}</p>
    <input type="file" id="upload-files" multiple accept="image/*" />
    </div>
    <h3 id="dailyquestion">
      ${daily_questions[lang][dayCounter].text}
    </h3>
    ${
      daily_questions[lang][dayCounter].img
        ? `<img id="dailyquestion-img"src="${daily_questions[lang][dayCounter].img}" width=75% alt="">`
        : ""
    }
    <textarea
      id="antwort-feld"
      name="antwort-feld"
      placeholder= "${t.placeholder}"
      maxlength="1000"
      required
    ></textarea>
    <button class="task-button" type="submit">Absenden</button>
  </form>`;
  document
    .getElementById("antwort-form")
    .addEventListener("submit", submitEntry);

  if (daily_questions[lang][dayCounter].img !== null) {
    const imgEl = document.getElementById("dailyquestion-img");
    imgEl.addEventListener("click", () => showImage(imgEl));
  }
}

async function uploadFile(file, fileName) {
  const { error } = await supabaseClient.storage
    .from("images")
    .upload(fileName, file);
  if (error) {
    console.log(error);
    throw error;
  }
}

// Formular absenden
async function submitEntry(e) {
  e.preventDefault();

  const diary_antwort = document.getElementById("daily-feld").value;
  const antwort = document.getElementById("antwort-feld").value;
  const fileInput = document.getElementById("upload-files");

  const files = fileInput.files;
  const uploadedFileNames = [];

  if (files.length > 0) {
    const uploadPromises = Array.from(files).map((file) => {
      const fileName = `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
      uploadedFileNames.push(fileName);
      return uploadFile(file, fileName);
    });

    await Promise.all(uploadPromises);
  }

  // Eingaben in Tabelle speichern
  try {
    await supabaseClient.from("user_entries").insert([
      {
        user_id: currentUser.id,
        task_type: "tagebuch",
        textarea_response: diary_antwort,
        image_filename: uploadedFileNames,
      },
      {
        user_id: currentUser.id,
        task_type: `tag${dayCounter}`,
        textarea_response: antwort,
      },
    ]);
    showToast("Deine Antwort wurde gespeichert", "success");
    window.location.reload();
  } catch (error) {
    alert("Fehler: " + error.message);
  }
}

async function loadUserImages() {
  const entries = await getDiaryEntries();
  let counter = 1;

  if (entries.length > 0 && counter <= entries.length) {
    const container = document.getElementById("images-container");

    for (const entry of entries) {
      const card = document.getElementById(`card${counter}`);

      let questionantwort = undefined;

      const { data: antwort } = await supabaseClient
        .from("user_entries")
        .select()
        .eq("user_id", currentUser.id)
        .eq("task_type", `tag${counter}`);
      antwort.length > 0
        ? (questionantwort = antwort[0].textarea_response)
        : (questionantwort = "");

      const comment = document.createElement("p");
      comment.textContent = entry.textarea_response;

      const question_header = document.createElement("h3");
      question_header.textContent = `${short_questions[lang][counter]}`;
      const response = document.createElement("p");
      response.textContent = questionantwort;

      card.appendChild(comment);
      card.appendChild(question_header);
      card.appendChild(response);
      card.style.minWidth = "30%";
      card.style.background = "#ffffff";
      counter++;
    }
  }
}

function showImage(imgEl) {
  if (!imgEl.src) return;

  const overlay = document.createElement("div");
  overlay.classList.add("image-overlay");

  const bigImg = document.createElement("img");
  bigImg.src = imgEl.src;

  overlay.appendChild(bigImg);
  document.body.appendChild(overlay);

  // Klick auf Overlay oder Bild schließt es
  overlay.addEventListener("click", () => {
    overlay.remove();
  });
}
