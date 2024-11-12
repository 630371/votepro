document.addEventListener('DOMContentLoaded', function () {
    const resultDiv = document.getElementById('result');

    // Regex for validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // At least 1 number, 1 special character, 1 uppercase letter, 1 lowercase letter, and minimum 8 characters
    const phoneRegex = /^\+\d{1,3}\d{10}$/; // Format: +<country code><number> (e.g., +6303719496)
    const voterIdRegex = /^[A-Z]{3}\d+$/; // Format: 3 uppercase letters followed by digits (e.g., ABC12345)

    // Toggle forms
    document.getElementById('toggleToSignup').addEventListener('click', function () {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
        resultDiv.innerHTML = ''; // Clear result messages
    });

    document.getElementById('toggleToLogin').addEventListener('click', function () {
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        resultDiv.innerHTML = ''; // Clear result messages
    });

    // Sign-up Function
    document.getElementById('signupButton').addEventListener('click', function (event) {
        event.preventDefault();

        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const email = document.getElementById('signupEmail').value;
        const phone_number = document.getElementById('signupPhone').value;
        const voter_id = document.getElementById('signupVoterId').value;

        // Basic validation
        if (!username || !password || !email || !phone_number || !voter_id) {
            resultDiv.innerHTML = 'All fields are required!';
            return;
        }

        // Validate password
        if (!passwordRegex.test(password)) {
            resultDiv.innerHTML = 'Password must contain at least 1 number, 1 special character, 1 uppercase letter, and 1 lowercase letter, and be at least 8 characters long.';
            return;
        }

        // Validate phone number format
        if (!phoneRegex.test(phone_number)) {
            resultDiv.innerHTML = 'Phone number must be in the format +<country code><number> (e.g., +6303719496).';
            return;
        }

        // Validate voter ID format
        if (!voterIdRegex.test(voter_id)) {
            resultDiv.innerHTML = 'Voter ID must start with 3 uppercase letters followed by digits (e.g., ABC12345).';
            return;
        }

        // Create a payload object to send to the API
        const payload = {
            username: username,
            password: password,
            email: email,
            phone_number: phone_number,
            voter_id: voter_id
        };

        // Make the API call to the Lambda function
        fetch('https://zbd62f25ud.execute-api.ap-south-1.amazonaws.com/dev/sign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statusCode === 200) {
                    resultDiv.innerHTML = 'Signup successful! Please confirm your account.';
                    showConfirmationForm(); // Display the confirmation form
                } else {
                    handleErrorResponse(data.body); // Handle error response
                }
            })
            .catch(error => {
                console.error('Error during signup:', error);
                resultDiv.innerHTML = 'Error occurred during signup.';
            });
    });

    // Confirmation Function
    document.getElementById('confirmationButton').addEventListener('click', function (event) {
        event.preventDefault();

        const username = document.getElementById('confirmUsername').value;
        const confirmation_code = document.getElementById('confirmationCode').value;

        // Basic validation
        if (!username || !confirmation_code) {
            resultDiv.innerHTML = 'Both username and confirmation code are required!';
            return;
        }

        // Create a payload object to send to the API
        const payload = {
            username: username,
            confirmation_code: confirmation_code
        };

        // Make the API call to the Lambda function
        fetch('https://tbevbszh29.execute-api.ap-south-1.amazonaws.com/dev/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statusCode === 200) {
                    resultDiv.innerHTML = 'User confirmed successfully! You can now log in.';
                    showLoginForm(); // Display the login form
                } else {
                    handleErrorResponse(data.body); // Handle error response
                }
            })
            .catch(error => {
                console.error('Error during confirmation:', error);
                resultDiv.innerHTML = 'Error occurred during confirmation.';
            });
    });

    // Login Function
    document.getElementById('loginButton').addEventListener('click', function (event) {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        // Basic validation
        if (!username || !password) {
            resultDiv.innerHTML = 'Both username and password are required!';
            return;
        }

        // Create a payload object to send to the API
        const payload = {
            username: username,
            password: password
        };

        // Make the API call to the Lambda function for login
        fetch('https://mbpt69r9p0.execute-api.ap-south-1.amazonaws.com/prod/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.statusCode === 200) {
                resultDiv.innerHTML = 'Login successful';
                showVoteForm(); // Show the voting form
            } else {
                handleErrorResponse(data.body); // Handle error response
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            resultDiv.innerHTML = `Error occurred during login: ${error.message}`;
        });
    });

    function showConfirmationForm() {
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('confirmationForm').style.display = 'block'; // Show confirmation form
    }

    function showLoginForm() {
        document.getElementById('confirmationForm').style.display = 'none'; // Hide confirmation form
        document.getElementById('loginForm').style.display = 'block'; // Show login form
    }

    function showVoteForm() {
        document.getElementById('loginForm').style.display = 'none'; // Hide login form
        document.getElementById('signupForm').style.display = 'none'; // Hide signup form
        document.getElementById('confirmationForm').style.display = 'none'; // Hide confirmation form
        document.getElementById('voteForm').style.display = 'block'; // Show voting form
        document.getElementById('fetchResultsButton').style.display = 'block'; // Show fetch results button
    }

    function handleErrorResponse(errorBody) {
        const errorMessage = JSON.parse(errorBody);
        if (errorMessage.error) {
            resultDiv.innerHTML = `Error: ${errorMessage.error}`;
        } else if (errorMessage.includes('duplicate')) {
            resultDiv.innerHTML = 'Error: Voter ID already exists. Please use a different Voter ID.';
        } else {
            resultDiv.innerHTML = `Error: ${errorMessage}`;
        }
    }

