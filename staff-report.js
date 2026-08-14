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
        collection(db, "dailySheets"),
        where("staffUser", "==", staffUser),
        where("date", "==", today)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {

        const data = snap.docs[0].data();

        document.getElementById("staffTitle").innerHTML =
            (data.staffName || staffUser) + " Daily Report";

        document.getElementById("loanTotal").innerHTML =
            "₹ " + Number(data.totalLoan || 0);

        document.getElementById("collectionTotal").innerHTML =
            "₹ " + Number(data.totalCollection || 0);

        document.getElementById("expenses").innerHTML =
            "₹ " + Number(data.expenses || 0);

        document.getElementById("notes").innerHTML =
            data.notes || "No Notes";

            document.getElementById("closingCash").innerHTML =
    "₹ " + Number(data.closingCash || 0);

    document.getElementById("openingCash").innerHTML =
    "₹ " + Number(data.openingCash || 0);
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

        const paymentData = [
            [
                "Date",
                "Serial No",
                "Name",
                "Village",
                "Ph No",
                "Paid Amount"
            ]
        ];

        const paymentQuery = query(
            collection(db, "payments"),
            where("staffUser", "==", staffUser)
        );

        const paymentSnap = await getDocs(paymentQuery);

        for (const paymentDoc of paymentSnap.docs) {

            const payment = paymentDoc.data();

            if (!payment.paymentDate) continue;

            let paymentDate;

            if (payment.paymentDate.seconds) {

                paymentDate = new Date(
                    payment.paymentDate.seconds * 1000
                );

            } else {

                paymentDate = new Date(payment.paymentDate);

            }

            const dateString =
                paymentDate.toISOString().split("T")[0];

            // Date filter
            if (dateString !== today) continue;


            let customerName = "";
            let village = "";
            let phone = "";
            let serialNo = "";

            // Get customer details
            if (payment.customerId) {

                const customerSnap = await getDoc(
                    doc(db, "customers", payment.customerId)
                );

                if (customerSnap.exists()) {

                    const customer =
                        customerSnap.data();

                    customerName =
                        customer.customerName || "";

                    village =
                        customer.village || "";

                    phone =
                        customer.phone || "";

                    serialNo =
                        customer.serialNo || "";
                }
            }

            paymentData.push([
                dateString,
                serialNo,
                customerName,
                village,
                phone,
                Number(payment.amount || 0)
            ]);
        }


        const paymentSheet =
            XLSX.utils.aoa_to_sheet(paymentData);

        XLSX.utils.book_append_sheet(
            workbook,
            paymentSheet,
            "Payment Sheet"
        );


        // =========================
        // LOAN SHEET
        // =========================

        const loanData = [
            [
                "Date",
                "Serial No",
                "Name",
                "Village",
                "Ph No",
                "Loan Amount"
            ]
        ];

        const loanQuery = query(
            collection(db, "dailyLoans"),
            where("staffUser", "==", staffUser)
        );

        const loanSnap = await getDocs(loanQuery);

        for (const loanDoc of loanSnap.docs) {

            const loan = loanDoc.data();

            if (loan.date !== today) continue;


            let customerName =
                loan.customerName || "";

            let village = "";
            let phone = "";
            let serialNo =
                loan.serialNo || "";


            // Get customer details
            if (loan.customerId) {

                const customerSnap = await getDoc(
                    doc(db, "customers", loan.customerId)
                );

                if (customerSnap.exists()) {

                    const customer =
                        customerSnap.data();

                    customerName =
                        customer.customerName || customerName;

                    village =
                        customer.village || "";

                    phone =
                        customer.phone || "";

                    serialNo =
                        customer.serialNo || serialNo;
                }
            }


            loanData.push([
                loan.date || today,
                serialNo,
                customerName,
                village,
                phone,
                Number(loan.loanAmount || 0)
            ]);
        }


        const loanSheet =
            XLSX.utils.aoa_to_sheet(loanData);

        XLSX.utils.book_append_sheet(
            workbook,
            loanSheet,
            "Loan Sheet"
        );


        // =========================
        // COLUMN WIDTHS
        // =========================

        paymentSheet["!cols"] = [
            { wch: 14 },
            { wch: 12 },
            { wch: 22 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 }
        ];

        loanSheet["!cols"] = [
            { wch: 14 },
            { wch: 12 },
            { wch: 22 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 }
        ];


        // =========================
        // FILE NAME
        // =========================

        const fileName =
            `${staffUser}_${today}_Report.xlsx`;

        XLSX.writeFile(
            workbook,
            fileName
        );


    } catch (error) {

        console.error(
            "Excel Download Error:",
            error
        );

        alert(
            "Excel Download Failed"
        );

    }

};