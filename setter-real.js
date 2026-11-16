/* Setter web de New Age — motor de conversación (preview local).
   En el preview las respuestas son por reglas con los datos oficiales de la casa.
   En producción este mismo flujo lo alimenta el servicio de IA; la agenda real
   y el aviso a Lester se conectan al publicar. Nada sale de esta página aquí. */
(function () {
  "use strict";
  var panel = document.getElementById("setter-panel");
  var burbuja = document.getElementById("setter-burbuja");
  var mensajes = document.getElementById("setter-mensajes");
  var form = document.getElementById("setter-form");
  var input = document.getElementById("setter-input");
  if (!panel || !burbuja || !mensajes || !form || !input) return;

  var API = window.SETTER_API_BASE || "";
  var slots = ["Mañana · 10:00 AM", "Mañana · 4:00 PM"];
  var lead = { giro: "", ciudad: "", situacion: "", cita: "", nombre: "", telefono: "" };
  var etapa = "inicio"; // inicio | giro | ciudad | situacion | cita | nombre | telefono | fin
  var iniciado = false;

  function abrir() {
    panel.classList.add("abierto");
    burbuja.style.display = "none";
    if (!iniciado) {
      iniciado = true; saludar();
      try {
        fetch(API + "/api/horarios").then(function (r) { return r.json(); }).then(function (d) {
          if (d && d.horarios && d.horarios.length >= 2) slots = d.horarios.slice(0, 2).map(function (h) { return h.etiqueta; });
        }).catch(function () {});
      } catch (e) {}
    }
    input.focus();
  }
  function cerrar() {
    panel.classList.remove("abierto");
    burbuja.style.display = "flex";
    burbuja.focus();
  }
  burbuja.addEventListener("click", abrir);
  document.getElementById("setter-cerrar").addEventListener("click", cerrar);

  function msg(texto, quien) {
    var d = document.createElement("div");
    d.className = "setter-msg " + quien;
    d.innerHTML = texto;
    mensajes.appendChild(d);
    mensajes.scrollTop = mensajes.scrollHeight;
    return d;
  }
  function chips(opciones) {
    var c = document.createElement("div");
    c.className = "setter-chips";
    opciones.forEach(function (op) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "setter-chip" + (op.coral ? " corales" : "");
      b.textContent = op.texto;
      b.addEventListener("click", function () {
        c.remove();
        responder(op.texto, op.accion);
      });
      c.appendChild(b);
    });
    mensajes.appendChild(c);
    mensajes.scrollTop = mensajes.scrollHeight;
  }
  function bot(texto, despues) {
    var d = msg("…", "bot");
    setTimeout(function () {
      d.innerHTML = texto;
      mensajes.scrollTop = mensajes.scrollHeight;
      if (despues) despues();
    }, 450);
  }

  function saludar() {
    bot("Hola, soy el asistente de <strong>New Age Professional Services</strong>. Te respondo preguntas sobre páginas web y sistemas para negocios latinos, y si te sirve, te agendo una llamada corta con Lester, que es quien atiende a cada cliente personalmente.", function () {
      chips([
        { texto: "¿Cuánto cuesta una página?", accion: "faq_precios" },
        { texto: "Quiero una cita con Lester", accion: "iniciar_cita" },
        { texto: "¿Qué negocios ya tienen su página?", accion: "faq_prueba" }
      ]);
    });
  }

  var FAQ = {
    precios: "Las páginas parten de estos planes oficiales: <strong>Básico $499 + $69/mes</strong> · <strong>Profesional $699 + $89/mes</strong> · <strong>Sin Entrada $0 hoy + $149/mes por 12 meses</strong>. Si tu negocio usa además un sistema (pedidos, tienda, citas), hay combos: por ejemplo página + MesaReady por <strong>$1,000 + $150/mes</strong>. El número exacto depende de tu giro — eso lo define Lester en una llamada corta, sin compromiso.",
    restaurante: "Para restaurantes trabajamos la página junto con <strong>MesaReady</strong> ($499 + $89/mes): menú en línea, pedidos para recoger, catering y víveres, sin pagar comisión a las plataformas por cada orden. El combo página + MesaReady sale en <strong>$1,000 + $150/mes</strong>.",
    tienda: "Para agencias multiservicios y tiendas está <strong>PuntoReady</strong> ($699 + $89/mes): tienda en línea, envíos, caja del día y módulos por licencia. El combo página + PuntoReady sale en <strong>$1,100 + $150/mes</strong>.",
    citas: "Para barberías, salones y negocios por cita está <strong>CitasPro</strong>: reservas en línea, fila de espera para los que llegan sin cita y recordatorios. En la cita, Lester te dice qué plan te conviene según tu caso.",
    tiempo: "Una página típica queda lista en <strong>1 a 2 semanas</strong> desde que nos entregas tu información (logo, menú o servicios y fotos). En la llamada, Lester te confirma el plazo exacto de tu caso antes de firmar nada.",
    prueba: "Ya trabajan con nosotros, entre otros: <strong>La Semilla Bakery, Taquería La Leyenda, Willi Barbershop, Maya Travel Company y Botánica Cuatro Caminos</strong>. Arriba, en la sección Portafolio de esta misma página, puedes ver sus demos y páginas en vivo."
  };

  function detectarFAQ(t) {
    t = t.toLowerCase();
    if (/precio|cuesta|cuánto|costo|plan(es)?\b/.test(t)) return FAQ.precios;
    if (/restaurant|comida|menú|menu|catering|taquer/.test(t) && etapa === "inicio") return FAQ.restaurante;
    if (/tienda|agencia|env[ií]o|multiservicio/.test(t) && etapa === "inicio") return FAQ.tienda;
    if (/barber|sal[oó]n|cita|reserva|fila/.test(t) && etapa === "inicio") return FAQ.citas;
    if (/demora|tarda|tiempo|cuándo est|cuando est/.test(t)) return FAQ.tiempo;
    if (/ejemplo|portafolio|prueba|clientes|quién|quien/.test(t)) return FAQ.prueba;
    return null;
  }

  function ofrecerCita() {
    etapa = "cita";
    bot("Con eso Lester ya llega preparado a tu llamada. Te propongo uno de estos dos momentos:", function () {
      chips([
        { texto: slots[0], accion: "slot" },
        { texto: slots[1], accion: "slot" },
        { texto: "Prefiero por WhatsApp", accion: "whatsapp", coral: true }
      ]);
    });
  }
  function iniciarCalificacion() {
    etapa = "giro";
    bot("Perfecto. Para agendarte bien son tres preguntas cortas. <strong>¿Qué tipo de negocio tienes?</strong> (por ejemplo: restaurante, barbería, tienda, agencia…) ");
  }

  function responder(texto, accion) {
    msg(texto.replace(/</g, "&lt;"), "user");
    if (accion === "faq_precios") { bot(FAQ.precios, function () { chips([{ texto: "Quiero una cita con Lester", accion: "iniciar_cita" }, { texto: "Ver ejemplos reales", accion: "faq_prueba" }]); }); return; }
    if (accion === "faq_prueba") { bot(FAQ.prueba, function () { chips([{ texto: "Quiero una cita con Lester", accion: "iniciar_cita" }]); }); return; }
    if (accion === "iniciar_cita") { iniciarCalificacion(); return; }
    if (accion === "whatsapp") {
      etapa = "fin";
      bot('Claro: escríbele directo a Lester por <a href="https://wa.me/18132353313" target="_blank" rel="noopener"><strong>WhatsApp (813) 235-3313</strong></a>. Si prefieres, déjame tu número aquí y él te escribe.');
      return;
    }
    if (accion === "slot") {
      lead.cita = texto;
      etapa = "nombre";
      bot("Anotado: <strong>" + texto + "</strong>. ¿A nombre de quién queda la cita? (tu nombre y el de tu negocio)");
      return;
    }

    var faq = detectarFAQ(texto);
    if (faq && etapa === "inicio") {
      bot(faq, function () { chips([{ texto: "Quiero una cita con Lester", accion: "iniciar_cita" }]); });
      return;
    }
    if (etapa === "inicio" && API) {
      var d = msg("…", "bot");
      fetch(API + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensaje: texto, historial: [] }) })
        .then(function (r) { return r.json(); })
        .then(function (salida) {
          d.innerHTML = (salida && salida.texto) ? salida.texto : "Te ayudo con eso en la llamada corta con Lester.";
          chips([{ texto: "Quiero una cita con Lester", accion: "iniciar_cita" }, { texto: "Prefiero por WhatsApp", accion: "whatsapp", coral: true }]);
        })
        .catch(function () {
          d.innerHTML = "Ahora mismo no pude consultar eso. Te agendo la llamada corta con Lester y te responde él directamente.";
          chips([{ texto: "Quiero una cita con Lester", accion: "iniciar_cita" }]);
        });
      return;
    }

    if (etapa === "giro") {
      lead.giro = texto;
      etapa = "ciudad";
      bot("¿En qué <strong>ciudad</strong> está tu negocio?");
    } else if (etapa === "ciudad") {
      lead.ciudad = texto;
      etapa = "situacion";
      bot("Última: hoy, ¿cómo te encuentran tus clientes en internet?", function () {
        chips([
          { texto: "No tengo página", accion: "situacion" },
          { texto: "Tengo, pero no me vende", accion: "situacion" },
          { texto: "Solo redes / plataformas", accion: "situacion" },
          { texto: "Me va bien, quiero mejorar", accion: "situacion" }
        ]);
      });
    } else if (etapa === "situacion" || accion === "situacion") {
      lead.situacion = texto;
      ofrecerCita();
    } else if (etapa === "nombre") {
      lead.nombre = texto;
      etapa = "telefono";
      bot("¿Y tu <strong>WhatsApp</strong>? Lester te confirma la cita por ahí el mismo día.");
    } else if (etapa === "telefono") {
      if (texto.replace(/\D/g, "").length < 7) {
        bot("Ese número se ve incompleto — ¿me lo repites con código de área?");
        return;
      }
      lead.telefono = texto;
      etapa = "fin";
      try { localStorage.setItem("setter-lead", JSON.stringify(lead)); } catch (e) {}
      var confirmar = function (folio) {
        bot("<strong>Tu cita quedó pedida</strong> ✅" + (folio ? " (folio " + folio + ")" : "") + "<br>• " + lead.nombre + "<br>• Negocio: " + lead.giro + " — " + lead.ciudad + "<br>• Llamada con Lester: <strong>" + lead.cita + "</strong><br>• Confirmación a tu WhatsApp: " + lead.telefono + "<br><br>Lester recibe tu resumen al instante y te confirma hoy mismo, con recordatorio antes de la llamada.");
      };
      if (API) {
        fetch(API + "/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: lead.nombre, giro: lead.giro, ciudad: lead.ciudad, situacion: lead.situacion, cita: lead.cita, whatsapp: lead.telefono }) })
          .then(function (r) { return r.json(); })
          .then(function (d) { confirmar(d && d.folio ? d.folio : ""); })
          .catch(function () { confirmar(""); });
      } else { confirmar(""); }
    } else {
      bot("Te leo. Si quieres, te agendo la llamada corta con Lester para darte respuesta exacta a tu caso.", function () {
        chips([{ texto: "Quiero una cita con Lester", accion: "iniciar_cita" }, { texto: "Prefiero por WhatsApp", accion: "whatsapp", coral: true }]);
      });
      etapa = "inicio";
    }
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    responder(v, null);
  });
})();
