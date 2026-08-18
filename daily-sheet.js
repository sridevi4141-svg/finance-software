import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Today's Date
const today = new Date().toISOString().split("T")[0];

document.getElementById("todayDate").value = today;


// Staff Details
const params = new URLSearchParams(window.location.search);

const selectedStaff = params.get("staff");

const loginStaff =
JSON.parse(localStorage.getItem("staffLogin"));

const staffUser = selectedStaff || loginStaff.username;

document.getElementById("staffName").value =
staffUser;


// Totals
let todayCollection = 0;

let totalLoan = 0;



// ==============================
// Today's Loan
// ==============================

async function loadTodayLoans(){

    const tbody =
    document.getElementById("loanTableBody");

    tbody.innerHTML = "";

    totalLoan = 0;

    let sno = 1;

    const q = query(

        collection(db,"dailyLoans"),

        where("staffUser","==",staffUser),

        where("date","==",today)

    );

    const snap = await getDocs(q);

    snap.forEach((docSnap)=>{

        const data = docSnap.data();

        totalLoan += Number(data.loanAmount || 0);

        tbody.innerHTML += `

        <tr>

            <td>${sno++}</td>

            <td>${data.customerName}</td>

            <td>₹ ${data.loanAmount}</td>

        </tr>

        `;

    });

    document.getElementById("totalLoan").innerHTML =
    "₹ " + totalLoan;

}



// ==============================
// Today's Collection
// ==============================

async function loadTodayCollection(){

    const tbody =
    document.getElementById("collectionTableBody");

    tbody.innerHTML = "";

    todayCollection = 0;

    let sno = 1;

    const q = query(

        collection(db,"payments"),

        where("staffUser","==",staffUser)

    );

    const snap = await getDocs(q);

    for(const docSnap of snap.docs){

        const data = docSnap.data();

        let paymentDate = "";

        if(data.paymentDate.seconds){

            paymentDate =
            new Date(
                data.paymentDate.seconds * 1000
            ).toISOString().split("T")[0];

        }else{

            paymentDate =
            new Date(
                data.paymentDate
            ).toISOString().split("T")[0];

        }

        if(paymentDate == today){

            todayCollection +=
            Number(data.amount || 0);

            let customerName = "";

            if(data.customerId){

                const customerSnap =
                await getDoc(
                    doc(db,"customers",data.customerId)
                );

                if(customerSnap.exists()){

                    customerName =
                    customerSnap.data().customerName;

                }

            }

            tbody.innerHTML += `

            <tr>

                <td>${sno++}</td>

                <td>${customerName}</td>

                <td>₹ ${data.amount}</td>

            </tr>

            `;

        }

    }

    document.getElementById("totalCollection").innerHTML =
    "₹ " + todayCollection;

}

// ==============================
// Closing Cash
// ==============================

function calculateClosing() {

    const openingCash = Number(
        document.getElementById("openingCash").value
    ) || 0;

    const expenses = Number(
        document.getElementById("expenses").value
    ) || 0;

    const closingCash =
    openingCash -
    totalLoan +
    totalCollection -
    expenses;

    document.getElementById("closingCash").innerHTML =
        "₹ " + closingCash;

}


// Auto Calculate

document
.getElementById("openingCash")
.addEventListener("input", calculateClosing);

document
.getElementById("expenses")
.addEventListener("input", calculateClosing);




// ==============================
// Save Daily Sheet
// ==============================

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
    openingCash -
    totalLoan +
    todayCollection -
    expenses;

    try {

        await addDoc(

            collection(db, "dailySheets"),

            {

                date: today,

                staffUser: staffUser,

                openingCash: openingCash,

                totalLoan: totalLoan,

                totalCollection: todayCollection,

                expenses: expenses,

                closingCash: closingCash,

                notes: notes,

                status: "Completed",

                createdAt: new Date()

            }

        );

        alert("✅ డైలీ షీట్ విజయవంతంగా సేవ్ అయింది.");

    } catch (error) {

        console.log(error);

        alert("❌ డైలీ షీట్ సేవ్ కాలేదు.");

    }

};

// ==============================
// Page Load
// ==============================

async function initPage() {

    await loadTodayLoans();

    await loadTodayCollection();

    calculateClosing();

}

// Start Page
initPage();