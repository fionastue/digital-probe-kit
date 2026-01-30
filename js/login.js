const supabaseUrl = "https://hrswrvqavtkqcrvprrsm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc3dydnFhdnRrcWNydnBycnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTEyOTksImV4cCI6MjA4MDY4NzI5OX0.pTWsDXH8c4MQZE7KoJ1JEyOk0XY_FP5KdMOgzmdDftk";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

function switchToRegister() {  
  const t = TEXT[getLang()];
  const container = document.getElementById("form-container");
  container.innerHTML = `
  <div class="modal" id="modal-datenschutz">
  <div style="background:#fff; padding:20px; max-width:800px; max-height:100vh; overflow:auto; border-radius:8px;">
    <h3>${t.consentTitle}</h3>

    <p style="font-size: large; line-height: 1.6; margin-top: 24px;">${t.consentText}
</p>
    <button class="closeModal" id="closeModal-datenschutz">${t.closeButton}</button>
  </div>
</div>
<h2>${t.register}</h2>
<form id="registerForm">
<label for="reg-email">${t.email}</label>
<input type="email" id="reg-email" placeholder="${t.email}" required />

<label for="reg-password">${t.password}</label>
<input type="password" id="reg-password" placeholder="${t.password}" required />

<label for="reg-password2">${t.repeatPw}</label>
<input type="password" id="reg-password2" placeholder="${t.repeatPw}" required />

<label for="ageSelect">${t.agegroup}:</label>
<select id="ageSelect" name="age" style="max-width: 50%" required>
  <option value="">${t.chooseage}</option>
  <option value="18-25">18-25</option>
  <option value="26-45">26-45</option>
  <option value="46-65">46-65</option>
  <option value="66+">66+</option>
</select>

<p id="datenschutz-link" style="cursor:pointer;
">${t.readConsent}</p>
<div id="checkbox-datenschutz">
<input type="checkbox" name="datenschutz" id="datenschutz" required>
<label for="datenschutz" style="font-size: 1.2rem;">${t.consentCheckbox}
</label>
</div>

<button type="submit">${t.registerNow}</button>
</form>

<div class="switch">
${t.alrAccount} <a href="#" onclick="switchToLogin()">${t.login}</a>
</div>
`;
  attachRegisterHandler(); // Registrierung aktivieren
}

function switchToLogin() {
  const t = TEXT[getLang()];

  const container = document.getElementById("form-container");
  container.innerHTML = `
<h2>${t.login}</h2>
<form id="loginForm">
<label for="login-email">${t.email}</label>
<input type="email" id="login-email" placeholder="${t.email}" required />


<label for="login-password">${t.password}</label>
<input type="password" id="login-password" placeholder="${t.password}" required />

<button type="submit">${t.login}</button>

</form>
<div class="link">
<a href="#reset" id="resetpw">${t.forgot}</a>
</div>
<div class="switch">
${t.noAccount} <a href="#" onclick="switchToRegister()">${t.registerNow}</a>
</div>
`;
  attachLoginHandler(); // Login aktivieren
}

function attachRegisterHandler() {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password");
    const password2 = document.getElementById("reg-password2");
    const ageGroup = document.getElementById("ageSelect").value;

    if (!ageGroup) {
      showToast("Bitte wähle deine Altersgruppe aus.", "error");
    return;
  }
    if (password.value !== password2.value) {
      showToast("Die Passwörter stimmen nicht überein.", "error");
      password.style.borderColor = "red";
      password2.style.borderColor = "red";
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password.value,
    });

    if (error) {
      showToast("Fehler bei der Registrierung.", "error");
      console.error("Sign-Up Error:", error.message);
    } else {
      
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .insert([
          {
            user_id: data.user.id,
            age_group: ageGroup
          }
        ]);

      if(profileError){
        console.error(profileError.message);
      }

      showToast("Registrierung erfolgreich.", "success");
      switchToLogin();
    }
  });

  const link = document.getElementById("datenschutz-link");
  const modal = document.getElementById("modal-datenschutz");
  const close = document.getElementById("closeModal-datenschutz");

  link.addEventListener("click", () => modal.style.display = "flex");
  close.addEventListener("click", () => modal.style.display = "none");

}

function attachLoginHandler() {
  const resetpw = document.getElementById("resetpw");
  resetpw.addEventListener("click", showPasswordform);

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) {
      email.style.borderColor = "red";
      password.style.borderColor = "red";
      showToast(error.message, "error");
    } else {
      window.location.href = "home.html";
    }
  });
}

function showPasswordform() {
  const t = TEXT[getLang()];

  const container = document.getElementById("form-container");
  container.innerHTML = `
<h2>${t.forgot}</h2>
<form id="resetForm">
<label for="reset-email">${t.email}:</label>
<input type="email" id="reset-email" placeholder="${t.email}" required />
<button type="submit">${t.requestNewPassword}</button>

<div class="link">
<a href="#login" onclick="switchToLogin()">${t.backToLogin}</a></div>
</form>
`;
  const form = document.getElementById("resetForm");
  form.addEventListener("submit", sendPwLink);
}

async function sendPwLink(e) {
  const t = TEXT[getLang()];

  e.preventDefault();

  const email = document.getElementById("reset-email").value;

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo:
      "https://fionastue.github.io/digital-probe-kit/update-password.html",
  });

  if (error) {
    showToast("Es ist ein Fehler aufgetreten", "error");
  } else {
    const container = document.getElementById("form-container");
    container.innerHTML = `
            <h2>${t.checkEmail}
            </h2>
            <button onclick="window.location.href = 'index.html';">
            ${t.backToLogin}
            </button>
            `;
  }
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

switchToLogin();
