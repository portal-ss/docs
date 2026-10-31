// Copies each API method's badge (GET, POST, …) from its endpoint line into
// the matching entry of the page's table of contents.
function decorateApiToc() {
  document.querySelectorAll(".md-typeset .api-endpoint").forEach(function (endpoint) {
    var heading = endpoint.previousElementSibling;
    var badge = endpoint.querySelector(".api-method");
    if (!heading || !heading.id || !badge) return;
    document.querySelectorAll('.md-nav--secondary a.md-nav__link[href="#' + heading.id + '"]').forEach(function (link) {
      if (link.querySelector(".api-method")) return;
      link.insertBefore(badge.cloneNode(true), link.firstChild);
      link.classList.add("api-toc-link");
    });
  });
}

if (window.document$) {
  window.document$.subscribe(decorateApiToc);
} else {
  decorateApiToc();
}
