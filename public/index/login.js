// Function to validate login credentials
function validateLogin(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    
    // Get the username and password values
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Check if the username and password are both "admin"
    if (username === "admin" && password === "admin") {
        // Redirect to the home page after successful login
        window.location.href = "home.html";  // Redirects to home.html
    } else {
        // If incorrect, show error message
        document.getElementById("error").style.display = "block";
    }
}
