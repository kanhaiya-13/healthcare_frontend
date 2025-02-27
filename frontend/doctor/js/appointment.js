/* 
    File: appointment.js
    Created by: Bhagyesh Chaudhari
    Created on: 27th February 2025

    Description: Contains the JavaScript code for to display the appointments and add prescription functionality.

    Last updated by: Bhagyesh Chaudhari
    Last updated on: 27th February 2025

    Changes made : Added the code to fetch appointments from the server and display them on the page & 
                Added the code to display the prescription modal when the "Add Prescription" button is clicked.

*/



const BACKEND_URL = "http://localhost:3000"; // Replace with your backend URL

let doctors = []; // Store fetched doctor data globally

async function fetchDoctors() {
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

    // Store the appointments data in the doctors array
    doctors = appointments;

    // Render doctors (appointments) data
    renderDoctors(doctors);

    // Attach calendar events (for date filtering)
    attachCalendarEvents();
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
}

// Call the fetchDoctors function when the page loads
fetchDoctors();


/******************************** function to render the appointments data of particular doctor ************************************/
function renderDoctors(filteredDoctors) {
  const container = document.getElementById("doctorsContainer");
  container.innerHTML = ""; // Clear existing content

  if (filteredDoctors.length === 0) {
    container.innerHTML =
      "<p>No appointments available for the selected date.</p>";
    return;
  }

  filteredDoctors.forEach((doctor) => {
    const doctorCard = document.createElement("div");
    doctorCard.className = "doctor-card";

    // Set the card content
    doctorCard.innerHTML = `
            <div class="appointmentInfo"> 
                <p class="doctor-name">${doctor.patient_name}</p>
                <p class="doctor-info">Doctor Name: ${doctor.doctor_name}</p>
                <p class="doctor-info">Date: ${doctor.appointment_date}</p>
                <p class="doctor-info">Time: ${doctor.appointment_time}</p>
            </div>
            <div>
                <button class="addPrescription">Add Prescription</button>
            </div>
        `;

    // Click event for the doctor card (except the button)
    doctorCard.addEventListener("click", (event) => {
      if (!event.target.classList.contains("addPrescription")) {
        openModal(
          doctor.appointment_id,
          doctor.patient_id,
          doctor.patient_name,
          doctor.doctor_name,
          doctor.appointment_time,
          doctor.appointment_date,
          doctor.notes
        );
      }
    });

    // Click event for the "Add Prescription" button
    const addPrescriptionButton = doctorCard.querySelector(".addPrescription");
    addPrescriptionButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevents the card's click event from firing
      addPrescriptionFunction(doctor);
    });

    // Append the card to the container
    container.appendChild(doctorCard);
  });
}

/******************************** function to add prescription for the selected Appointment ************************************/
function addPrescriptionFunction(doctor) {
  document.getElementById("prescription_patient_id").value = doctor.patient_id;
  document.getElementById("prescription_doctor_id").value = doctor.doctor_id;
  document.getElementById("prescription_patient_name").value =
    doctor.patient_name;
  document.getElementById("prescription_prescribing_doctor_name").value =
    doctor.doctor_name;
  document.getElementById("prescriptionModal").style.display = "flex";
}

function closePrescriptionModal() {
  document.getElementById("prescriptionModal").style.display = "none";
}

/******************************** function to save the prescription data to the server ************************************/
document
  .getElementById("prescriptionForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const prescriptionData = {
      patient_id: document.getElementById("prescription_patient_id").value,
      doctor_id: document.getElementById("prescription_doctor_id").value,
      hospital_id: document.getElementById("prescription_hospital_id").value,
      prescription_date: new Date().toISOString().split("T")[0],
      patient_name: document.getElementById("prescription_patient_name").value,
      patient_age: document.getElementById("prescription_patient_age").value,
      patient_gender: document.getElementById("prescription_patient_gender")
        .value,
      patient_contact: document.getElementById("prescription_patient_contact")
        .value,
      bp_reading: document.getElementById("prescription_bp_reading").value,
      pulse_rate: document.getElementById("prescription_pulse_rate").value,
      weight: document.getElementById("prescription_weight").value,
      spo2: document.getElementById("prescription_spo2").value,
      diagnosis: document.getElementById("prescription_diagnosis").value,
      system_examination: document.getElementById(
        "prescription_system_examination"
      ).value,
      patient_complaints: document.getElementById(
        "prescription_patient_complaints"
      ).value,
      referring_doctor: document.getElementById("prescription_referring_doctor")
        .value,
      prescribing_doctor_name: document.getElementById(
        "prescription_prescribing_doctor_name"
      ).value,
      doctor_qualifications: document.getElementById(
        "prescription_doctor_qualifications"
      ).value,
      doctor_registration_number: document.getElementById(
        "prescription_doctor_registration_number"
      ).value,
      notes: document.getElementById("prescription_notes").value,
      follow_up_date: document.getElementById("prescription_follow_up_date")
        .value,
    };

    // Log prescription data before sending
    console.log("Prescription Data:", prescriptionData);

    try {
      const response = await fetch("http://localhost:3000/prescription", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      });

      if (response.ok) {
        alert("Prescription saved successfully!");
        closePrescriptionModal();
      } else {
        alert("Failed to save prescription.");
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Error occurred while saving.");
    }
  });


/******************************** function to render the appointments data of particular doctor ************************************/
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
  const filteredDoctors = doctors.filter(
    (doctor) => doctor.appointment_date === selectedDate
  );
  renderDoctors(filteredDoctors);
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

// Fetch doctors when the page loads
fetchDoctors();
