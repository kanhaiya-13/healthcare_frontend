document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
  
    // Utility to get a cookie value by name
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }
  
    // Helper: Normalize date to remove timezone offset
    function normalizeDate(date) {
      const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
      return new Date(date.getTime() - offset).toISOString().split("T")[0];
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
        // Prevent selecting past dates
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
      events: [], // Placeholder for dynamically loaded slots
    });
  
    calendar.render();
  
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
          <input type="date" id="date" value="${normalizeDate(startTime)}" readonly>
          
          <label>Start Time:</label>
          <input type="time" id="startTime" value="${startTime.toISOString().slice(11, 16)}">
          
          <label>End Time:</label>
          <input type="time" id="endTime" value="${endTime.toISOString().slice(11, 16)}">
          
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
        const date = document.getElementById("date").value; // `yyyy-mm-dd`
        const startTime = document.getElementById("startTime").value; // `hh:mm`
        const endTime = document.getElementById("endTime").value; // `hh:mm`
        const duration = parseInt(document.getElementById("slotDuration").value);
    
        console.log("Title:", title);
        console.log("Date:", date);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Duration:", duration);
    
        if (title && date && startTime && endTime && duration) {
            // Validate if endTime is after startTime
            const start = new Date(`${date}T${startTime}`);
            const end = new Date(`${date}T${endTime}`);
    
            console.log("Start DateTime:", start);
            console.log("End DateTime:", end);
    
            if (end <= start) {
                alert("End time must be later than start time.");
                console.error("End time is not later than start time.");
                return;
            }
    
            const token = getCookie("token");
            console.log("Token:", token);
            if (!token) {
                alert("Token is missing.");
                console.error("Token is missing.");
                return;
            }
    
            // Generate slots based on the start time, end time, and duration
            let currentStart = new Date(start);
            const slots = [];
    
            while (currentStart < end) {
                let slotEnd = new Date(currentStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + duration);
    
                // Ensure slotEnd does not exceed the overall end time
                if (slotEnd > end) break;
    
                // Prepare slot object for each slot
                const slot = {
                    appointment_date: date,
                    start_time: currentStart.toISOString().slice(11, 19), // Format as "hh:mm:ss"
                    end_time: slotEnd.toISOString().slice(11, 19), // Format as "hh:mm:ss"
                };
    
                slots.push(slot);
    
                // Move to the next slot
                currentStart = slotEnd;
            }

            console.log(slots);
            // Send all slots to the server
            if (slots.length > 0) {
                fetch("http://localhost:3000/schedule/create-slot", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                   
                    body: JSON.stringify(slots), // Send all slots as an array
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("Response Data:", data);
                        // You can add the slots to the calendar here if needed
                        // calendar.addEventSource(newSlots);
                        closeForm(formContainer, overlay);
                    })
                    .catch((err) => {
                        console.error("Error saving slot data:", err);
                    });
            } else {
                alert("No valid slots generated.");
                console.error("No valid slots generated.");
            }
        } else {
            alert("Please fill in all fields.");
            console.error("Fields are missing.");
        }
    });
    
      
      
      
  
      // Cancel form
      document.getElementById("cancel").addEventListener("click", () => {
        closeForm(formContainer, overlay);
      });
  
      overlay.addEventListener("click", () => {
        closeForm(formContainer, overlay);
      });
    }
  
    // Close form
    function closeForm(formContainer, overlay) {
      formContainer.remove();
      overlay.remove();
    }
  
    // Generate slots dynamically based on the given duration
    function generateSlots(start, end, duration, title) {
      const slots = [];
      let currentTime = new Date(start);
  
      while (currentTime < end) {
        const slotStart = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + duration);
        const slotEnd = new Date(currentTime);
  
        slots.push({
          title: `${title} - Available Slot`,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          allDay: false,
          color: "green", // Green color for available slots
        });
      }
      return slots;
    }
  
    // Fetch and display existing slots on the calendar
    // Fetch and display existing slots on the calendar
  // function fetchDoctorSlots() {
  //   const token = getCookie("token");
  
  //   if (!token) {
  //     console.error("Token is missing. Unable to fetch slots.");
  //     return;
  //   }
  
  //   fetch("http://localhost:3000/actionPlanner/get-booked-slots", {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((res) => {
  //       if (!res.ok) {
  //         throw new Error(`API responded with status: ${res.status}`);
  //       }
  //       return res.json();
  //     })
  //     .then((data) => {
  //       console.log("Fetched slots:", data); // Log the response for debugging
  
  //       if (!data || !data.slots || !Array.isArray(data.slots)) {
  //         console.error("Unexpected response format:", data);
  //         return;
  //       }
  
  //       // Clear existing events before adding new ones
  //       calendar.removeAllEvents();
  
  //       // Map the slots into FullCalendar-compatible events
  //       const bookedSlots = data.slots
  //         .map((slot) => {
  //           const appointmentDate = slot.appointment_date; // Use the appointment_date directly
  //           const startTime = slot.start_time;
  //           const endTime = slot.end_time;
  
  //           // Combine the date and time for start and end times
  //           const slotStart = new Date(`${appointmentDate}T${startTime}`);
            
  //           // If end time is not available, calculate it from duration (you can adjust the duration as needed)
  //           let slotEnd = new Date(slotStart);
  //           const duration = 30; // assuming a default duration of 30 minutes (this can be adjusted)
  //           slotEnd.setMinutes(slotStart.getMinutes() + duration);
  
  //           // Only add the slot if both start and end times are valid
  //           if (slotStart && !isNaN(slotStart.getTime()) && slotEnd && !isNaN(slotEnd.getTime())) {
  //             return {
  //               title: `${slot.visit_Motive} - Booked`, // Title based on visit motive
  //               start: slotStart.toISOString(),
  //               end: slotEnd.toISOString(), // Correct end time from database (or calculated)
  //               allDay: false,
  //               color: "red", // Red color for booked slots
  //             };
  //           }
  //         })
  //         .filter(Boolean); // Remove any invalid or empty slots
  
  //       // Add the fetched slots to the calendar
  //       calendar.addEventSource(bookedSlots);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching slots:", err);
  //     });
  // }
  
  // fetchDoctorSlots();
  
    // Periodically refresh booked slots every 3 seconds
    setInterval(() => {
      console.log("Refreshing booked slots...");
      // fetchDoctorSlots();
    }, 3000); // 3000 ms = 3 seconds
  });
  