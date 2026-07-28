import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);
const day = params.get("day");

const q = query(
    collection(db, "customers"),
    where("day", "==", day)
);

const querySnapshot = await getDocs(q);
window.addCustomer = function(){

    window.location.href =
    "add-customer.html?day=" + day;

}

async function loadCustomers() {

    const tbody = document.getElementById("customerTable");
    tbody.innerHTML = "";

    const params = new URLSearchParams(window.location.search);
const day = params.get("day");

const q = query(
    collection(db, "customers"),
    where("day", "==", day)
);

const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {

        const data = docSnap.data();

        tbody.innerHTML += `
            <tr>
                <td>${data.serialNo || ""}</td>

                <td>
                    <a href="customer-details.html?id=${docSnap.id}">
                        ${data.customerName}
                    </a>
                </td>
                <td>${data.relation || ""}</td>
                <td>${data.village || ""}</td>
                <td>${data.phone || ""}</td>
                <td>${data.aadhar || ""}</td>
                <td>
    <img src="${data.photo}"
         width="70"
         height="70"
         style="border-radius:8px; object-fit:cover;">
</td>
                <td>${data.location || ""}</td>

                <td>
                    <button onclick="editCustomer('${docSnap.id}')">
                        Edit
                    </button>

                    <button onclick="deleteCustomer('${docSnap.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    });

}

loadCustomers();

window.deleteCustomer = async function(id){

    if(confirm("Delete Customer?")){

        await deleteDoc(doc(db,"customers",id));

        alert("Customer Deleted");

        loadCustomers();

    }

}
window.editCustomer = function(id){

    window.location.href =
    "add-customer.html?id=" + id;

}

window.searchCustomer = function () {

    const search = document
        .getElementById("searchCustomer")
        .value
        .trim()
        .toLowerCase();

    const rows = document.querySelectorAll("#customerTable tr");

    rows.forEach((row) => {

        const cells = row.getElementsByTagName("td");

        if (cells.length > 0) {

            const SerialNo = cells[0].innerText.toString().toLowerCase();
            const name = cells[1].innerText.toLowerCase();
            const phone = cells[4].innerText.toLowerCase();

            if (
                SerialNo.includes(search) ||
                name.includes(search) ||
                phone.includes(search)
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        }

    });

}