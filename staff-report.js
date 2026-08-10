import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    getDoc,
    query,
    where,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const staffUser = params.get("staff");

const today = new Date().toISOString().split("T")[0];

document.getElementById("reportDate").innerHTML = today;

loadSummary();
loadLoans();
loadCollections();


// =============================
// Summary
// =============================

async function loadSummary(){

    const q = query(

        collection(db,"dailySheets"),

        where("staffUser","==",staffUser),

        where("date","==",today)

    );

    const snap = await getDocs(q);

    if(!snap.empty){

        const data = snap.docs[0].data();

        document.getElementById("staffTitle").innerHTML =
        data.staffName + " Daily Report";

        document.getElementById("openingCash").innerHTML =
        "₹ " + data.openingCash;

        document.getElementById("loanTotal").innerHTML =
        "₹ " + data.totalLoan;

        document.getElementById("collectionTotal").innerHTML =
        "₹ " + data.totalCollection;

        document.getElementById("expenses").innerHTML =
        "₹ " + data.expenses;

        document.getElementById("closingCash").innerHTML =
        "₹ " + data.closingCash;

    }

}



// =============================
// Loans
// =============================

async function loadLoans(){

    const tbody = document.getElementById("loanBody");

    tbody.innerHTML = "";

    const q = query(
        collection(db, "dailyLoans"),
        where("staffUser", "==", staffUser),
        where("date", "==", today)
    );

    const snap = await getDocs(q);

    let sno = 1;
    let totalLoan = 0;

    snap.forEach((docSnap) => {

        const data = docSnap.data();

        const loanAmount = Number(data.loanAmount || 0);

        totalLoan += loanAmount;

        tbody.innerHTML += `

        <tr>

            <td>${sno++}</td>

            <td>${data.customerName || ""}</td>

            <td>₹ ${loanAmount}</td>

        </tr>

        `;

    });

   document.getElementById("loanTotal").textContent =
    "₹" + totalLoan;

}

// =============================
// Collections
// =============================

async function loadCollections(){

    let sno = 1;
    let totalCollection = 0;

    const tbody =
        document.getElementById("collectionBody");

    tbody.innerHTML = "";

    const q = query(

        collection(db, "payments"),

        where("staffUser", "==", staffUser)

    );

    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {

        const data = docSnap.data();

        if (!data.paymentDate) continue;

        const paymentDate = new Date(

            data.paymentDate.seconds
                ? data.paymentDate.seconds * 1000
                : data.paymentDate

        ).toISOString().split("T")[0];

        if (paymentDate == today) {

            let customerName = "";

            if (data.customerId) {

                const customerSnap =
                    await getDoc(
                        doc(db, "customers", data.customerId)
                    );

                if (customerSnap.exists()) {

                    customerName =
                        customerSnap.data().customerName;

                }

            }

            const paymentAmount =
                Number(data.amount || 0);

            totalCollection += paymentAmount;

            tbody.innerHTML += `

            <tr>

                <td>${sno++}</td>

                <td>${customerName}</td>

                <td>₹ ${paymentAmount}</td>

            </tr>

            `;

        }

    }

    document.getElementById("collectionTotal").textContent =
    "₹" + totalCollection;

}


// =============================
// Excel Download
// =============================

window.downloadExcel = async function () {

    try {

        const workbook = XLSX.utils.book_new();

        // =========================
        // PAYMENT SHEET
        // =========================

        const paymentData = [];

        paymentData.push([
            "S.No",
            "Customer Name",
            "Village",
            "Phone Number",
            "Paid Amount"
        ]);

        let paymentSno = 1;
        let totalPayment = 0;

        const paymentQuery = query(
            collection(db, "payments"),
            where("staffUser", "==", staffUser)
        );

        const paymentSnap = await getDocs(paymentQuery);

        paymentSnap.forEach((docSnap) => {

            const d = docSnap.data();

            const amount = Number(d.amount || 0);

            paymentData.push([
                paymentSno++,
                d.customerName || "",
                d.village || d.location || "",
                d.phone || "",
                amount
            ]);

            totalPayment += amount;

        });

        paymentData.push([]);
        paymentData.push([
            "",
            "",
            "",
            "TOTAL PAYMENT",
            totalPayment
        ]);


        // =========================
        // LOAN SHEET
        // =========================

        const loanData = [];

        loanData.push([
            "S.No",
            "Customer Name",
            "Village",
            "Phone Number",
            "Loan Amount"
        ]);

        let loanSno = 1;
        let totalLoan = 0;

        const loanQuery = query(
            collection(db, "dailyLoans"),
            where("staffUser", "==", staffUser)
        );

        const loanSnap = await getDocs(loanQuery);

        loanSnap.forEach((docSnap) => {

            const d = docSnap.data();

            const amount = Number(d.loanAmount || 0);

            loanData.push([
                loanSno++,
                d.customerName || "",
                d.village || d.location || "",
                d.phone || "",
                amount
            ]);

            totalLoan += amount;

        });

        loanData.push([]);
        loanData.push([
            "",
            "",
            "",
            "TOTAL LOAN",
            totalLoan
        ]);


        // =========================
        // CREATE PAYMENT SHEET
        // =========================

        const paymentSheet =
            XLSX.utils.aoa_to_sheet(paymentData);

        paymentSheet["!cols"] = [
            { wch: 8 },
            { wch: 25 },
            { wch: 20 },
            { wch: 18 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            paymentSheet,
            "Payment Sheet"
        );


        // =========================
        // CREATE LOAN SHEET
        // =========================

        const loanSheet =
            XLSX.utils.aoa_to_sheet(loanData);

        loanSheet["!cols"] = [
            { wch: 8 },
            { wch: 25 },
            { wch: 20 },
            { wch: 18 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            loanSheet,
            "Loan Sheet"
        );


        // =========================
        // DOWNLOAD
        // =========================

        const fileName =
            staffUser + "_Report.xlsx";

        XLSX.writeFile(
            workbook,
            fileName
        );

        alert("Excel successfully downloaded.");

    }
    catch (error) {

        console.error(
            "Excel Error:",
            error
        );

        alert(
            "Excel download failed."
        );

    }

};