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

    const tbody =
    document.getElementById("loanBody");

    tbody.innerHTML = "";

    const q = query(

        collection(db,"dailyLoans"),

        where("staffUser","==",staffUser),

        where("date","==",today)

    );

    const snap = await getDocs(q);

    
    let sno = 1;

    snap.forEach((docSnap)=>{

        const data = docSnap.data();

        tbody.innerHTML += `

        <tr>

            <td>${sno++}</td>

            <td>${data.customerName}</td>

            <td>₹ ${data.loanAmount}</td>

        </tr>

        `;

    });

}



// =============================
// Collections
// =============================

async function loadCollections(){
     let sno = 1;

    const tbody =
    document.getElementById("collectionBody");

    tbody.innerHTML = "";

    const q = query(

        collection(db,"payments"),

        where("staffUser","==",staffUser)

    );

    const snap = await getDocs(q);

    

    for(const docSnap of snap.docs){

        const data = docSnap.data();

        if(!data.paymentDate) continue;

        const paymentDate =

        new Date(

            data.paymentDate.seconds

            ? data.paymentDate.seconds*1000

            : data.paymentDate

        ).toISOString().split("T")[0];

        if(paymentDate == today){

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

}



// =============================
// Excel Download
// =============================

window.downloadExcel = function(){

    alert("Excel Download Feature Next Step");

}

window.downloadExcel = async function () {

    const wb = XLSX.utils.book_new();

    const data = [];

    data.push([
        "S.No",
        "Customer Name",
        "Loan Amount"
    ]);

    const q = query(
        collection(db, "dailyLoans"),
        where("staffUser", "==", staffUser),
        where("date", "==", today)
    );

    const snap = await getDocs(q);

    let sno = 1;

    snap.forEach((docSnap) => {

        const d = docSnap.data();

        data.push([
            sno++,
            d.customerName,
            d.loanAmount
        ]);

    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Daily Report"
    );

    XLSX.writeFile(
        wb,
        staffUser + "_Daily_Report.xlsx"
    );



window.downloadExcel = async function () {

    // Workbook Create
    const workbook = XLSX.utils.book_new();

    // Excel Data
    const excelData = [];

    // Report Date
    const reportDate = today;

    // Staff Name
    let staffName = staffUser;

    // Totals
    let totalLoan = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    // Daily Sheet Values
    let openingCash = 0;
    let expenses = 0;
    let closingCash = 0;
    let collection = 0;

    // Daily Sheet Query
    const dailyQuery = query(
        collection(db, "dailySheets"),
        where("staffUser", "==", staffUser),
        where("date", "==", today)
    );

    const dailySnap = await getDocs(dailyQuery);

    if (!dailySnap.empty) {

        const daily = dailySnap.docs[0].data();

        staffName = daily.staffName || staffUser;

        openingCash = Number(daily.openingCash || 0);

        expenses = Number(daily.expenses || 0);

        closingCash = Number(daily.closingCash || 0);

        collection = Number(daily.collection || 0);

    }
}

    // Heading

    excelData.push(["FINANCE SOFTWARE REPORT"]);
    excelData.push([]);

    excelData.push(["Staff Name", staffName]);
    excelData.push(["Report Date", reportDate]);
    excelData.push([]);

    excelData.push(["Opening Cash", openingCash]);
    excelData.push(["Today's Collection", collection]);
    excelData.push(["Expenses", expenses]);
    excelData.push(["Closing Cash", closingCash]);
    excelData.push([]);

    // Table Heading

    excelData.push([
        "S.No",
        "Customer Name",
        "Village",
        "Phone Number",
        "Loan Amount",
        "Paid Amount",
        "Balance Amount"
    ]);

    // Load Customers

    const customerQuery = query(
        collection(db, "customers"),
        where("staffUser", "==", staffUser)
    );

    const customerSnap = await getDocs(customerQuery);

    

    customerSnap.forEach((docSnap) => {

        const customer = docSnap.data();

        const loan = Number(customer.amount || 0);

const balance = Number(customer.toPay || 0);

const paid = loan - balance;
        totalLoan += loan;
        totalPaid += paid;
        totalBalance += balance;

        excelData.push([

            sno++,

            customer.customerName || "",

            customer.location || "",

            customer.phone || "",

            loan,

            paid,

            balance

        ]);

    });

        // Totals

    excelData.push([]);

    excelData.push(["", "", "", "TOTAL"]);

    excelData.push([
        "",
        "",
        "",
        "Loan",
        totalLoan
    ]);

    excelData.push([
        "",
        "",
        "",
        "Paid",
        totalPaid
    ]);

    excelData.push([
        "",
        "",
        "",
        "Balance",
        totalBalance
    ]);

    // Create Worksheet

    const worksheet =
        XLSX.utils.aoa_to_sheet(excelData);

    // Column Width

    worksheet["!cols"] = [

        { wch: 8 },

        { wch: 25 },

        { wch: 20 },

        { wch: 18 },

        { wch: 15 },

        { wch: 15 },

        { wch: 18 }

    ];

    // Add Sheet

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Daily Report"

    );

    // Download

    const fileName =
        staffName + "_" + reportDate + "_Report.xlsx";

    XLSX.writeFile(

        workbook,

        fileName

    );

}