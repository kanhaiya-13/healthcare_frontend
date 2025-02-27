/* 
    File: appointmentScheduling.js
    Created by: Bhagyesh Chaudhari
    Created on: 27th February 2025

    Description: Contains the JavaScript code for the appointment scheduling page & New Patient Registration.

    Last updated by: Bhagyesh Chaudhari
    Last updated on: 27th February 2025

    Changes made : Added the code to send an appointment request to the server and handle the response
                   & Added the code to display the modal overlay when the "Add New Patient" button is clicked.
*/

/******************************* This code displays the modal overlay when the "Register" button is clicked. *******************************/
document.addEventListener("DOMContentLoaded", function () {
  const modalOverlay = document.getElementById("modalOverlay");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeBtn = document.querySelector(".close-btn");
  const registrationForm = document.querySelector(".modal-overlay form");

  // Open modal
  openModalBtn.addEventListener("click", function () {
    modalOverlay.style.display = "flex";
  });

  // Close modal
  closeBtn.addEventListener("click", function () {
    modalOverlay.style.display = "none";
  });

  // Close modal when clicking outside
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });

  // Handle form submission
  registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = {
      name: document.querySelector(
        ".modal-overlay input[type='text'][placeholder='E.g: John Smith']"
      ).value,
      username: document.querySelector(
        ".modal-overlay input[type='text'][placeholder='johnWC98']"
      ).value,
      email: document.querySelector(".modal-overlay input[type='email']").value,
      contactNumber: document.querySelector(
        ".modal-overlay input[type='text'][placeholder='0123456789']"
      ).value,
      dob: document.querySelector(".modal-overlay input[type='date']").value,
      address: document.querySelector(
        ".modal-overlay input[type='text'][placeholder='abc road, Ghatkopar east']"
      ).value,
      password: document.querySelector(
        ".modal-overlay input[type='password'][placeholder='********']"
      ).value,
      confirmPassword: document.querySelector(
        ".modal-overlay input[type='password'][placeholder='********']"
      ).value,
      gender: document
        .querySelector(".modal-overlay input[type='radio']:checked")
        ?.nextElementSibling?.textContent.trim(),
    };

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Remove confirmPassword from the data to be sent
    delete formData.confirmPassword;

    try {
      // Send data to backend API
      const response = await fetch("http://localhost:3000/patients/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Handle response
      if (response.ok) {
        const result = await response.json();
        alert("Registration successful!");
        console.log("Backend response:", result);
        registrationForm.reset(); // Clear the form
        modalOverlay.style.display = "none"; // Close the modal
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }
  });
});

/******************************* This code sends the appointment data to the server when the form is submitted. *******************************/
document
  .getElementById("appointment-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Manually collect form values
    const patient_id = document.getElementById("patient_id").value;
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
      patient_id,
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
