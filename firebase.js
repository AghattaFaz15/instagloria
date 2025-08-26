// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getDatabase, ref, push, set, onValue, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyCWq5k87voGQHlRPquvI1P5W1eme32E5f4",
  authDomain: "livro-aghatta.firebaseapp.com",
  databaseURL: "https://livro-aghatta-default-rtdb.firebaseio.com",
  projectId: "livro-aghatta",
  storageBucket: "livro-aghatta.firebasestorage.app",
  messagingSenderId: "491625108244",
  appId: "1:491625108244:web:3afdfda239f9d0904ca801"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

const uid = localStorage.getItem('aghatta_uid') || crypto.randomUUID();
localStorage.setItem('aghatta_uid', uid);

export function fmt(d) {
  return new Date(d).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' });
}

// Função para postar mídia/texto
export async function postMedia(file, author, caption, statusCallback) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const ts = Date.now();
  const storageRef = sref(storage, `posts/${ts}_${uid}.${ext}`);
  const task = uploadBytesResumable(storageRef, file, { contentType:file.type });

  task.on('state_changed', snap => {
    const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
    if (statusCallback) statusCallback(`Enviando… ${pct}%`);
  });

  await task;
  const url = await getDownloadURL(storageRef);
  const postRef = push(ref(db,'posts'));
  await set(postRef,{
    id: postRef.key,
    author,
    caption,
    url,
    type: file.type.startsWith('video/')?'video':'image',
    createdAt: Date.now(),
    likes:0
  });
  if (statusCallback) statusCallback('Publicado!');
}

// Observar feed em tempo real
export function observeFeed(renderCallback) {
  onValue(query(ref(db,'posts'), limitToLast(200)), snap => {
    const data = snap.val()||{};
    const posts = Object.values(data).sort((a,b)=>b.createdAt-a.createdAt);
    renderCallback(posts);
  });
}

// Função para curtir
export function likePost(id) {
  if(localStorage.getItem('like_'+id)==='1') return;
  localStorage.setItem('like_'+id,'1');
  const postRef = ref(db, `posts/${id}`);
  onValue(postRef, snap=>{
    const v = snap.val();
    if(!v) return;
    set(postRef, {...v, likes:(v.likes||0)+1});
  }, {onlyOnce:true});
}
