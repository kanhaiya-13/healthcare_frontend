/* 
    File: patientAppointmentScheduling.js
    Created by: Bhagyesh Chaudhari
    Created on: 27th February 2025

    Description: This JavaScript file is used to handle the appointment scheduling functionality for patients.

    Last updated by: Bhagyesh Chaudhari
    Last updated on: 27th February 2025

    Changes made : Added code to handle form submission for appointment scheduling.
*/

/******************************* This code sends the appointment data to the server when the form is submitted. *******************************/
document
  .getElementById("appointment-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Manually collect form values
    const doctor_id = document.getElementById("doctor_id").value;
    const status = document.getElementById("status").value;
    const appointment_date = document.getElementById("date").value; // Date in YYYY-MM-DD format
    const appointment_time = document.getElementById("time").value;
    const notes = document.getElementById("notes").value;

    // Ensure date is in YYYY-MM-DD format (if it's not already)
    const formattedDate = new Date(appointment_date)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD format

    // Create a data object
    const appointmentData = {
      doctor_id,
      status,
      appointment_date: formattedDate, // Use the formatted date
      appointment_time,
      notes,
    };

    // Log the appointment data in the console
    console.log("Form Data:", appointmentData);

    // Send the data to the server
    fetch("http://localhost:3000/appointments/create", {
      // Change to localhost for local development
      method: "POST",
      body: JSON.stringify(appointmentData),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Appointment Submitted Successfully!");
        console.log("Response:", data);
      })
      .catch((error) => {
        alert("Error submitting appointment!");
        console.error("Error:", error);
      });
  });
