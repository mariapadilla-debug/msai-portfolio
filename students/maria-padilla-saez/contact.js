/* Formulario de contacto: envía sin salir de la página y muestra las gracias en su lugar. */
(function () {
  'use strict';

  var form = document.querySelector('.contact-form');
  if (!form) return;

  var button = form.querySelector('button[type="submit"]');
  var error = form.querySelector('.contact-error');

  function showThanks() {
    var thanks = document.createElement('p');
    thanks.className = 'contact-thanks';
    thanks.setAttribute('role', 'status');
    thanks.setAttribute('tabindex', '-1');
    thanks.textContent = '¡Gracias por escribirme! Recibí tu mensaje y te responderé pronto.';
    form.replaceWith(thanks);
    thanks.focus();
  }

  function showError() {
    error.textContent = 'Algo salió mal, inténtalo de nuevo';
    error.hidden = false;
    button.disabled = false;
    button.textContent = 'Enviar';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Si el casillero trampa viene lleno, es un robot: le mostramos las gracias y no enviamos nada.
    if (form.elements.website.value) {
      showThanks();
      return;
    }

    error.hidden = true;
    button.disabled = true;
    button.textContent = 'Enviando…';

    fetch(form.action, { method: 'POST', body: new FormData(form) })
      .then(function (response) {
        if (response.ok) showThanks();
        else showError();
      })
      .catch(showError);
  });
})();
