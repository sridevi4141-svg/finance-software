import {
    auth,
    db
} from "./firebase-config.js";


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const message =
    document.getElementById("message");


// =====================================
// SHOW MESSAGE
// =====================================

function showMessage(
    text,
    color = "red"
) {

    message.innerText = text;

    message.style.color = color;

}


// =====================================
// SHOW SIGN UP
// =====================================

window.showSignup = function () {

    document
        .getElementById("loginBox")
        .classList.add("hidden");

    document
        .getElementById("signupBox")
        .classList.remove("hidden");

    message.innerText = "";

};


// =====================================
// SHOW LOGIN
// =====================================

window.showLogin = function () {

    document
        .getElementById("signupBox")
        .classList.add("hidden");

    document
        .getElementById("loginBox")
        .classList.remove("hidden");

    message.innerText = "";

};


// =====================================
// CREATE INTERNAL EMAIL
// =====================================

function createInternalEmail(username) {

    return username
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._-]/g, "")
        + "@financeapp.local";

}


// =====================================
// SIGN UP
// =====================================

window.signupUser = async function () {

    const name =
        document
        .getElementById("signupName")
        .value
        .trim();


    const username =
        document
        .getElementById("signupUsername")
        .value
        .trim()
        .toLowerCase();


    const password =
        document
        .getElementById("signupPassword")
        .value;


    const confirmPassword =
        document
        .getElementById("signupConfirmPassword")
        .value;


    // =================================
    // VALIDATION
    // =================================

    if (
        !name ||
        !username ||
        !password ||
        !confirmPassword
    ) {

        showMessage(
            "Please fill all details"
        );

        return;

    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match"
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters"
        );

        return;

    }


    if (username.length < 3) {

        showMessage(
            "Username must be at least 3 characters"
        );

        return;

    }


    try {

        // =================================
        // CHECK USERNAME ALREADY EXISTS
        // =================================

        const usernameQuery =
            query(
                collection(db, "users"),
                where(
                    "username",
                    "==",
                    username
                )
            );


        const usernameSnapshot =
            await getDocs(usernameQuery);


        if (!usernameSnapshot.empty) {

            showMessage(
                "Username already exists"
            );

            return;

        }


        // =================================
        // INTERNAL EMAIL
        // =================================

        const internalEmail =
            createInternalEmail(username);


        // =================================
        // FIREBASE AUTH ACCOUNT
        // =================================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );


        const user =
            userCredential.user;


        // =================================
        // SAVE NAME
        // =================================

        await updateProfile(
            user,
            {
                displayName: name
            }
        );


        // =================================
        // SAVE USER DATA
        // =================================

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {

                uid: user.uid,

                name: name,

                username: username,

                createdAt: new Date()

            }
        );


        showMessage(
            "Account Created Successfully ✅",
            "green"
        );


        setTimeout(() => {

            window.location.href =
                "main.html";

        }, 1000);


    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            showMessage(
                "Username already exists"
            );

        }

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            showMessage(
                "Password is too weak"
            );

        }

        else {

            showMessage(
                "Account creation failed"
            );

        }

    }

};


// =====================================
// LOGIN
// =====================================

window.loginUser = async function () {

    const username =
        document
        .getElementById("loginUsername")
        .value
        .trim()
        .toLowerCase();


    const password =
        document
        .getElementById("loginPassword")
        .value;


    if (!username || !password) {

        showMessage(
            "Please enter username and password"
        );

        return;

    }


    try {

        // =================================
        // FIND USER BY USERNAME
        // =================================

        const usernameQuery =
            query(
                collection(db, "users"),
                where(
                    "username",
                    "==",
                    username
                )
            );


        const usernameSnapshot =
            await getDocs(usernameQuery);


        if (usernameSnapshot.empty) {

            showMessage(
                "Username not found"
            );

            return;

        }


        // =================================
        // CREATE SAME INTERNAL EMAIL
        // =================================

        const internalEmail =
            createInternalEmail(username);


        // =================================
        // FIREBASE LOGIN
        // =================================

        await signInWithEmailAndPassword(
            auth,
            internalEmail,
            password
        );


        showMessage(
            "Login Successful ✅",
            "green"
        );


        setTimeout(() => {

            window.location.href = "main.html";

        }, 500);


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        showMessage(
            "Invalid username or password"
        );

    }

};


// =====================================
// CHECK LOGIN
// =====================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "User logged in:",
                user.uid
            );

        }

    }
);