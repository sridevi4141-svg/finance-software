import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Login Staff
const staff =
JSON.parse(localStorage.getItem("staffLogin"));


// Today's Date
const today =
new Date().toISOString().split("T")[0];


// Set Date
document.getElementById("todayDate").value =
today;


// Set Staff Name
document.getElementById("staffName").value =
staff.name || staff.username;


// Totals
let totalLoan = 0;
let totalCollection = 0;

async function loadTodayLoan(){

    totalLoan = 0;

    const q = query(

        collection(db,"dailyLoans"),

        where("staffUser","==",staff.username),

        where("date","==",today)

    );

    const snap = await getDocs(q);

    snap.forEach((doc)=>{

        totalLoan += Number(
            doc.data().loanAmount || 0
        );

    });

    document.getElementById("totalLoan").innerHTML =
    "₹ " + totalLoan;

}


async function loadTodayCollection(){

    totalCollection = 0;

    const q = query(

        collection(db,"payments"),

        where("staffUser","==",staff.username)

    );

    const snap = await getDocs(q);

    snap.forEach((doc)=>{

        const data = doc.data();

        if(data.paymentDate){

            const paymentDate =

            new Date(

                data.paymentDate.seconds

                ? data.paymentDate.seconds*1000

                : data.paymentDate

            ).toISOString().split("T")[0];

            if(paymentDate == today){

                totalCollection +=
                Number(data.amount || 0);

            }

        }

    });

    document.getElementById("totalCollection").innerHTML =
    "₹ " + totalCollection;

}

// ===============================
// Closing Cash
// ===============================

function calculateClosing() {

    const openingCash = Number(
        document.getElementById("openingCash").value
    ) || 0;

    const expenses = Number(
        document.getElementById("expenses").value
    ) || 0;

    const closingCash =
        openingCash +
        totalCollection -
        expenses;

    document.getElementById("closingCash").innerHTML =
        "₹ " + closingCash;

}

// Auto Calculate
document.getElementById("openingCash")
.addEventListener("input", calculateClosing);

document.getElementById("expenses")
.addEventListener("input", calculateClosing);


// ===============================
// Save Daily Sheet
// ===============================

window.saveDailySheet = async function () {

    const openingCash = Number(
        document.getElementById("openingCash").value
    ) || 0;

    const expenses = Number(
        document.getElementById("expenses").value
    ) || 0;

    const notes =
        document.getElementById("notes").value;

    const closingCash =
        openingCash +
        totalCollection -
        expenses;

    try {

        await addDoc(
            collection(db, "dailySheets"),
            {
                date: today,
                staffUser: staff.username,
                staffName: staff.name || staff.username,

                openingCash: openingCash,

                totalLoan: totalLoan,

                totalCollection: totalCollection,

                expenses: expenses,

                closingCash: closingCash,

                notes: notes,

                status: "Completed",

                createdAt: new Date()
            }
        );

        alert("✅ Daily Sheet Saved Successfully");

    } catch (error) {

        console.log(error);

        alert("❌ Save Failed");

    }

};


// ===============================
// Page Load
// ===============================

async function initPage() {

    await loadTodayLoan();

    await loadTodayCollection();

    calculateClosing();

}

initPage();