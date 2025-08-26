// posts.js
import { db, storage } from './firebase.js';
import { ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const feedContainer = document.getElementById('feed');

function carregarFeed() {
  onValue(ref(db, 'posts'), snapshot => {
    if(!feedContainer) return;
    feedContainer.innerHTML = '';
    snapshot.forEach(child => {
      const data = child.val();
      const postKey = child.key;

      const div = document.createElement('div');
      div.classList.add('post');

      let html = `<strong class='gold'>${data.nome}</strong> - <small>${new Date(data.timestamp).toLocaleString()}</small><br>`;
      if(data.legenda) html += `<p>${data.legenda}</p>`;
      if(data.url) html += `<img src='${data.url}' alt='Foto' />`;
      html += `<div class='acoes'>
                <button onclick="curtir('${postKey}', ${data.likes})">❤️ ${data.likes}</button>
                <button onclick="toggleComentarios('${postKey}')">💬 ${data.comments ? Object.keys(data.comments).length : 0}</button>
              </div>`;
      html += `<div id='comentarios-${postKey}' class='comentarios' style='display:none;'>
                <input type='text' id='input-${postKey}' placeholder='Escreva um comentário...' />
                <button onclick="comentar('${postKey}')">Comentar</button>
                <div id='lista-comentarios-${postKey}'></div>
              </div>`;

      div.innerHTML = html;
      feedContainer.appendChild(div);

      const lista = document.getElementById(`lista-comentarios-${postKey}`);
      if(data.comments) {
        lista.innerHTML = '';
        Object.values(data.comments).forEach(c => {
          const p = document.createElement('p');
          p.innerHTML = `<strong class='gold'>${c.nome}</strong>: ${c.texto}`;
          lista.appendChild(p);
        });
      }
    });
  });
}
carregarFeed();

window.postar = function(mural=false) {
  const nome = localStorage.getItem('nome');
  const legenda = document.getElementById('legenda').value.trim();
  const arquivo = document.getElementById('arquivo') ? document.getElementById('arquivo').files[0] : null;

  if(!nome || !legenda) return alert('Nome e mensagem obrigatórios.');

  if(arquivo && !mural) {
    const storageRef = sRef(storage, 'fotos/' + arquivo.name);
    const uploadTask = uploadBytesResumable(storageRef, arquivo);

    uploadTask.on('state_changed',
      snapshot => {},
      error => alert('Erro no upload: ' + error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          push(ref(db, 'posts'), { nome, legenda, url, likes: 0, comments: {}, timestamp: Date.now() });
          document.getElementById('arquivo').value = '';
          document.getElementById('legenda').value = '';
        });
      }
    );
  } else {
    push(ref(db, 'posts'), { nome, legenda, url: '', likes: 0, comments: {}, timestamp: Date.now() });
    document.getElementById('legenda').value = '';
  }
};

window.curtir = function(key, likes) {
  update(ref(db, 'posts/' + key), { likes: likes + 1 });
};

window.toggleComentarios = function(key) {
  const div = document.getElementById(`comentarios-${key}`);
  div.style.display = div.style.display === 'none' ? 'block' : 'none';
};

window.comentar = function(key) {
  const input = document.getElementById(`input-${key}`);
  const texto = input.value.trim();
  const nome = localStorage.getItem('nome');
  if(!nome || !texto) return alert('Informe seu nome e comentário.');
  const commentRef = ref(db, `posts/${key}/comments`);
  push(commentRef, { nome, texto });
  input.value = '';
};
