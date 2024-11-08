const FLASK_API_URL = 'https://192.168.1.5:5000/testing'; // Set to the URL of your Flask API

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.status === 200) {
        document.getElementById("login-message").textContent = data.message;
        document.getElementById("login-section").style.display = "none";
        document.getElementById("app-section").style.display = "block";

        // Load additional scripts based on role
        if (data.role === "admin") {
            loadScript("admin.js");
        } else {
            loadScript("user.js");
        }
    } else {
        document.getElementById("login-message").textContent = data.message;
    }
}

function logout() {
    document.getElementById("app-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("login-message").textContent = "";
}

function loadScript(src) {
    const script = document.createElement("script");
    script.src = src;
    document.head.appendChild(script);
}
function previewImage() {
    const fileInput = document.getElementById('fileInput');
    const uploadedImage = document.getElementById('uploadedImage');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

async function classifyImage() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files[0]) {
        alert('Please upload an image');
        return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]); // Append the image to FormData with key 'image'

    document.getElementById('result').innerText = 'Processing...';

    try {
        const response = await fetch(FLASK_API_URL, { // Make the POST request to your Flask API
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json(); // Parse the response JSON
            console.log(result); // Debug log

            // Access the first element of classification_probabilities and grading_probabilities arrays
            const classProbability = result.classification_probabilities[0] ? result.classification_probabilities[0] : [];
            const gradeProbability = result.grading_probabilities[0] ? result.grading_probabilities[0] : [];

            if (classProbability.length > 0 && gradeProbability.length > 0) {
                // Get the maximum probability from the classification probabilities (assuming the first element is the highest probability)
                const maxClassProb = Math.max(...classProbability);
                // Get the maximum probability from the grading probabilities (assuming the first element is the highest probability)
                const maxGradeProb = Math.max(...gradeProbability);

                document.getElementById('result').innerHTML = `
                    <strong>Predicted Class:</strong> ${result.predicted_class} (Probability: ${(maxClassProb * 100).toFixed(2)}%)<br>
                    <strong>Predicted Grade:</strong> ${result.predicted_grade} (Probability: ${(maxGradeProb * 100).toFixed(2)}%)
                `;
            } else {
                document.getElementById('result').innerText = 'Error: Invalid probabilities returned from API';
            }
        } else {
            // If response is not OK, display the error message returned by the API
            const errorData = await response.json(); // Attempt to get error details
            document.getElementById('result').innerText = `Error: ${errorData.message || 'Unknown error occurred'}`;
        }
    } catch (error) {
        // Handle network or server errors
        document.getElementById('result').innerText = 'Error connecting to API. Please try again later.';
    }
}



if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log("Service Worker registered", reg))
            .catch(err => console.error("Service Worker registration failed", err));
    });
}