const voteForm = document.getElementById('vote'); // Voting form
if (voteForm) {
    voteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const voter_id = document.getElementById('voter_id').value;
        const party = document.querySelector('input[name="party"]:checked').value;

        const voteUrl = 'https://lwldc61nkc.execute-api.ap-south-1.amazonaws.com/dev/store'; // Replace with your actual endpoint

        fetch(voteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voter_id: voter_id, party: party })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.json();
        })
        .then(data => {
            alert(data.body); // Show the success message
            voteForm.reset(); // Reset the form after a successful vote
        })
        .catch(error => {
            console.error('Error during voting:', error);
            alert('Failed to cast vote.'); // Show error message
        });
    });
}
if (fetchResultsButton) {
    fetchResultsButton.addEventListener('click', function() {
        const resultsSection = document.getElementById('resultsSection');
        const resultsElement = document.getElementById('results');

        fetch('https://robq9lwu0h.execute-api.ap-south-1.amazonaws.com/dev/fetch') // Replace with your actual endpoint
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.json();
        })
        .then(data => {
            console.log('Fetched results:', data); // Log the fetched results for debugging

            // Parse the body to access total_votes, party_votes, and party_vote_percentages
            const responseBody = JSON.parse(data.body);

            // Create a table for displaying results
            let tableHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px;">Party</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Votes Polled</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Vote Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Populate table with party votes and percentages
            Object.entries(responseBody.party_votes).forEach(([party, votes]) => {
                const percentage = responseBody.party_vote_percentages[party] || 0; // Get vote percentage for each party
                tableHTML += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${party.toUpperCase()}</td> <!-- Display party name -->
                        <td style="border: 1px solid #ddd; padding: 8px;">${votes}</td> <!-- Display votes polled -->
                        <td style="border: 1px solid #ddd; padding: 8px;">${percentage.toFixed(2)}%</td> <!-- Display vote percentage -->
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
                <strong>Total Votes:</strong> ${responseBody.total_votes}
            `; // Add total votes at the bottom

            resultsElement.innerHTML = tableHTML; // Set inner HTML to table
            resultsSection.style.display = 'block'; // Show results section
        })
        .catch(error => {
            console.error('Error fetching results:', error);
            alert('Failed to fetch results.');
        });
    });
}
});

