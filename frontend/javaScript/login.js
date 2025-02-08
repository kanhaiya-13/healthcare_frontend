document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate inputs
    if (!email || !password) {
      document.getElementById(
        "message"
      ).innerHTML = `<p style="color: red;">Both fields are required!</p>`;
      return;
    }

    try {
      // Send login request to the server
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const { token, redirectUrl } = result; // Get the redirect URL from the server
        document.cookie = `token=${token}; path=/; max-age=3600; secure`; // Set the token in a cookie that expires in 1 hour
        document.getElementById(
          "message"
        ).innerHTML = `<p style="color: green;">Login successful. Redirecting...</p>`;
        window.location.href = redirectUrl; // Redirect to the appropriate page
      } else {
        document.getElementById(
          "message"
        ).innerHTML = `<p style="color: red;">${result.message}</p>`;
      }
    } catch (error) {
      document.getElementById(
        "message"
      ).innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
    }
  });
