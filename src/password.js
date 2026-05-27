const PASSWORD = "0120";
const AUTH_KEY = "movieiguess_auth";

function logoutMovieIGuess() {
    localStorage.removeItem(AUTH_KEY);
    window.location.replace("password.html");
}

window.logoutMovieIGuess = logoutMovieIGuess;

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem(AUTH_KEY) === "true") {
        window.location.replace("index.html");
        return;
    }

    const input = document.getElementById("passwordInput");
    const submitButton = document.getElementById("passwordSubmit");
    const errorMessage = document.getElementById("passwordError");
    const toggleButton = document.getElementById("passwordToggle");
    const toggleIcon = toggleButton?.querySelector("i");

    if (!input || !submitButton || !errorMessage || !toggleButton || !toggleIcon) {
        return;
    }

    input.focus();

    function hideError() {
        errorMessage.style.display = "none";
    }

    function showError() {
        errorMessage.style.display = "block";
        input.classList.remove("shake");
        void input.offsetWidth;
        input.classList.add("shake");

        window.setTimeout(() => {
            input.classList.remove("shake");
        }, 400);

        input.value = "";
        input.focus();
    }

    function submitPassword() {
        const value = input.value.trim();

        if (value === PASSWORD) {
            localStorage.setItem(AUTH_KEY, "true");
            window.location.replace("index.html");
            return;
        }

        showError();
    }

    toggleButton.addEventListener("click", () => {
        const isPasswordHidden = input.type === "password";

        input.type = isPasswordHidden ? "text" : "password";
        toggleIcon.classList.toggle("fa-eye", !isPasswordHidden);
        toggleIcon.classList.toggle("fa-eye-slash", isPasswordHidden);
        toggleButton.setAttribute("aria-label", isPasswordHidden ? "Hide password" : "Show password");
        input.focus();
    });

    input.addEventListener("input", hideError);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            submitPassword();
        }
    });

    submitButton.addEventListener("click", submitPassword);
});

export { logoutMovieIGuess };
