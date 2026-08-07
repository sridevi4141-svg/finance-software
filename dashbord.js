import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

window.logout = function () {

    localStorage.removeItem("ownerLogin");

    window.location.href = "owner-login.html";

};

window.openDailySheet = function () {

    window.location.href = "staff-daily-sheet.html";

}