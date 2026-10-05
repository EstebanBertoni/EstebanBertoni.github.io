/* =========================================================
   PORTFOLIO - INTERACCIONES
   1. Animaciones al hacer scroll (IntersectionObserver)
   2. Formulario de contacto (envío asíncrono con FormSubmit)
========================================================= */

(() => {
    "use strict";

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =========================
       1. SCROLL REVEAL
    ========================= */
    const animatedElements = document.querySelectorAll("[data-animate]");

    // Sin JS avanzado o con movimiento reducido: mostrar todo directamente
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        animatedElements.forEach((el) => el.classList.add("is-visible"));
    } else {
        // Efecto escalonado dentro de cada grupo (proyectos, skills, intereses)
        document.querySelectorAll("[data-animate-group]").forEach((group) => {
            group.querySelectorAll(":scope > [data-animate]").forEach((el, index) => {
                el.style.transitionDelay = `${index * 90}ms`;
            });
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target); // animar solo una vez
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        animatedElements.forEach((el) => observer.observe(el));
    }

    /* =========================
       2. FORMULARIO DE CONTACTO
    ========================= */
    const FORM_ENDPOINT = "https://formsubmit.co/ajax/bertoniesteban@gmail.com";

    const form = document.getElementById("contact-form");

    if (form) {
        const status = form.querySelector(".form-status");
        const submitButton = form.querySelector('button[type="submit"]');

        const showStatus = (message, type) => {
            status.textContent = message;
            status.className = `form-status ${type}`;
            status.hidden = false;
        };

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const data = new FormData(form);

            // Honeypot: si fue rellenado, es un bot -> ignorar en silencio
            if (data.get("_honey")) return;

            const originalText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";
            status.hidden = true;

            try {
                const response = await fetch(FORM_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        nombre: data.get("name"),
                        email: data.get("email"),
                        mensaje: data.get("message"),
                        _subject: "Nuevo mensaje desde el portfolio",
                    }),
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                form.reset();
                showStatus(
                    "Mensaje enviado. ¡Gracias! Te responderé pronto.",
                    "success"
                );
            } catch {
                showStatus(
                    "No se pudo enviar el mensaje. Intentá de nuevo o escribime a bertoniesteban@gmail.com.",
                    "error"
                );
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
})();
