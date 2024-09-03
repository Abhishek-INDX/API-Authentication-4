<script>
    import { onMount } from 'svelte';

    let users = [];
    let page = 1;
    let limit = 10;
    let totalPages = 1;
    let errorMessage = "";

    let gender = "";
    let title = "";
    let firstName = "";
    let lastName = "";
    let email = "";
    let dobDate = "";
    let dobAge = "";
    let registeredDate = "";
    let registeredAge = "";
    let phone = "";
    let cell = "";
    let idName = "";
    let idValue = "";
    let picture = "";
    let nationality = "";
    let formErrorMessage = "";

    let signupEmail = "";
    let password = "";
    let confirmPassword = "";
    let signupErrorMessage = "";

    let loginEmail = "";
    let loginPassword = "";
    let loginErrorMessage = "";

    let currentPage = 'login'; // 'login', 'signup', or 'data'

    onMount(() => {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId && currentPage === 'login') {
            currentPage = 'data';
            fetchData();
            startSessionTimer();
        }
    });

    function startSessionTimer() {
        setTimeout(async () => {
            await logout();
            alert("Session expired. Please log in again.");
        }, 1000*60); // Logout after 5 sec
    }

    function validatePassword(pwd) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/;
        const hasLowerCase = /[a-z]/;
        const hasDigit = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        return pwd.length >= minLength &&
               hasUpperCase.test(pwd) &&
               hasLowerCase.test(pwd) &&
               hasDigit.test(pwd) &&
               hasSpecialChar.test(pwd);
    }

    async function signup() {
        if (!signupEmail || !password || !confirmPassword) {
            signupErrorMessage = "All fields are required.";
            return;
        }

        if (password !== confirmPassword) {
            signupErrorMessage = "Passwords do not match.";
            return;
        }

        if (!validatePassword(password)) {
            signupErrorMessage = "Password must be at least 8 characters long and include uppercase, lowercase, digits, and special characters.";
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail, password })
            });

            if (response.ok) {
                currentPage = 'login';
            } else {
                const result = await response.json();
                signupErrorMessage = result.error || "Signup failed.";
            }
        } catch (error) {
            signupErrorMessage = "Signup failed.";
            console.error(error);
        }
    }

    async function login() {
        if (!loginEmail || !loginPassword) {
            loginErrorMessage = "Email and password are required.";
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('sessionId', result.sessionId);
                currentPage = 'data';
                fetchData();
                startSessionTimer();
            } else {
                const result = await response.json();
                loginErrorMessage = result.error || "Login failed.";
            }
        } catch (error) {
            loginErrorMessage = "Login failed.";
            console.error(error);
        }
    }

    async function logout() {
        const sessionId = localStorage.getItem('sessionId');
        localStorage.removeItem('sessionId');
        
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            currentPage = 'login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async function fetchData() {
        try {
            const response = await fetch('/api/get-users');
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const totalUsers = data.length;
            totalPages = Math.ceil(totalUsers / limit);
            users = data.slice((page - 1) * limit, page * limit);
        } catch (error) {
            errorMessage = "Failed to load data.";
            console.error(error);
        }
    }

    function updateParams(newPage) {
        if (newPage < 1 || newPage > totalPages) return;
        page = newPage;
        fetchData();
    }

    function goToPage() {
        const pageInput = document.getElementById('pageInput');
        const inputPage = parseInt(pageInput.value, 10);

        if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
            updateParams(inputPage);
        } else {
            errorMessage = 'Please enter a valid page number.';
        }
    }

    async function addUser() {
    // Validation to check if all required fields are filled
    if (!gender || !title || !firstName || !lastName || !email || !dobDate || !dobAge || !registeredDate || !registeredAge || !phone || !cell || !idName || !idValue || !picture || !nationality) {
        errorMessage = "All the details required.";
        return;
    }

    // Create a new user object with the form data
    const newUser = {
        gender,
        name: {
            title,
            first: firstName,
            last: lastName,
        },
        email,
        dob: {
            date: dobDate,
            age: dobAge,
        },
        registered: {
            date: registeredDate,
            age: registeredAge,
        },
        phone,
        cell,
        id: {
            name: idName,
            value: idValue,
        },
        picture: {
            thumbnail: picture,
        },
        nat: nationality,
    };

    try {
        // Send a POST request to add the new user
        const response = await fetch('/api/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        // Check if the response is OK
        if (response.ok) {
            // Fetch updated user data and clear the form
            fetchData();
            clearForm();
        } else {
            // Handle server-side errors
            errorMessage = 'Failed to add user.';
        }
    } catch (error) {
        // Handle client-side errors
        errorMessage = 'Failed to add user.';
        console.error(error);
    }
}

    function clearForm() {
        gender = "";
        title = "";
        firstName = "";
        lastName = "";
        email = "";
        dobDate = "";
        dobAge = "";
        registeredDate = "";
        registeredAge = "";
        phone = "";
        cell = "";
        idName = "";
        idValue = "";
        picture = "";
        nationality = "";
    }
</script>


{#if currentPage === 'login'}
    <h1 class="center-heading">Login</h1>
<div class="form-container">
    <div class="form-group">
        <label for="loginEmail">Email</label>
        <input type="email" id="loginEmail" placeholder="Email" bind:value={loginEmail} />
        <label for="loginPassword">Password</label>
        <input type="password" id="loginPassword" placeholder="Password" bind:value={loginPassword} />
        <button on:click={login}>Login</button>
        {#if loginErrorMessage}
            <p style="color: red;">{loginErrorMessage}</p>
        {/if}
        <p><button on:click={() => currentPage = 'signup'}>Sign Up</button></p>
    </div>
</div>
{/if}

{#if currentPage === 'signup'}
    <h1 class="center-heading">Sign Up</h1>
<div class="form-container">
    <div class="form-group">
        <label for="signupEmail">Email</label>
        <input type="email" id="signupEmail" placeholder="Email" bind:value={signupEmail} />
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Password" bind:value={password} />
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" placeholder="Confirm Password" bind:value={confirmPassword} />
    </div>
    <div class="form-group">
        <button on:click={signup}>Sign Up</button>
    </div>
        {#if signupErrorMessage}
            <p style="color: red;">{signupErrorMessage}</p>
        {/if}
    <div class="form-group">
        <p><button on:click={() => currentPage = 'signup'}>Login</button></p>
    </div>
</div>
{/if}

{#if currentPage === 'data'}
    <h1 class="center-heading">User Details</h1>

<div class="form-container">
    <div class="form-group">
        <label for="gender">Gender</label>
        <input
            type="text"
            id="gender"
            placeholder="Gender"
            bind:value={gender}
        />
    </div>
    <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" placeholder="Title" bind:value={title} />
    </div>
    <div class="form-group">
        <label for="firstName">First Name</label>
        <input
            type="text"
            id="firstName"
            placeholder="First Name"
            bind:value={firstName}
        />
    </div>
    <div class="form-group">
        <label for="lastName">Last Name</label>
        <input
            type="text"
            id="lastName"
            placeholder="Last Name"
            bind:value={lastName}
        />
    </div>
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="Email" bind:value={email} />
    </div>
    <div class="form-group">
        <label for="dobDate">Date of Birth</label>
        <input
            type="date"
            id="dobDate"
            placeholder="Date of Birth"
            bind:value={dobDate}
        />
    </div>
    <div class="form-group">
        <label for="dobAge">Age</label>
        <input
            type="number"
            id="dobAge"
            placeholder="Age"
            bind:value={dobAge}
        />
    </div>
    <div class="form-group">
        <label for="registeredDate">Registered Date</label>
        <input
            type="date"
            id="registeredDate"
            placeholder="Registered Date"
            bind:value={registeredDate}
        />
    </div>
    <div class="form-group">
        <label for="registeredAge">Registered Age</label>
        <input
            type="number"
            id="registeredAge"
            placeholder="Registered Age"
            bind:value={registeredAge}
        />
    </div>
    <div class="form-group">
        <label for="phone">Phone</label>
        <input type="text" id="phone" placeholder="Phone" bind:value={phone} />
    </div>
    <div class="form-group">
        <label for="cell">Cell</label>
        <input type="text" id="cell" placeholder="Cell" bind:value={cell} />
    </div>
    <div class="form-group">
        <label for="idName">ID Name</label>
        <input
            type="text"
            id="idName"
            placeholder="ID Name"
            bind:value={idName}
        />
    </div>
    <div class="form-group">
        <label for="idValue">ID Value</label>
        <input
            type="text"
            id="idValue"
            placeholder="ID Value"
            bind:value={idValue}
        />
    </div>
    <div class="form-group">
        <label for="picture">Picture URL</label>
        <input
            type="text"
            id="picture"
            placeholder="Picture URL"
            bind:value={picture}
        />
    </div>
    <div class="form-group">
        <label for="nationality">Nationality</label>
        <input
            type="text"
            id="nationality"
            placeholder="Nationality"
            bind:value={nationality}
        />
    </div>
    <div class="form-group">
        <button type="button" on:click={addUser}>Add User</button>
    </div>
</div>

<div>
    <label for="limitInput">Limit:</label>
    <input type="number" id="limitInput" bind:value={limit} min="1" />
    <button on:click={() => fetchData()}>Submit</button>
</div>

<table class="table">
    <thead>
        <tr>
            <th>Gender</th>
            <th>Title</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Age</th>
            <th>Registered Date</th>
            <th>Registered Age</th>
            <th>Phone</th>
            <th>Cell</th>
            <th>ID Name</th>
            <th>ID Value</th>
            <th>Picture</th>
            <th>Nationality</th>
        </tr>
    </thead>
    <tbody>
        {#each users as user}
            <tr>
                <td>{user.gender}</td>
                <td>{user.name.title}</td>
                <td>{user.name.first}</td>
                <td>{user.name.last}</td>
                <td>{user.email}</td>
                <td>{user.dob.date}</td>
                <td>{user.dob.age}</td>
                <td>{user.registered.date}</td>
                <td>{user.registered.age}</td>
                <td>{user.phone}</td>
                <td>{user.cell}</td>
                <td>{user.id.name}</td>
                <td>{user.id.value}</td>
                <td
                    ><img
                        class="img"
                        src={user.picture.thumbnail}
                        alt=""
                        width="50"
                    /></td
                >
                <td>{user.nat}</td>
            </tr>
        {/each}
    </tbody>
</table>

<div class="pagination-controls">
    <button on:click={() => updateParams(1)} disabled={page <= 1}
        >&laquo;</button
    >
    <button on:click={() => updateParams(page - 1)} disabled={page <= 1}
        >&lt;</button
    >
    <span id="pageDisplay">
        Page <input
            type="number"
            id="pageInput"
            min="1"
            value={page}
            on:change={goToPage}
        />
        of {totalPages}
    </span>
    <button
        on:click={() => updateParams(page + 1)}
        disabled={page >= totalPages}>&gt;</button
    >
    <button
        on:click={() => updateParams(totalPages)}
        disabled={page >= totalPages}>&raquo;</button
    >
    <div id="errorMessage">{errorMessage}</div>

        <button on:click={logout}>Logout</button>
    </div>
{/if}


<style>
    /* Table Styles */
    .table {
        width: 100%;
        border-collapse: collapse;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        overflow: hidden;
    }

    /* Table Header */
    .table thead {
        background-color: #f5f6f9;
    }

    .table thead th {
        padding: 15px;
        text-align: left;
        font-size: 14px;
        font-weight: 600;
        color: #8685a6;
        border-bottom: 2px solid #eaeaea;
    }

    /* Table Body */
    .table tbody {
        background-color: #ffffff;
    }

    .table tbody tr {
        border-bottom: 1px dotted #8d8daa;
    }

    .table tbody tr:last-child {
        border-bottom: none;
    }

    .table tbody td:nth-child(1) {
        color: #348fbe;
    }

    .table tbody tr:hover {
        background-color: #f1f1f1;
    }

    .table tbody td {
        padding: 15px;
        font-size: 14px;
        color: #656565;
    }

    .img {
        border-radius: 50%;
        height: 50px;
    }

    .pagination-controls {
        display: flex;
        justify-content: center; /* Center-align pagination controls */
        align-items: center; /* Vertically center-align items */
        margin-top: 20px;
    }

    .pagination-controls button {
        margin: 0 8px; /* Increased margin for better spacing */
        padding: 8px 15px; /* Increased padding for a more prominent button */
        font-size: 1rem; /* Adjust font size for balance */
        border: 2px solid transparent; /* Border for accessibility and styling */
        background-color: #007bff; /* Primary button color */
        color: white;
        border-radius: 6px; /* Slightly larger radius for a modern look */
        cursor: pointer;
        transition:
            background-color 0.3s,
            border-color 0.3s; /* Smooth transition effects */
    }

    .pagination-controls button:hover {
        background-color: #0056b3; /* Darker shade on hover */
        border-color: #0056b3; /* Match border color with hover background */
    }

    .pagination-controls button:disabled {
        background-color: #d6d6d6; /* Disabled button background */
        color: #a0a0a0; /* Disabled button text color */
        cursor: not-allowed;
        border-color: #d6d6d6; /* Match border color with disabled background */
    }

    #pageDisplay {
        margin: 0 12px; /* Increased margin for better spacing */
        font-weight: bold;
        font-size: 1.1rem; /* Adjust font size for readability */
    }

    #pageInput {
        width: 80px; /* Slightly narrower input field */
        padding: 5px; /* Added padding for better input field appearance */
        text-align: center; /* Center-align text for better alignment */
        font-size: 1rem; /* Adjust font size for balance */
        border: 2px solid #ccc; /* Border color for input field */
        border-radius: 4px; /* Rounded corners for input field */
    }

    #errorMessage {
        color: red;
        font-size: 0.9rem; /* Slightly smaller font size for error message */
        margin-top: 10px;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        align-items: stretch; /* Ensure elements take the full width of the container */
        max-width: 400px; /* Set a max width for readability */
        margin: 0 auto; /* Center the form horizontally */
        padding: 20px; /* Add padding inside the form */
        border: 1px solid #ddd; /* Light border for the form */
        border-radius: 8px; /* Rounded corners for the form */
        background-color: #f9f9f9; /* Light background for the form */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
    }

    .form-group {
        display: flex;
        flex-direction: column; /* Arrange label and input vertically */
        margin-bottom: 15px; /* Space between form groups */
    }

    .form-group label {
        font-size: 14px; /* Font size for labels */
        margin-bottom: 5px; /* Space between label and input */
        color: #333; /* Darker color for labels for better readability */
    }

    .form-group input {
        padding: 10px; /* Padding inside input fields */
        font-size: 16px; /* Font size for input text */
        border: 1px solid #ccc; /* Border color for inputs */
        border-radius: 4px; /* Rounded corners for inputs */
        width: 100%; /* Full width of the container */
    }

    .form-group input:focus {
        border-color: #007bff; /* Change border color on focus */
        outline: none; /* Remove default outline */
    }

    .form-group button {
        padding: 10px; /* Padding inside button */
        font-size: 16px; /* Font size for button text */
        border-radius: 4px; /* Rounded corners for button */
        border: none; /* Remove default border */
        background-color: #007bff; /* Background color for button */
        color: #fff; /* Text color for button */
        cursor: pointer; /* Pointer cursor on hover */
        transition: background-color 0.3s ease; /* Smooth transition for background color */
        width: 100%; /* Full width of the container */
    }

    .form-group button:hover {
        background-color: #0056b3; /* Darker shade on hover */
    }
    .center-heading {
        text-align: center;
    }
</style>
