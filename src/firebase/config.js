import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD8Xh78SRdU3wgy0ZbK0Ps3VHznmnaBxXA",
  authDomain: "cabanas-del-salado.firebaseapp.com",
  projectId: "cabanas-del-salado",
  storageBucket: "cabanas-del-salado.firebasestorage.app",
  messagingSenderId: "334751122356",
  appId: "1:334751122356:web:1f0f9db24da09d27fa68e1"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
