import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const container =
    document.getElementById("staffContainer");


async function loadStaff() {

    container.innerHTML = "";

    const today =
        new Date().toISOString().split("T")[0];


    try {

        const staffSnapshot =
            await getDocs(
                collection(db, "staff")
            );


        if (staffSnapshot.empty) {

            container.innerHTML = `
                <h3 style="text-align:center;color:red;">
                    No Staff Found
                </h3>
            `;

            return;
        }


        for (const docSnap of staffSnapshot.docs) {

            const staff =
                docSnap.data();


            const dailyQuery = query(

                collection(db, "dailySheets"),

                where(
                    "staffUser",
                    "==",
                    staff.username
                ),

                where(
                    "date",
                    "==",
                    today
                )

            );


            const dailySnapshot =
                await getDocs(dailyQuery);


            let status = "🔴 Pending";
            let color = "red";

           


            // If Daily Sheet is saved
            if (!dailySnapshot.empty) {

                status = "🟢 Completed";
                color = "green";


                

            }


            // Staff Card
            container.innerHTML += `

            <div
                class="staff-card"
                onclick="openReport('${staff.username}')"
            >

                <div style="font-size:65px;">
                    👨‍💼
                </div>


                <h3>
                    ${staff.name || ""}
                </h3>


                <p>
                    ${staff.username}
                </p>


                <div style="
                    margin-top:10px;
                    font-weight:bold;
                    color:${color};
                ">
                    ${status}
                </div>


                

            </div>

            `;

        }


    } catch (error) {

        console.log(error);

        container.innerHTML = `
            <h3 style="
                color:red;
                text-align:center;
            ">
                Failed to Load Staff
            </h3>
        `;

    }

}


// Open Staff Report

window.openReport = function (username) {

    window.location.href =
        "staff-report.html?staff=" +
        username;

};


// Load Staff

loadStaff();