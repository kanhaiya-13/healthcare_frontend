/* 
    File: patientAppointment.js
    Created by: Bhagyesh Chaudhari
    Created on: 27th February 2025

    Description: Frontend JavaScript code for the patient appointment page.
    Last updated by: Bhagyesh Chaudhari
    Last updated on: 27th February 2025

    Changes made : Added the code to fetch the appointments data from the backend API and render it on the page.
    Added the code to filter appointments by date and display the filtered appointments.

*/



const BACKEND_URL = "http://localhost:3000"; // Replace with your backend URL

let patient = []; // Store fetched patient data globally

async function fetchPatient() {
  try {
    // Fetch the appointments data from the backend API
    const response = await fetch(`${BACKEND_URL}/appointments`, {
      method: "GET",
      credentials: "include", // This ensures cookies are sent
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    // Parse the response as JSON
    const appointments = await response.json();

    // Store the appointments data in the patient array
    patient = appointments;

    // Render patient (appointments) data
    renderPatient(patient);

    // Attach calendar events (for date filtering)
    attachCalendarEvents();
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
}

// Call the fetchPatient function when the page loads
fetchPatient();


/******************************** function to render the appointments data of particular Patient ************************************/
function renderPatient(filteredPatient) {
  const container = document.getElementById("patientContainer");
  container.innerHTML = ""; // Clear existing content

  if (filteredPatient.length === 0) {
    container.innerHTML =
      "<p>No appointments available for the selected date.</p>";
    return;
  }

  filteredPatient.forEach((patient) => {
    const patientCard = document.createElement("div");
    patientCard.className = "patient-card";

    // Set the card content
    patientCard.innerHTML = `
            <div class="appointmentInfo"> 
                <p class="patient-name">${patient.patient_name}</p>
                <p class="patient-info">Doctor Name: ${patient.doctor_name}</p>
                <p class="patient-info">Date: ${patient.appointment_date}</p>
                <p class="patient-info">Time: ${patient.appointment_time}</p>
            </div>
            <div>
                <button class="viewPrescription">View Prescription</button>
            </div>
        `;

    // Click event for the patient card (except the button)
    patientCard.addEventListener("click", (event) => {
      if (!event.target.classList.contains("viewPrescription")) {
        openModal(
          patient.appointment_id,
          patient.patient_id,
          patient.patient_name,
          patient.doctor_name,
          patient.appointment_time,
          patient.appointment_date,
          patient.notes
        );
      }
    });

    // Click event for the "View Prescription" button
    const viewPrescriptionButton = patientCard.querySelector(".viewPrescription");
    viewPrescriptionButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevents the card's click event from firing
      viewPrescriptionFunction(patient.prescription);
    });

    // Append the card to the container
    container.appendChild(patientCard);
  });
}

/******************************** function to View prescription for the selected Appointment ************************************/
function viewPrescriptionFunction(prescription) {
    document.getElementById("prescription").innerText = prescription;
    document.getElementById("prescriptionModal").style.display = "flex";
}

function closePrescriptionModal() {
  // Hide the modal when close button is clicked
  document.getElementById("prescriptionModal").style.display = "none";
}


/******************************** function to render the appointments data of particular patient ************************************/
function attachCalendarEvents() {
  const calendarCells = document.querySelectorAll("#calendar td[data-date]");

  calendarCells.forEach((cell) => {
    cell.addEventListener("click", () => {
      const selectedDate = cell.getAttribute("data-date");
      filterAppointmentsByDate(selectedDate);
    });
  });
}

/******************************** function to filter the appointments data by date ************************************/
function filterAppointmentsByDate(selectedDate) {
  const filteredPatient = patient.filter(
    (patient) => patient.appointment_date === selectedDate
  );
  renderPatient(filteredPatient);
}

function attachCalendarEvents() {
  const calendarCells = document.querySelectorAll("#calendar td");

  calendarCells.forEach((cell) => {
    cell.addEventListener("click", function () {
      const selectedDate = this.getAttribute("data-date");

      // Ensure the selectedDate is in the same format as the appointment date
      const formattedSelectedDate = new Date(selectedDate)
        .toISOString()
        .split("T")[0];

      // Filter appointments based on selected date
      const filteredAppointments = appointments.filter((appointment) => {
        const formattedAppointmentDate = new Date(appointment.appointment_date)
          .toISOString()
          .split("T")[0];
        return formattedAppointmentDate === formattedSelectedDate;
      });

      renderAppointments(filteredAppointments); // Re-render appointments with the filtered data
    });
  });
}


/**** Function to open the modal with appointment details when a appointment card is clicked ********************************************/
function openModal(
  appointment_id,
  patient_id,
  patient_name,
  doctor_name,
  appointment_time,
  appointment_date,
  notes
) {
  // Set modal content
  document.getElementById("modalDoctorName").innerText = appointment_id;
  document.getElementById("modalSpecialization").innerText = patient_id;
  document.getElementById("modalQualification").innerText = patient_name;
  document.getElementById("modalExperience").innerText = doctor_name;
  document.getElementById("modalContact").innerText = appointment_time;
  document.getElementById("modalEmail").innerText = appointment_date;
  document.getElementById("modalFee").innerText = notes;

  // Display the modal
  document.getElementById("doctorModal").style.display = "flex";
}

function closeModal() {
  // Hide the modal when close button is clicked
  document.getElementById("doctorModal").style.display = "none";
}

// Fetch patient when the page loads
fetchPatient();
