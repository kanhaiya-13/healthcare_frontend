/* 
    File: docDashBoard.js
    Created by: Bhagyesh Chaudhari
    Created on: 27th February 2025

    Description: This script sends a request to the server to fetch the clinic assessment data and renders the charts on the doctor's dashboard.

    Last updated by: Bhagyesh Chaudhari
    Last updated on: 27th February 2025

    Changes made : Added the code to fetch the clinic assessment data and render the charts on the doctor's dashboard.
*/

// Define the backend URL
const BACKEND_URL = "http://localhost:3000";

/******************************************* Helper function to get a specific cookie value ***********************************************/
function getCookie(name) {
  const cookieArr = document.cookie.split("; ");
  for (let cookie of cookieArr) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value); // Decode in case it's URL-encoded
    }
  }
  return null;
}

/******************************************* Fetch assessment data from the backend ***********************************************************/
async function fetchAssessmentData() {
  try {
    // Retrieve the token from cookies
    const token = getCookie("token");

    if (!token) {
      throw new Error("No token found in cookies");
    }

    // Fetch patient stats from the backend with authorization
    const patientsResponse = await fetch(
      `${BACKEND_URL}/doctors/stats/last-month/patients`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!patientsResponse.ok) {
      throw new Error(
        `Failed to fetch patient stats: ${patientsResponse.statusText}`
      );
    }

    const patientsData = await patientsResponse.json();
    console.log("Patients data:", patientsData);

    // Fetch diagnosis stats with authorization
    const diagnosisResponse = await fetch(
      `${BACKEND_URL}/doctors/stats/last-month/diagnosis?doctor_id=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!diagnosisResponse.ok) {
      throw new Error(
        `Failed to fetch diagnosis stats: ${diagnosisResponse.statusText}`
      );
    }

    const diagnosisData = await diagnosisResponse.json();
    console.log("Diagnosis data:", diagnosisData);

    // Render the charts with the fetched data
    renderCharts(patientsData, diagnosisData);
  } catch (error) {
    console.error("Error fetching clinic assessment data:", error);
  }
}

/******************************************* Render Charts using Chart.js ***********************************************************/
function renderCharts(patientsData, diagnosisData) {
  // Total Patients Chart
  new Chart(document.getElementById("totalPatientsChart"), {
    type: "bar",
    data: {
      labels: ["Total Patients", "New Patients", "Repeated Patients"],
      datasets: [
        {
          label: "Count",
          data: [
            patientsData.totalPatients || 0,
            patientsData.newPatients || 0,
            patientsData.repeatedPatients || 0,
          ],
          backgroundColor: ["#4BC0C0", "#FF6384", "#36A2EB"],
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Diagnosis Distribution Chart
  if (diagnosisData.length > 0) {
    new Chart(document.getElementById("diagnosisChart"), {
      type: "pie",
      data: {
        labels: diagnosisData.map((item) => item.diagnosis),
        datasets: [
          {
            label: "Number of Patients",
            data: diagnosisData.map((item) => item.number_of_patients || 0),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  } else {
    console.warn("No diagnosis data available to render the chart.");
  }
}

/******************************************* Ensure data is fetched and rendered when the page loads *******************************************/
document.addEventListener("DOMContentLoaded", () => {
  fetchAssessmentData();
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    const token = getCookie("token");
    const response = await fetch(`${BACKEND_URL}/users/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      document.cookie = "token=; path=/; max-age=0; secure"; // Clear token cookie
      alert("Logged out successfully");
      window.location.href = "/frontend/html/login.html";
    } else {
      alert("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
});
