/* New Age Professional System — interactividad v2 */
(function(){
  "use strict";

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
      /* Un grupo del portafolio (clientes / demos) se oculta si el filtro lo deja vacío */
      document.querySelectorAll(".portafolio-grupo").forEach(function(g){
        var visibles = g.querySelectorAll(".demo:not(.hide)").length;
        g.style.display = visibles ? "" : "none";
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
