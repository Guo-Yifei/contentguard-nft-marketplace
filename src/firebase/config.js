import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAjdLnwWxBHoYCkB_sjz4mgAEXOh6Iyuy0",
  authDomain: "nftmarketlite.firebaseapp.com",
  projectId: "nftmarketlite",
  storageBucket: "nftmarketlite.firebasestorage.app",
  messagingSenderId: "81978989441",
  appId: "1:81978989441:web:53f39e3fe4fe19d9cf6680"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 