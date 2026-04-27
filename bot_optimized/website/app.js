const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const subject = encodeURIComponent("Solicitare SwingBot Pro");
    const body = encodeURIComponent(
      `Nume: ${name}\nEmail: ${email}\n\nMesaj:\n${message}`
    );

    // Inlocuieste adresa cu emailul tau de vanzari.
    window.location.href = `mailto:vanzari@exemplu.com?subject=${subject}&body=${body}`;

    if (formMessage) {
      formMessage.textContent =
        "Se deschide clientul tau de email. Daca nu se deschide, trimite direct la vanzari@exemplu.com.";
    }
  });
}
