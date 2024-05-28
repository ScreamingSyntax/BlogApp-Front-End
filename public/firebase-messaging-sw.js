
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');


firebase.initializeApp({
    apiKey: "AIzaSyCOiB3RSqoSg_Nx2qqDDdWxpPc3EsOFl1E",
    authDomain: "fir-c-88365.firebaseapp.com",
    projectId: "fir-c-88365",
    storageBucket: "fir-c-88365.appspot.com",
    messagingSenderId: "125676895537",
    appId: "1:125676895537:web:c7240434b366463aafc410",
    measurementId: "G-F68JXSNRJ5"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image,
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });