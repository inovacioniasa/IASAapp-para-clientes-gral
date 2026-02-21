// Inicialización modular de Firebase (CDN + ES modules)
// Importa los módulos que necesites desde la CDN de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Configuración proporcionada
const firebaseConfig = {
  apiKey: "AIzaSyC1MCK9VdWl9hMeiKEejTCEc_PFmXb6UHo",
  authDomain: "clientes-webapp.firebaseapp.com",
  projectId: "clientes-webapp",
  storageBucket: "clientes-webapp.firebasestorage.app",
  messagingSenderId: "374827219611",
  appId: "1:374827219611:web:a48b99f48ac466714a643e",
  measurementId: "G-DLNMD18Z5C"
};
// Inicializa la app
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

// Analytics puede fallar en entornos no compatibles (p.ej. archivos locales sin servidor)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (err) {
  console.warn('Firebase Analytics no disponible:', err?.message || err);
}

// Exporta objetos para usar en otros scripts (Auth, Firestore, Storage, etc.)
export { app, analytics, db };

// Autenticación
const auth = getAuth(app);
auth.languageCode = 'es';
const googleProvider = new GoogleAuthProvider();

/**
 * Inicia sesión con Google mediante un popup.
 * Retorna la promesa de Firebase (puedes usar .then/.catch o async/await).
 */
function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Cierra la sesión del usuario actual.
 */
function signOutUser() {
  return signOut(auth);
}

export { auth, googleProvider, signInWithGoogle, signOutUser };

/*
  Uso:
  - En tu `index.html` incluir: <script type="module" src="firebase.js"></script>
  - En otros módulos JS puedes importar: import { app } from './firebase.js'

  Ejemplos rápidos:
  - Autenticación:
    import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
    const auth = getAuth(app);

  - Firestore:
    import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
    const db = getFirestore(app);

  Nota: Si piensas usar esto desde archivos locales (file://), algunos módulos pueden dar problemas.
  Ejecuta un servidor local (p.ej. `npx http-server` o usar `server.js` del proyecto) para evitar restricciones.
*/
