/* New Age Professional Services — interactividad v2 */
(function(){
  "use strict";

  /* ---------- cupones (configuración de Lester) ---------- */
  var CUPONES = {
    "BIENVENIDA10": {
      descripcion: "10% de descuento en tu instalación",
      enlaces: {
        "lanzamiento": "https://buy.stripe.com/6oU00k7M60vndQh6151gs00",
        "profesional": "https://buy.stripe.com/4gMeVe0jE3Hz3bDgFJ1gs01"
      }
    }
  };
  var input = document.getElementById("coupon-input"),
      applyBtn = document.getElementById("coupon-apply"),
      msg = document.getElementById("coupon-msg"),
      removeBtn = document.getElementById("coupon-remove");
  if (input) {
    var originales = {};
    document.querySelectorAll("a.pay[data-plan]").forEach(function(a){ originales[a.dataset.plan] = a.href; });
    function aplicar(){
      var codigo = input.value.trim().toUpperCase(), cupon = CUPONES[codigo];
      if (!cupon) { msg.textContent = "Ese código no es válido. Revísalo e intenta de nuevo."; msg.className = "coupon-msg err"; return; }
      var n = 0;
      document.querySelectorAll("a.pay[data-plan]").forEach(function(a){
        var link = cupon.enlaces[a.dataset.plan];
        if (link) { a.href = link; n++; }
      });
      if (!n) { msg.textContent = "Ese cupón no aplica a estos planes."; msg.className = "coupon-msg err"; return; }
      msg.textContent = "¡Cupón aplicado! " + cupon.descripcion + "."; msg.className = "coupon-msg ok";
      removeBtn.style.display = "inline-block"; applyBtn.disabled = true; input.disabled = true;
    }
    function quitar(){
      document.querySelectorAll("a.pay[data-plan]").forEach(function(a){ a.href = originales[a.dataset.plan]; });
      input.value = ""; input.disabled = false; applyBtn.disabled = false;
      msg.textContent = ""; msg.className = "coupon-msg"; removeBtn.style.display = "none";
    }
    applyBtn.addEventListener("click", aplicar);
    removeBtn.addEventListener("click", quitar);
    input.addEventListener("keydown", function(e){ if (e.key === "Enter") aplicar(); });
  }

  /* ---------- FAQ acordeón ---------- */
  document.querySelectorAll(".faq-item").forEach(function(item){
    var q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
    q.addEventListener("click", function(){
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){
        o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- filtro de demos por región ---------- */
  var fbtns = document.querySelectorAll(".filters button");
  fbtns.forEach(function(b){
    b.addEventListener("click", function(){
      fbtns.forEach(function(x){ x.classList.remove("on"); });
      b.classList.add("on");
      var f = b.dataset.filter;
      document.querySelectorAll(".demo-grid .demo").forEach(function(d){
        d.classList.toggle("hide", f !== "all" && d.dataset.region !== f);
      });
    });
  });

  /* ---------- reveal al hacer scroll ---------- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });

  /* ---------- ocultar sticky CTA cerca del CTA final ---------- */
  var sticky = document.querySelector(".sticky-cta"), final = document.getElementById("diagnostico");
  if (sticky && final && "IntersectionObserver" in window) {
    new IntersectionObserver(function(es){
      sticky.style.opacity = es[0].isIntersecting ? "0" : "1";
      sticky.style.pointerEvents = es[0].isIntersecting ? "none" : "auto";
    }, { threshold: 0.15 }).observe(final);
  }
})();
