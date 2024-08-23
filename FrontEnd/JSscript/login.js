const baseApiUrl = "http://localhost:5678/api/";


// Vérifier si l'utilisateur est connecté
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token");
  const loginLink = document.getElementById("loginLink");
  
  // Ajouter le style CSS via JavaScript
  const style = document.createElement('style');
  style.textContent = `
      .admin-only {
          display: none;
      }
  `;
  if (token) {
    loginLink.textContent = "Logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      window.location.replace("index.html");
    });
    // Afficher les éléments spécifiques à l'administrateur
    const adminElements = document.querySelectorAll(".admin-only");
    adminElements.forEach(element => {
        element.style.display = "block";
    });
  }
});

document.addEventListener("submit", (e) => {
  e.preventDefault();
  let form = {
    email: document.getElementById("username"),  // Correspond à l'ID "username" dans le HTML
    password: document.getElementById("password"),
  };

  fetch(`${baseApiUrl}users/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: form.email.value,
      password: form.password.value,
    }),
  }).then((response) => {
    if (response.status !== 200) {
      alert("Erreur dans l'identifiant ou le mot de passe");
    } else {
      response.json().then((data) => {
        sessionStorage.setItem("token", data.token); // Sauvegarder le TOKEN
        window.location.replace("index.html");
      });
    }
  });
});
