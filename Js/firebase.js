import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

export { db, ref, push, set, get, remove, onValue };
