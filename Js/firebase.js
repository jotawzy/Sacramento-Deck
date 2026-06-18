import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Suas credenciais oficiais do projeto sacramentodeck
const firebaseConfig = {
  apiKey: "AIzaSyBhiu_SiuNtirF7cXQJ3Mq3vdg22mPyQa4",
  authDomain: "sacramentodeck.firebaseapp.com",
  databaseURL: "https://sacramentodeck-default-rtdb.firebaseio.com",
  projectId: "sacramentodeck",
  storageBucket: "sacramentodeck.firebasestorage.app",
  messagingSenderId: "481102144008",
  appId: "1:481102144008:web:511094f2ed27a2e41e27bd"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, onValue };
