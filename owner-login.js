import { db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


async function loginOwner() {

    const usernameInput =
        document.getElementById("loginUsername");

    const passwordInput =
        document.getElementById("loginPassword");


    if (!usernameInput || !passwordInput) {

        alert("Login fields not found");

        return;
    }


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();


    if (!username || !password) {

        alert("Please enter Username and Password");

        return;
    }


    try {

        // Search owner by username
        const q = query(
            collection(db, "owners"),
            where("username", "==", username)
        );


        const querySnapshot =
            await getDocs(q);


        // Username not found
        if (querySnapshot.empty) {

            alert("Username not found");

            return;
        }


        // Get owner data
        const owner =
            querySnapshot.docs[0].data();


        // Check password
        if (
            !owner.password ||
            String(owner.password) !== String(password)
        ) {

            alert("Incorrect Password");

            return;
        }


        // Save logged-in owner
        localStorage.setItem(
            "ownerLogin",
            JSON.stringify({

                name: owner.name || "",

                username: owner.username || ""

            })
        );


        alert("Login Success");


        // Go to home page
        window.location.href =
            "owner-dashboard.html";


    } catch (error) {

        console.error(
            "Owner Login Error:",
            error
        );

        alert(
            "Login Failed: " +
            error.message
        );

    }

}


window.loginOwner =
    loginOwner;