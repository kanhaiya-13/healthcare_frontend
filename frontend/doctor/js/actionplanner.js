/* 
  File: actionplanner.js
  Created by: Bhagyesh Chaudhari
  Created on: 27th February 2025

  Description: files contains the logic through which the doctors will be able to manage their Schedule.

  Last updated by: Bhagyesh Chaudhari
  Last updated on: 27th February 2025

  Changes made : Added the logic so that the doctor can manage their schedule and availability, Even doctor will be able to see which slots are booked by the patients.

*/

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // Utility to get a cookie value by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Helper: Normalize date to remove timezone offset and adjust to IST (UTC+5:30)
  function normalizeToIST(date) {
    const offset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds for IST
    return new Date(date.getTime() + offset).toISOString().split("T")[0]; // Return in yyyy-mm-dd format
  }

  // Initialize FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    selectable: true,
    selectAllow: function (selectInfo) {
      const today = new Date().setHours(0, 0, 0, 0);
      return selectInfo.start.getTime() >= today;
    },
    select: function (info) {
      const today = new Date().setHours(0, 0, 0, 0);
      const selectedDate = info.start.getTime();

      if (selectedDate >= today) {
        openForm(info.start, info.end);
      } else {
        alert("You cannot create slots for past dates.");
      }
    },
    events: [], // Events will be fetched dynamically
  });

  // Fetch and load slots into the calendar
  function loadSlots() {
    const token = getCookie("token");
    if (!token) {
      alert("Token is missing.");
      return;
    }

    fetch("http://localhost:3000/actionPlanner/get-booked-slots", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Slots:", data);

        const events = data.slots.map((slot) => ({
          title: "Available",
          start: new Date(`${slot.appointment_date}T${slot.start_time}`), // Ensure Date object
          end: new Date(`${slot.appointment_date}T${slot.end_time}`),
          allDay: false, // Ensure it’s not considered an all-day event
        }));

        // Clear old events and add new ones
        calendar.removeAllEvents();
        calendar.addEventSource(events);
        calendar.refetchEvents(); // Ensure updates are reflected
        console.log("FullCalendar Events:", calendar.getEvents());
        console.log("Formatted Events:", events);
      })
      .catch((err) => {
        console.error("Error fetching slots:", err);
      });
  }

  calendar.render();
  loadSlots();

  // Load slots when the page loads

  // Function to open the form for creating slots
  function openForm(startTime, endTime) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const formHtml = `
      <div class="event-form">
        <h3>Create Availability</h3>
        <label>Title:</label>
        <input type="text" id="title" placeholder="Enter title" required>
        
        <label>Date:</label>
        <input type="date" id="date" value="${normalizeToIST(
          startTime
        )}" readonly>
        
        <label>Start Time:</label>
        <input type="time" id="startTime" value="${startTime
          .toISOString()
          .slice(11, 16)}" required>
        
        <label>End Time:</label>
        <input type="time" id="endTime" value="${endTime
          .toISOString()
          .slice(11, 16)}" required>
        
        <label>Slot Duration (minutes):</label>
        <input type="number" id="slotDuration" min="10" max="60" step="10" placeholder="Enter duration" required>
        
        <button id="submit">Submit</button>
        <button id="cancel">Cancel</button>
      </div>
    `;

    const formContainer = document.createElement("div");
    formContainer.innerHTML = formHtml;
    document.body.appendChild(formContainer);

    // Submit form
    document.getElementById("submit").addEventListener("click", () => {
      const title = document.getElementById("title").value;
      const date = document.getElementById("date").value; // yyyy-mm-dd
      const startTimeInput = document.getElementById("startTime").value; // HH:mm
      const endTimeInput = document.getElementById("endTime").value; // HH:mm
      const duration = parseInt(document.getElementById("slotDuration").value);

      if (title && date && startTimeInput && endTimeInput && duration) {
        const start = new Date(`${date}T${startTimeInput}:00`);
        const end = new Date(`${date}T${endTimeInput}:00`);

        if (end <= start) {
          alert("End time must be later than start time.");
          return;
        }

        const token = getCookie("token");
        if (!token) {
          alert("Token is missing.");
          return;
        }

        let currentStart = new Date(start);
        const slots = [];

        while (currentStart < end) {
          let slotEnd = new Date(currentStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + duration);

          if (slotEnd > end) break;

          slots.push({
            appointment_date: date,
            start_time: currentStart.toISOString().slice(11, 19),
            end_time: slotEnd.toISOString().slice(11, 19),
          });

          currentStart = slotEnd;
        }

        if (slots.length > 0) {
          console.log({
            currentStart: currentStart,
            end: end,
          });
          console.log("Slots Payload:", JSON.stringify(slots));
          fetch("http://localhost:3000/actionPlanner/create-slot", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(slots),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Response Data:", data);
              closeForm(formContainer, overlay);
              loadSlots(); // Refresh the slots after creating new ones
              calendar.refetchEvents(); // Refresh events on the calendar
            })
            .catch((err) => {
              console.error("Error saving slot data:", err);
            });
        } else {
          alert("No valid slots generated.");
        }
      } else {
        alert("Please fill in all fields.");
      }
    });

    document.getElementById("cancel").addEventListener("click", () => {
      closeForm(formContainer, overlay);
    });

    overlay.addEventListener("click", () => {
      closeForm(formContainer, overlay);
    });
  }

  function closeForm(formContainer, overlay) {
    formContainer.remove();
    overlay.remove();
  }
});
