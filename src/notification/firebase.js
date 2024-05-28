// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCOiB3RSqoSg_Nx2qqDDdWxpPc3EsOFl1E",
  authDomain: "fir-c-88365.firebaseapp.com",
  projectId: "fir-c-88365",
  storageBucket: "fir-c-88365.appspot.com",
  messagingSenderId: "125676895537",
  appId: "1:125676895537:web:c7240434b366463aafc410",
  measurementId: "G-F68JXSNRJ5"
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission);
  if(permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "BNsbson2S0tdQzXSScW_wyk0g0uh5mlqiTnznbqbHQf8uiZ8o-miOO0ep6Sm1H_M0AUqDAyMsp8a_QneitPQYRw"
    });
    return token;
  }
}