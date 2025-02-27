document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const role = document.getElementById('role').value;

    // Validate form fields
    if (!email || !password || !confirmPassword || !role) {
        document.getElementById('message').innerHTML = `<p style="color: red;">All fields are required!</p>`;
        return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        document.getElementById('message').innerHTML = `<p style="color: red;">Passwords do not match!</p>`;
        return;
    }

    // Create the user object
    const userData = {
        email: email,
        password: password,
        role: role,
    };
    console.log("Form data being sent:", userData);


    try {
        // Send the user data to the server
        const response = await fetch('http://localhost:3000/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        // Handle the server's response
        const result = await response.json();

        if (response.ok) {
            // Success message
            document.getElementById('message').innerHTML = `<p style="color: green;">${result.message}</p>`;
            
            // Clear form fields
            document.getElementById('signupForm').reset();
        } else {
            // Error message
            document.getElementById('message').innerHTML = `<p style="color: red;">${result.message}</p>`;
        }
    } catch (error) {
        // Handle any errors
        document.getElementById('message').innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
    }
});
