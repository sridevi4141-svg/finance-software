import {
    db,
    auth
} from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==============================
// SHOW OWNER / STAFF NAME
// ==============================

const welcomeText =
    document.getElementById("welcomeText");


if (welcomeText) {

    // Check Owner
    const ownerData =
        JSON.parse(
            localStorage.getItem("ownerLogin")
        );


    // Check Staff
    const staffData =
        JSON.parse(
            localStorage.getItem("staffLogin")
        );


    if (ownerData && ownerData.name) {

        welcomeText.innerText =
            `Hi ${ownerData.name} 👋`;

    }

    else if (staffData && staffData.name) {

        welcomeText.innerText =
            `Hi ${staffData.name} 👋`;

    }

}


// =====================================
// CHECK USER LOGIN
// =====================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        // User is not logged in
        window.location.href = "auth.html";

    }

});


// =====================================
// OWNER LOGIN
// =====================================

async function ownerLogin() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "owners")
            );


        if (snapshot.empty) {

            // First Time
            window.location.href =
                "owner-register.html";

        } else {

            // Already Account Created
            window.location.href =
                "owner-login.html";

        }

    } catch (error) {

        console.error(
            "Owner Login Error:",
            error
        );

        alert(
            "Unable to check Owner account"
        );

    }

}


// Make function available to HTML
window.ownerLogin = ownerLogin;


// =====================================
// STAFF LOGIN
// =====================================

window.staffLogin = function () {

    window.location.href =
        "staff-login.html";

};