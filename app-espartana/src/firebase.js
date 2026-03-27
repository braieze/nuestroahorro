// Importamos las funciones base de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Importamos Firestore (Base de datos) y Auth (Usuarios)
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Tu configuración (La llave de tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBxqbxw8m5ubivDWLWMZbTJlAny2UtXCAk",
  authDomain: "nuestroahorro-90419.firebaseapp.com",
  projectId: "nuestroahorro-90419",
  storageBucket: "nuestroahorro-90419.firebasestorage.app",
  messagingSenderId: "906905152270",
  appId: "1:906905152270:web:83431c0021b51dd282c55f",
  measurementId: "G-6N4R692JLM"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ¡CLAVE! Exportamos "db" y "auth" para usarlos en toda la app
export const db = getFirestore(app);
export const auth = getAuth(app);