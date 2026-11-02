/* Caja de chat: se abre y se cierra, y envía cada mensaje a /api/chat de mi Worker. */
(function () {
  'use strict';

  var chat = document.getElementById('chat');
  if (!chat) return;

  var toggle = chat.querySelector('.chat-toggle');
  var panel = chat.querySelector('.chat-panel');
  var close = chat.querySelector('.chat-close');
  var log = chat.querySelector('.chat-log');
  var form = chat.querySelector('.chat-form');
  var input = form.elements.message;
  var send = form.querySelector('button[type="submit"]');

  // En el sitio de la clase, el botón de Feedback ocupa la misma esquina: el chat sube encima de él.
  if (document.querySelector('.fb-btn')) chat.classList.add('above-feedback');

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else toggle.focus();
  }

  function addMessage(text, who) {
    var p = document.createElement('p');
    p.className = 'chat-msg ' + who;
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  toggle.addEventListener('click', function () { setOpen(panel.hidden); });
  close.addEventListener('click', function () { setOpen(false); });
  chat.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  // Pase firmado por Cloudflare que cuenta los mensajes de esta conversación (máximo 10).
  var pass = '';
  var ended = false;

  function endConversation() {
    ended = true;
    input.disabled = true;
    send.disabled = true;
    input.placeholder = 'Conversación terminada';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text || ended) return;

    addMessage(text, 'me');
    input.value = '';
    send.disabled = true;

    var body = new FormData();
    body.append('message', text);
    if (pass) body.append('pass', pass);

    fetch(form.action, { method: 'POST', body: body })
      .then(function (response) {
        return response.json().then(function (data) {
          // Los límites (mensaje largo o conversación terminada) traen su propio aviso.
          if (data && data.reply) {
            addMessage(data.reply, response.ok ? 'them' : 'them error');
            if (data.pass) pass = data.pass;
            if (data.ended || data.remaining === 0) endConversation();
            return;
          }
          throw new Error('chat ' + response.status);
        });
      })
      .catch(function () {
        addMessage('Algo salió mal, inténtalo de nuevo', 'them error');
      })
      .then(function () {
        if (ended) return;
        send.disabled = false;
        input.focus();
      });
  });
})();
