/* =========================================================
   PORTFOLIO - FUNCIONALIDAD CON JAVASCRIPT

   Los textos y la estructura viven en index.html. Acá solo
   están los datos que se dibujan dinámicamente (proyectos y
   filtros), los eventos, la validación, el almacenamiento y
   la API del clima.
========================================================= */

(() => {
    "use strict";

    /* =========================
       DATOS DINÁMICOS
    ========================= */

    // Unidad 9: cada proyecto es una instancia con datos y comportamiento propio.
    class Proyecto {
        constructor({ destacado, tipo, nombre, descripcion, imagen, alt, ancho, alto, arquitectura = [], tecnologias }) {
            this.destacado = destacado;
            this.tipo = tipo;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.imagen = imagen;
            this.alt = alt;
            this.ancho = ancho;
            this.alto = alto;
            this.arquitectura = arquitectura;
            this.tecnologias = tecnologias;
        }

        // Unidad 5: some() y strings normalizados para filtrar sin importar mayúsculas.
        coincideCon(filtro) {
            if (filtro === "Todos") return true;

            const etiquetas = [this.tipo, ...this.tecnologias, ...this.arquitectura];
            const texto = filtro.toLowerCase();
            return etiquetas.some((etiqueta) => etiqueta.toLowerCase().includes(texto));
        }

        describir() {
            return `${this.nombre} · ${this.tecnologias.length} tecnologías`;
        }
    }

    const proyectos = [
        new Proyecto({
            destacado: true,
            tipo: "PROYECTO DESTACADO",
            nombre: "Estación Meteorológica IoT",
            descripcion:
                "Estación meteorológica de bajo costo capaz de recopilar variables ambientales, almacenar información localmente, transmitir datos y utilizar modelos de aprendizaje automático para realizar predicciones microclimáticas.",
            imagen: "assets/img/meteorologica.jpg",
            alt: "Estación meteorológica IoT desarrollada con ESP32",
            ancho: 800,
            alto: 500,
            arquitectura: ["ESP32", "SENSORES", "MQTT", "PYTHON", "SQL", "IA"],
            tecnologias: ["ESP32", "BME280", "MQTT", "Python", "Pandas", "XGBoost", "SQL"]
        }),
        new Proyecto({
            destacado: false,
            tipo: "IoT / AUTOMATIZACIÓN",
            nombre: "Sistema Domótico Inteligente",
            descripcion:
                "Sistema orientado al control y automatización de dispositivos mediante microcontroladores, sensores y una interfaz de control.",
            imagen: "assets/img/domotica.jpg",
            alt: "Sistema domótico inteligente basado en ESP32",
            ancho: 600,
            alto: 400,
            tecnologias: ["ESP32", "Arduino", "MQTT", "HTTP"]
        }),
        new Proyecto({
            destacado: false,
            tipo: "IoT / SEGURIDAD",
            nombre: "Sistema de Seguridad IoT",
            descripcion:
                "Sistema basado en sensores y dispositivos conectados para detectar eventos y permitir la supervisión de un entorno.",
            imagen: "assets/img/seguridad-iot.jpg",
            alt: "Sistema de seguridad IoT basado en sensores",
            ancho: 600,
            alto: 400,
            tecnologias: ["ESP32", "Sensores", "IoT", "Web"]
        })
    ];

    const filtrosProyectos = [
        { etiqueta: "Todos", valor: "Todos" },
        { etiqueta: "ESP32", valor: "ESP32" },
        { etiqueta: "MQTT", valor: "MQTT" },
        { etiqueta: "Python", valor: "Python" },
        { etiqueta: "IoT", valor: "IoT" },
        { etiqueta: "IA", valor: "IA" }
    ];

    // Reglas de validación. Los mensajes están en el HTML, dentro de cada #error-*.
    const reglasValidacion = [
        { campo: "name", esValido: (valor) => valor.trim().length >= 3 },
        { campo: "email", esValido: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) },
        { campo: "message", esValido: (valor) => valor.trim().length > 0 }
    ];

    /* =========================
       CONSTANTES Y ESTADO
    ========================= */

    const CLAVE_TEMA = "portfolio-tema";
    const CLAVE_BORRADOR = "portfolio-borrador-contacto";
    const FORM_ENDPOINT = "https://formsubmit.co/ajax/bertoniesteban@gmail.com";
    const URL_CLIMA =
        "https://api.open-meteo.com/v1/forecast?latitude=-31.25&longitude=-61.49&current=temperature_2m&timezone=America%2FArgentina%2FCordoba";

    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observadorDeScroll = null;

    /* =========================
       UTILIDADES
    ========================= */

    const crearElemento = (etiqueta, clase, texto) => {
        const elemento = document.createElement(etiqueta);
        if (clase) elemento.className = clase;
        if (texto !== undefined) elemento.textContent = texto;
        return elemento;
    };

    const marcarAnimable = (elemento) => {
        elemento.dataset.animate = "";
        return elemento;
    };

    const guardarEnLocalStorage = (clave, valor) => {
        try {
            localStorage.setItem(clave, valor);
        } catch (error) {
            // Modo privado o almacenamiento lleno: la página sigue funcionando.
        }
    };

    const observarElementos = () => {
        if (observadorDeScroll) {
            document.querySelectorAll("[data-animate]:not(.is-visible)").forEach((elemento) => {
                observadorDeScroll.observe(elemento);
            });
        }
    };

    /* =========================
       PROYECTOS: DIBUJAR EL ARRAY
    ========================= */

    const crearImagen = (proyecto, clase) => {
        const imagen = crearElemento("img", clase);
        imagen.src = proyecto.imagen;
        imagen.alt = proyecto.alt;
        imagen.width = proyecto.ancho;
        imagen.height = proyecto.alto;
        imagen.loading = "lazy";
        imagen.decoding = "async";
        return imagen;
    };

    const crearEtiquetas = (tecnologias) => {
        const contenedor = crearElemento("div", "tags");
        tecnologias.forEach((tecnologia) => {
            contenedor.append(crearElemento("span", "", tecnologia));
        });
        return contenedor;
    };

    const crearProyectoDestacado = (proyecto) => {
        const articulo = marcarAnimable(crearElemento("article", "featured-project"));
        articulo.title = proyecto.describir();

        const imagenContenedor = crearElemento("div", "project-image");
        imagenContenedor.append(crearImagen(proyecto, ""));

        const contenido = crearElemento("div", "project-content");
        contenido.append(
            crearElemento("span", "project-type", proyecto.tipo),
            crearElemento("h3", "", proyecto.nombre),
            crearElemento("p", "", proyecto.descripcion)
        );

        const arquitectura = crearElemento("div", "architecture");
        proyecto.arquitectura.forEach((etapa, indice) => {
            if (indice > 0) arquitectura.append(crearElemento("span", "arch-arrow", "→"));
            arquitectura.append(crearElemento("span", "", etapa));
        });
        contenido.append(arquitectura, crearEtiquetas(proyecto.tecnologias));

        articulo.append(imagenContenedor, contenido);
        return articulo;
    };

    const crearTarjetaProyecto = (proyecto) => {
        const articulo = marcarAnimable(crearElemento("article", "project-card"));
        articulo.title = proyecto.describir();

        const imagenContenedor = crearElemento("div", "project-card-image");
        imagenContenedor.append(crearImagen(proyecto, ""));

        const contenido = crearElemento("div", "project-card-content");
        contenido.append(
            crearElemento("span", "project-type", proyecto.tipo),
            crearElemento("h3", "", proyecto.nombre),
            crearElemento("p", "", proyecto.descripcion),
            crearEtiquetas(proyecto.tecnologias)
        );

        articulo.append(imagenContenedor, contenido);
        return articulo;
    };

    const renderizarProyectos = (filtro = "Todos") => {
        const destacados = document.getElementById("featured-project");
        const grilla = document.getElementById("projects-grid");
        const sinResultados = document.getElementById("no-results");
        if (!destacados || !grilla) return;

        // sort() modifica el array original: se ordena una copia (Unidad 5).
        const visibles = [...proyectos]
            .filter((proyecto) => proyecto.coincideCon(filtro))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

        destacados.replaceChildren();
        grilla.replaceChildren();

        visibles.forEach((proyecto) => {
            const tarjeta = proyecto.destacado
                ? crearProyectoDestacado(proyecto)
                : crearTarjetaProyecto(proyecto);
            (proyecto.destacado ? destacados : grilla).append(tarjeta);
        });

        if (sinResultados) sinResultados.hidden = visibles.length > 0;
        observarElementos();
    };

    // Unidad 5: reduce() acumula un valor a partir del array de proyectos.
    const renderizarResumenProyectos = () => {
        const resumen = document.getElementById("project-summary");
        if (!resumen) return;

        const totalTecnologias = proyectos.reduce(
            (total, proyecto) => total + proyecto.tecnologias.length,
            0
        );
        resumen.textContent = `${proyectos.length} proyectos · ${totalTecnologias} tecnologías`;
    };

    const renderizarFiltros = () => {
        const contenedor = document.getElementById("project-filters");
        if (!contenedor) return;

        filtrosProyectos.forEach((filtro) => {
            const boton = crearElemento("button", "chip", filtro.etiqueta);
            boton.type = "button";
            boton.dataset.filtro = filtro.valor;
            boton.setAttribute("aria-pressed", String(filtro.valor === "Todos"));
            if (filtro.valor === "Todos") boton.classList.add("activo");
            contenedor.append(boton);
        });
    };

    const inicializarFiltros = () => {
        const contenedor = document.getElementById("project-filters");
        if (!contenedor) return;

        // Delegación de eventos: un solo listener para todos los botones.
        contenedor.addEventListener("click", (event) => {
            const boton = event.target.closest("button[data-filtro]");
            if (!boton) return;

            contenedor.querySelectorAll(".chip").forEach((chip) => {
                const activo = chip === boton;
                chip.classList.toggle("activo", activo);
                chip.setAttribute("aria-pressed", String(activo));
            });

            renderizarProyectos(boton.dataset.filtro);
        });
    };

    /* =========================
       MENÚ MÓVIL Y TEMA
    ========================= */

    const inicializarMenuMovil = () => {
        const boton = document.getElementById("menu-toggle");
        const enlaces = document.getElementById("nav-links");
        if (!boton || !enlaces) return;

        const cerrarMenu = () => {
            enlaces.classList.remove("is-open");
            boton.setAttribute("aria-expanded", "false");
            boton.setAttribute("aria-label", "Abrir menú");
        };

        boton.addEventListener("click", () => {
            const abierto = enlaces.classList.toggle("is-open");
            boton.setAttribute("aria-expanded", String(abierto));
            boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
        });

        enlaces.addEventListener("click", (event) => {
            if (event.target.closest("a")) cerrarMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") cerrarMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 850) cerrarMenu();
        });
    };

    const aplicarTema = (tema, guardar = true) => {
        const esClaro = tema === "claro";
        const boton = document.getElementById("theme-toggle");
        const icono = document.getElementById("theme-icon");

        document.documentElement.classList.toggle("tema-claro", esClaro);

        if (boton) {
            boton.setAttribute("aria-label", esClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
            boton.setAttribute("aria-pressed", String(esClaro));
        }
        if (icono) icono.textContent = esClaro ? "☀" : "☾";

        if (guardar) guardarEnLocalStorage(CLAVE_TEMA, esClaro ? "claro" : "oscuro");
    };

    const inicializarTema = () => {
        const boton = document.getElementById("theme-toggle");
        if (!boton) return;

        const temaGuardado = (() => {
            try {
                return localStorage.getItem(CLAVE_TEMA);
            } catch (error) {
                return null;
            }
        })();

        aplicarTema(temaGuardado === "claro" ? "claro" : "oscuro", false);

        boton.addEventListener("click", () => {
            const esClaro = document.documentElement.classList.contains("tema-claro");
            aplicarTema(esClaro ? "oscuro" : "claro");
        });
    };

    /* =========================
       FORMULARIO: VALIDAR Y ENVIAR
    ========================= */

    const validarCampo = (regla) => {
        const campo = document.getElementById(regla.campo);
        const mensajeError = document.getElementById(`error-${regla.campo}`);
        if (!campo) return true;

        const esValido = regla.esValido(campo.value);

        // El texto del error ya está en el HTML; acá solo se muestra u oculta.
        if (mensajeError) mensajeError.hidden = esValido;

        campo.classList.toggle("invalido", !esValido);
        campo.setAttribute("aria-invalid", String(!esValido));
        return esValido;
    };

    const validarFormulario = () => {
        const resultados = reglasValidacion.map(validarCampo);
        const primerInvalido = reglasValidacion.find((regla) => {
            const campo = document.getElementById(regla.campo);
            return campo && campo.classList.contains("invalido");
        });
        if (primerInvalido) document.getElementById(primerInvalido.campo).focus();
        return resultados.every(Boolean);
    };

    const guardarBorrador = (form) => {
        const datos = new FormData(form);
        guardarEnLocalStorage(CLAVE_BORRADOR, JSON.stringify({
            name: datos.get("name") || "",
            email: datos.get("email") || "",
            message: datos.get("message") || ""
        }));
    };

    const restaurarBorrador = () => {
        try {
            const guardado = localStorage.getItem(CLAVE_BORRADOR);
            if (!guardado) return;

            const borrador = JSON.parse(guardado);
            if (!borrador || typeof borrador !== "object") return;

            reglasValidacion.forEach((regla) => {
                const campo = document.getElementById(regla.campo);
                if (campo && typeof borrador[regla.campo] === "string") {
                    campo.value = borrador[regla.campo];
                }
            });
        } catch (error) {
            // Borrador corrupto: se ignora y el formulario arranca vacío.
        }
    };

    const borrarBorrador = () => {
        try {
            localStorage.removeItem(CLAVE_BORRADOR);
        } catch (error) {
            // Nada que hacer si localStorage no está disponible.
        }
    };

    const inicializarFormulario = () => {
        const form = document.getElementById("contact-form");
        if (!form) return;

        const estado = form.querySelector(".form-status");
        const botonEnviar = form.querySelector('button[type="submit"]');

        restaurarBorrador();

        const mostrarEstado = (mensaje, tipo) => {
            if (!estado) return;
            estado.textContent = mensaje;
            estado.className = `form-status ${tipo}`;
            estado.hidden = false;
        };

        // Al escribir, se guarda el borrador y se corrige el error si ya se mostró.
        reglasValidacion.forEach((regla) => {
            const campo = document.getElementById(regla.campo);
            if (!campo) return;

            campo.addEventListener("input", () => {
                guardarBorrador(form);
                if (campo.classList.contains("invalido")) validarCampo(regla);
                if (estado && !estado.hidden) estado.hidden = true;
            });

            campo.addEventListener("blur", () => validarCampo(regla));
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const datos = new FormData(form);

            // Honeypot: si fue rellenado, es un bot -> ignorar en silencio.
            if (datos.get("_honey")) return;

            if (!validarFormulario()) {
                mostrarEstado("Revisá los campos marcados.", "error");
                return;
            }

            const textoOriginal = botonEnviar.textContent;
            botonEnviar.disabled = true;
            botonEnviar.textContent = "Enviando...";
            if (estado) estado.hidden = true;

            try {
                const respuesta = await fetch(FORM_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        nombre: datos.get("name"),
                        email: datos.get("email"),
                        mensaje: datos.get("message"),
                        _subject: "Nuevo mensaje desde el portfolio"
                    })
                });

                if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

                form.reset();
                borrarBorrador();
                mostrarEstado("Mensaje enviado. ¡Gracias! Te responderé pronto.", "success");
            } catch (error) {
                mostrarEstado(
                    "No se pudo enviar el mensaje. Intentá de nuevo o escribime a bertoniesteban@gmail.com.",
                    "error"
                );
            } finally {
                botonEnviar.disabled = false;
                botonEnviar.textContent = textoOriginal;
            }
        });
    };

    /* =========================
       API: CLIMA ACTUAL (FETCH)
    ========================= */

    const cargarClima = async () => {
        const contenedor = document.getElementById("weather");
        if (!contenedor) return;

        const valor = contenedor.querySelector(".weather-value");
        if (!valor) return;

        const actualizado = document.getElementById("weather-updated");

        valor.className = "weather-value cargando";
        valor.textContent = "Cargando clima...";
        if (actualizado) actualizado.textContent = "";

        try {
            const respuesta = await fetch(URL_CLIMA);
            if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

            const datos = await respuesta.json();
            const temperatura = datos?.current?.temperature_2m;
            if (typeof temperatura !== "number") throw new Error("Respuesta inesperada");

            // Unidad 5: Date + formato en castellano para la hora de actualización.
            const hora = new Date().toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            valor.className = "weather-value";
            valor.textContent = `${Math.round(temperatura)} °C ahora`;
            if (actualizado) actualizado.textContent = `Actualizado ${hora}`;
        } catch (error) {
            valor.className = "weather-value error";
            valor.textContent = "Clima no disponible";
            if (actualizado) actualizado.textContent = "";
        }
    };

    /* =========================
       ANIMACIONES AL HACER SCROLL
    ========================= */

    const inicializarAnimaciones = () => {
        const elementos = document.querySelectorAll("[data-animate]");

        if (reducirMovimiento || !("IntersectionObserver" in window)) {
            elementos.forEach((elemento) => elemento.classList.add("is-visible"));
            return;
        }

        document.querySelectorAll("[data-animate-group]").forEach((grupo) => {
            grupo.querySelectorAll(":scope > [data-animate]").forEach((elemento, indice) => {
                elemento.style.transitionDelay = `${indice * 90}ms`;
            });
        });

        observadorDeScroll = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("is-visible");
                        observadorDeScroll.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        observarElementos();
    };

    /* =========================
       INICIO
    ========================= */

    renderizarFiltros();
    renderizarProyectos();
    renderizarResumenProyectos();
    inicializarTema();
    inicializarMenuMovil();
    inicializarFiltros();
    inicializarFormulario();
    inicializarAnimaciones();
    cargarClima();
})();
