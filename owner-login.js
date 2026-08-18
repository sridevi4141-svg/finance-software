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

        // =================================================
        // 1. FIRST CHECK OLD OWNERS COLLECTION
        // =================================================

        const ownerQuery = query(
            collection(db, "owners"),
            where("username", "==", username)
        );

        const ownerSnapshot =
            await getDocs(ownerQuery);


        if (!ownerSnapshot.empty) {

            const owner =
                ownerSnapshot.docs[0].data();


            // Check password
            if (
                !owner.password ||
                String(owner.password) !== String(password)
            ) {

                alert("Incorrect Password");

                return;
            }


            // Save login
            localStorage.setItem(
                "ownerLogin",
                JSON.stringify({

                    name: owner.name || "",

                    username: owner.username || ""

                })
            );


            alert("Login Success");


            window.location.href =
                "owner-dashboard.html";

            return;
        }


        // =================================================
        // 2. CHECK NEW ACCOUNT REQUESTS
        // =================================================

        const requestQuery = query(
            collection(db, "accountRequests"),
            where("username", "==", username)
        );


        const requestSnapshot =
            await getDocs(requestQuery);


        // Username not found anywhere
        if (requestSnapshot.empty) {

            alert("Username not found");

            return;
        }


        const account =
            requestSnapshot.docs[0].data();


        // =================================================
        // 3. CHECK ACCOUNT STATUS
        // =================================================

        if (account.status === "Pending Approval") {

            alert(
                "⏳ Your account is waiting for Boss approval."
            );

            return;
        }


        if (account.status === "Rejected") {

            alert(
                "❌ Your account has been rejected."
            );

            return;
        }


        if (account.status !== "Approved") {

            alert(
                "Your account is not approved yet."
            );

            return;
        }


        // =================================================
        // 4. CHECK PASSWORD
        // =================================================

        if (
            !account.password ||
            String(account.password) !== String(password)
        ) {

            alert("Incorrect Password");

            return;
        }


        // =================================================
        // 5. LOGIN SUCCESS
        // =================================================

        localStorage.setItem(
            "ownerLogin",
            JSON.stringify({

                name: account.name || "",

                username: account.username || ""

            })
        );


        alert("Login Success");


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


// Make function available to HTML
window.loginOwner =
    loginOwner;