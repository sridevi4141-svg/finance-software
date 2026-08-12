import { db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// Customer ID
const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");

if (!customerId) {
    alert("Customer ID Not Found");
    throw new Error("Customer ID Missing");
}

let weeksRenderId = 0;

// Load Customer
async function loadCustomer(){

    if(!customerId){

        alert("Customer ID Not Found");

        return;

    }

    try{

        const docRef = doc(db,"customers",customerId);

        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){

            const data = docSnap.data();
            console.log(data);

            document.getElementById("customerName").innerHTML =
            data.customerName || "";

            document.getElementById("customerVillage").innerHTML =
            data.village || "";

            

            if(data.photo){

                document.getElementById("customerPhoto").src =
                data.photo;

            }
            

            document.getElementById("amount").value =
            data.amount || "";

            document.getElementById("toPay").value =
            data.toPay || "";

            document.getElementById("weeks").value =
            data.weeks || "";

            document.getElementById("weeklyPayment").value =
            data.weeklyPayment || "";

            if(data.weeks){

    createWeeks(
        Number(data.weeks),
        Number(data.weeklyPayment || 0)
    );

            }

        }

    }catch(error){

        console.log(error);

    }

}

loadCustomer();

// Weekly Payment Auto
window.calculateWeekly = function(){

    const toPay =
    Number(document.getElementById("toPay").value);

    const weeks =
    Number(document.getElementById("weeks").value);

    if(toPay>0 && weeks>0){

        document.getElementById("weeklyPayment").value =
        (toPay/weeks).toFixed(2);

        createWeeks(weeks);

    }

}


// Save Loan
window.saveLoan = async function(){

    alert("Save Button Clicked");

    const amount =
    Number(document.getElementById("amount").value);

    const toPay =
    Number(document.getElementById("toPay").value);

    const weeks =
    Number(document.getElementById("weeks").value);

    const weeklyPayment =
    Number(document.getElementById("weeklyPayment").value);

    if(amount==0 || toPay==0 || weeks==0){

        alert("Please Fill All Details");

        return;

    }

    try{

        await updateDoc(

            doc(db,"customers",customerId),

            {

                amount,

                toPay,

                weeks,

                weeklyPayment

            }

        );
const customerSnap = await getDoc(
    doc(db, "customers", customerId)
);

const customer = customerSnap.data();

const staff = JSON.parse(
    localStorage.getItem("staffLogin")
);

await addDoc(collection(db, "dailyLoans"), {

    customerId: customerId,

    serialNo: customer.serialNo,

    customerName: customer.customerName,

    loanAmount: Number(amount),

    staffUser: staff.username,

    date: new Date().toISOString().split("T")[0],

    createdDate: new Date()

});
        alert("Loan Details Saved Successfully");

    }catch(error){

        console.log(error);

        alert("Save Failed");

    }

}

// Create Week Cards
async function createWeeks(totalWeeks, weeklyAmount = null) {

    const renderId = ++weeksRenderId;

    const tbody = document.getElementById("paymentTable");

    tbody.innerHTML = "";

    const weekly =
        weeklyAmount !== null
            ? Number(weeklyAmount)
            : Number(document.getElementById("weeklyPayment").value || 0);

    try {

        const q = query(
            collection(db, "payments"),
            where("customerId", "==", customerId)
        );

        const paymentSnap = await getDocs(q);

        // If another createWeeks() started after this one,
        // stop this old render.
        if (renderId !== weeksRenderId) {
            return;
        }

        const paidWeeks = {};

        paymentSnap.forEach((docSnap) => {

            const payment = docSnap.data();

            paidWeeks[payment.week] = payment;

        });

        for (let i = 1; i <= totalWeeks; i++) {

            if (paidWeeks[i]) {

                let paymentDate = "-";

                if (paidWeeks[i].paymentDate) {

                    if (paidWeeks[i].paymentDate.seconds) {

                        paymentDate = new Date(
                            paidWeeks[i].paymentDate.seconds * 1000
                        ).toLocaleDateString();

                    } else {

                        paymentDate = new Date(
                            paidWeeks[i].paymentDate
                        ).toLocaleDateString();

                    }

                }

                tbody.innerHTML += `
                    <tr>

                        <td>${i}</td>

                        <td>₹ ${weekly}</td>

                        <td>${paymentDate}</td>

                        <td class="paid">
                            ✅ Paid
                        </td>

                        <td>

                            <button
                                disabled
                                style="
                                    background:green;
                                    color:white;
                                    border:none;
                                    padding:6px 12px;
                                    border-radius:5px;
                                "
                            >
                                Paid
                            </button>

                        </td>

                    </tr>
                `;

            } else {

                tbody.innerHTML += `
                    <tr>

                        <td>${i}</td>

                        <td>₹ ${weekly}</td>

                        <td>-</td>

                        <td class="pending">
                            🟠 Pending
                        </td>

                        <td>

                            <button
                                class="pay-btn"
                                onclick="openWeek(${i})"
                            >
                                Pay
                            </button>

                        </td>

                    </tr>
                `;

            }

        }

    } catch (error) {

        console.error("createWeeks Error:", error);

    }

}
let selectedWeek=0;

