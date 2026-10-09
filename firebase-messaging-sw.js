importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js","https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
firebase.initializeApp({apiKey:"",authDomain:"",projectId:"",messagingSenderId:"",appId:""}); // نفس بيانات index.html + messagingSenderId
firebase.messaging();
