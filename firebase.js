// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWq5k87voGQHlRPquvI1P5W1eme32E5f4",
  authDomain: "livro-aghatta.firebaseapp.com",
  databaseURL: "https://livro-aghatta-default-rtdb.firebaseio.com",
  projectId: "livro-aghatta",
  storageBucket: "livro-aghatta.appspot.com",
  messagingSenderId: "491625108244",
  appId: "1:491625108244:web:3afdfda239f9d0904ca801"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
