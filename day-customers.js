import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);

const day = params.get("day");

document.getElementById("dayTitle").innerHTML =
"Day " + day + " Customers";

window.addCustomer = function(){

    window.location.href =
    "add-customer.html?day=" + day;

}

async function loadCustomers() {

    const tbody = document.getElementById("customerTable");

    tbody.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "customers"));

    querySnapshot.forEach((docSnap) => {

        const data = docSnap.data();

        tbody.innerHTML += `
<tr>

<td>${data.serialNo}</td>

<td>${data.customerName}</td>

<td>${data.village}</td>

<td>${data.phone}</td>
<td><img src="${data.photo}" alt="Customer Photo" width="100"></td>
<td>${data.location}</td>

<td>

<button onclick="editCustomer('${docSnap.id}')">
✏️ Edit
</button>

<button onclick="deleteCustomer('${docSnap.id}')">
🗑 Delete
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