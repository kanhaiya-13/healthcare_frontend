document.addEventListener("DOMContentLoaded", async () => {
  const navLinks = document.querySelector(".nav-links ul");

  // Helper function to get a specific cookie value
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

  try {
    // Retrieve the token from cookies
    const token = getCookie("token");

    if (!token) {
      throw new Error("No token found in cookies");
    }

    // Check session status
    const response = await fetch("http://localhost:3000/users/verify", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send the token in the headers
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      if (data.isLoggedIn) {
        // Default image in case profile picture is missing
        const defaultImage = "../photos/google-icon.png";
        const profilePicture = data.profilePicture || defaultImage;

        // Determine the profile link based on the user's role
        let profileLink = ""; // Default profile page
        if (data.user.role === "doctor") {
          profileLink = "/frontend/html/doctor/dashBoard.html";
        } else if (data.user.role === "patient") {
          profileLink = "/frontend/html/patient/dashBoard.html";
        } else if (data.user.role === "receptionist") {
          profileLink = "/frontend/receptionist-dashboard.html";
        }

        // Display user's name and profile picture
        navLinks.innerHTML = `
          <li><a href="#home">HOME</a></li>
          <li><a href="#about">ABOUT US</a></li>
          <li><a href="#services">SERVICES</a></li>
          <li><a href="${profileLink}">
            <img src="${profilePicture}" alt="Profile" style="width:30px; height:30px; border-radius:50%;" />
            ${data.user.email}
          </a></li>
        `;
      } else {
        // If session expired or not logged in, show login and signup links
        navLinks.innerHTML = `
          <li><a href="#home">HOME</a></li>
          <li><a href="#about">ABOUT US</a></li>
          <li><a href="#services">SERVICES</a></li>
          <li><a href="./login.html">Login</a></li>
          <li><a href="./signup.html">SignUp</a></li>
        `;
      }
    } else {
      // Handle errors like invalid token or unauthorized access
      throw new Error("Failed to fetch session status");
    }
  } catch (error) {
    console.error("Error checking session status:", error);
    // Fallback to login/signup links on error
    navLinks.innerHTML = `
      <li><a href="#home">HOME</a></li>
      <li><a href="#about">ABOUT US</a></li>
      <li><a href="#services">SERVICES</a></li>
      <li><a href="html/login.html">Login</a></li>
      <li><a href="html/signup.html">SignUp</a></li>
    `;
  }
});