window.openWeek=function(week){

    selectedWeek=week;

    document.getElementById("weekTitle").innerHTML=
    "Week "+week;

    document.getElementById("paymentPopup").style.display=
    "block";

}

window.closePopup=function(){

    document.getElementById("paymentPopup").style.display=
    "none";

}

window.saveWeekPayment = async function () {

    const paidAmount = Number(
        document.getElementById("paidAmount").value
    );

    if (paidAmount <= 0) {
        alert("Enter Amount");
        return;
    }

    try {

        // =========================
        // Customer
        // =========================

        const customerRef = doc(
            db,
            "customers",
            customerId
        );

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {
            alert("Customer not found");
            return;
        }

        const customer =
            customerSnap.data();


        // =========================
        // Balance
        // =========================

        const currentBalance =
            Number(customer.toPay || 0);

        if (paidAmount > currentBalance) {

            alert(
                `Amount cannot be greater than balance ₹${currentBalance}`
            );

            return;
        }


        // =========================
        // Weekly Amount
        // =========================

        const weeklyPayment =
            Number(customer.weeklyPayment || 0);

        if (weeklyPayment <= 0) {

            alert("Weekly payment not found");

            return;
        }


        // =========================
        // Check Amount
        // =========================

        if (paidAmount % weeklyPayment !== 0) {

            alert(
                `Please enter amount in multiples of ₹${weeklyPayment}`
            );

            return;
        }


        // =========================
        // How many weeks?
        // =========================

        const weeksToPay =
            Math.floor(
                paidAmount / weeklyPayment
            );


        // =========================
        // Existing Payments
        // =========================

        const paymentQuery = query(
            collection(db, "payments"),
            where(
                "customerId",
                "==",
                customerId
            )
        );

        const paymentSnap =
            await getDocs(paymentQuery);


        const paidWeeks = new Set();

        paymentSnap.forEach((docSnap) => {

            const payment =
                docSnap.data();

            if (payment.week) {

                paidWeeks.add(
                    Number(payment.week)
                );

            }

        });


        // =========================
        // Find Unpaid Weeks
        // =========================

        const totalWeeks =
            Number(customer.weeks || 0);

        const weeksToMark = [];

        for (
            let week = selectedWeek;
            week <= totalWeeks;
            week++
        ) {

            if (!paidWeeks.has(week)) {

                weeksToMark.push(week);

            }

            if (
                weeksToMark.length ===
                weeksToPay
            ) {
                break;
            }

        }


        // =========================
        // Check Available Weeks
        // =========================

        if (
            weeksToMark.length <
            weeksToPay
        ) {

            alert(
                "Not enough unpaid weeks available"
            );

            return;
        }


        // =========================
        // Staff
        // =========================

        const staff =
            JSON.parse(
                localStorage.getItem(
                    "staffLogin"
                )
            );

        if (!staff) {

            alert("Staff login not found");

            return;
        }


        // =========================
        // Save Each Week
        // =========================

        for (const week of weeksToMark) {

            await addDoc(
                collection(db, "payments"),
                {

                    customerId:
                        customerId,

                    week:
                        week,

                    amount:
                        weeklyPayment,

                    paymentDate:
                        new Date(),

                    staffUser:
                        staff.username,

                    status:
                        "Paid"

                }
            );

        }


        // =========================
        // Update Balance
        // =========================

        const newBalance =
            currentBalance -
            paidAmount;

        await updateDoc(
            customerRef,
            {
                toPay: newBalance
            }
        );


        // Update screen

        document.getElementById(
            "toPay"
        ).value = newBalance;


        alert(
            `${weeksToMark.length} week(s) payment saved successfully`
        );


        closePopup();


        // Reload customer / weeks

        await loadCustomer();

    }
    catch (e) {

        console.error(
            "saveWeekPayment Error:",
            e
        );

        alert(
            "Payment Failed"
        );

    }

};