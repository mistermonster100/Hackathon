// Valid teacher-provided codes for certification
//should be able to add any code and class as long as you follow the correct format
const VALID_CODES = {
    "M-A1": { subject: "Math", className: "Algebra 1" },
    "M-GE": { subject: "Math", className: "Geometry" },
    "M-A2": { subject: "Math", className: "Algebra 2" },
    "M-PC": { subject: "Math", className: "Precalculus" },
    "M-CAB": { subject: "Math", className: "Calculus AB" },
    "M-CBC": { subject: "Math", className: "Calculus BC" },
    "M-C3": { subject: "Math", className: "Calculus 3" },

    "E-9": { subject: "English", className: "English 9" },
    "E-10": { subject: "English", className: "English 10" },
    "E-11": { subject: "English", className: "English 11" },
    "E-12": { subject: "English", className: "English 12" },

    "S-WH": { subject: "Social Studies", className: "World History" },
    "S-APH": { subject: "Social Studies", className: "AP World History" },
    "S-UH": { subject: "Social Studies", className: "US History" },
    "S-APU": { subject: "Social Studies", className: "AP US History" },
    "S-EH": { subject: "Social Studies", className: "European History" },
    "S-APM": { subject: "Social Studies", className: "AP Microeconomics" },  // 🆕 Added
    "S-APMA": { subject: "Social Studies", className: "AP Macroeconomics" }, // 🆕 Added

    "P-1": { subject: "Physics", className: "Physics 1" },
    "P-2": { subject: "Physics", className: "Physics 2" },
    "P-C": { subject: "Physics", className: "Physics C" },

    "C-HC": { subject: "Chemistry", className: "Honors Chemistry" },
    "C-AP": { subject: "Chemistry", className: "AP Chemistry" },

    "CS-P": { subject: "Computer Science", className: "CS Principles" },
    "CS-1": { subject: "Computer Science", className: "CS 1" },
    "CS-A": { subject: "Computer Science", className: "CS A" },

    "B-H": { subject: "Biology", className: "Honors Biology" },
    "B-AP": { subject: "Biology", className: "AP Biology" }
};


const subcategories = {
            "Math": ["Algebra", "Geometry", "Algebra 2", "Precalculus", "Calculus AB", "Calculus BC", "Calculus 3"],
            "English": ["English 9", "English 10", "English 11", "English 12"],
            "Social Studies": ["World History", "AP World History", "US History", "AP US History", "European History"],
            "Physics": ["Physics 1", "Physics 2", "Physics C"],
            "Chemistry": ["Honors Chemistry", "ACP/AP Chemistry"],
            "Computer Science": ["CS Principles", "CS 1", "CS A", "Software Development"],
            "Biology": ["Honors Biology", "AP Biology"]
};

const MASTER_TEACHER_CODE = "PhiChargeEpsilonNot"; // I wonder what that means? ;) (Hint Gauss's Law)
function deleteTutor(email, code) {
    if (code !== MASTER_TEACHER_CODE) {
        alert("Invalid master code! You do not have permission to delete accounts.");
        return;
    }

    let tutors = JSON.parse(localStorage.getItem("tutors")) || [];

    // Check if the tutor exists
    const tutorIndex = tutors.findIndex(tutor => tutor.email === email);
    if (tutorIndex === -1) {
        alert("Tutor not found or already deleted.");
        return;
    }

    // Remove the tutor
    tutors.splice(tutorIndex, 1);
    localStorage.setItem("tutors", JSON.stringify(tutors));

    alert(`Tutor with email ${email} has been deleted.`);
    location.reload(); // Refresh the page to update the list
}

// Maximum skill levels for each subject
const MAX_LEVELS = [3, 2, 3, 2, 5, 4, 7]; // Aligns with subject ranges
const SUBJECTS = ["Computer Science", "Biology", "Physics", "Chemistry", "Social Studies", "English", "Math"];

// JSON Data placeholder
let jsonData = {};

// Load JSON data from `students.json`
async function loadJSON() {
    try {
        const response = await fetch("students.json");
        jsonData = await response.json();
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
}

// Save new tutors locally in `localStorage`
function saveTutors(tutors) {
    localStorage.setItem("tutors", JSON.stringify(tutors));
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load tutors from `localStorage` or `students.json`
function loadTutors() {
    const jsonTutors = jsonData.students || []; // Preset tutors from students.json
    const localTutors = JSON.parse(localStorage.getItem("tutors")) || []; // Tutors added before account system
    const accounts = JSON.parse(localStorage.getItem("accounts")) || []; // New tutors created via account system

    // Merge all tutor data sources
    const combinedTutors = [...jsonTutors, ...localTutors, ...accounts];

    // Remove duplicates based on unique email addresses
    const uniqueTutors = combinedTutors.filter((tutor, index, self) =>
        index === self.findIndex(t => t.email === tutor.email)
    );

    return uniqueTutors;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Update tutor's skill level
function updateSkill(tutor, code, level) {
    if (!VALID_CODES.hasOwnProperty(code)) {
        return { success: false, message: "Invalid teacher-provided code." };
    }

    const subjectIndex = VALID_CODES[code]; // Get the subject index based on VALID_CODES
    if (level < 0 || level > MAX_LEVELS[subjectIndex]) {
        return { success: false, message: `Invalid skill level for ${SUBJECTS[subjectIndex]}. Max level: ${MAX_LEVELS[subjectIndex]}` };
    }

    // Update the correct digit in the competency string
    const skillDigits = tutor.competency.split("").map(Number);
    skillDigits[subjectIndex] = level;
    tutor.competency = skillDigits.join("");

    return { success: true, message: `Successfully updated ${SUBJECTS[subjectIndex]} to level ${level}.` };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Add or update a tutor's profile
function updateTutor(email, code) {
    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    let tutorIndex = accounts.findIndex(acc => acc.email === email);

    if (tutorIndex === -1) {
        alert("Tutor account not found!");
        return;
    }

    if (!VALID_CODES.hasOwnProperty(code)) {
        alert("Invalid teacher code! Please enter a valid teacher-provided code.");
        return;
    }

    const tutor = accounts[tutorIndex];
    const { subject, className } = VALID_CODES[code];

    // Ensure competency & visibility exist
    if (!tutor.competency) tutor.competency = {};
    if (!tutor.visibility) tutor.visibility = {};

    if (!tutor.competency[subject]) {
        tutor.competency[subject] = [];
    }
    if (!tutor.visibility[subject]) {
        tutor.visibility[subject] = [];
    }

    // Add the class if it's not already present
    if (!tutor.competency[subject].includes(className)) {
        tutor.competency[subject].push(className);
        tutor.visibility[subject].push(className); // Default: Visible
    } else {
        alert(`Tutor is already qualified for ${className}`);
        return;
    }

    // Save updates
    accounts[tutorIndex] = tutor;
    localStorage.setItem("accounts", JSON.stringify(accounts));

    // Show confirmation & refresh Manage Account
    alert(`✅ Updated: ${tutor.name} is now qualified for ${className} in ${subject}`);
    loadTutorSubjects(); // Refresh Manage Account UI
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Find tutors based on selected subject and subcategory
async function findTutors() {
    await loadJSON(); // Load subjects.json

    const subject = document.getElementById("subject").value;
    const subcategory = document.getElementById("subcategory").value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!subject || !subcategory) {
        resultsDiv.innerHTML = "<p>Please select both a subject and a subcategory.</p>";
        return;
    }

    const tutors = await loadTutors();

    // Filter tutors based on visibility settings
    const filteredTutors = tutors.filter(tutor => 
        tutor.visibility?.[subject]?.includes(subcategory)
    );

    resultsDiv.innerHTML = filteredTutors.length
        ? filteredTutors.map(tutor => `
            <div class="tutor">
                <strong>${tutor.name}</strong><br>
                <strong>Qualified Classes:</strong> ${tutor.visibility[subject].join(", ")}<br>
                Email: <a href="mailto:${tutor.email}">${tutor.email}</a><br>
                Phone: ${tutor.phone || "N/A"}
            </div>
        `).join("")
        : `<p>No tutors found for ${subcategory}.</p>`;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function displayTutorClasses(tutor, subject, subjectIndex) {
    const tutorProficiency = parseInt(tutor.competency[subjectIndex]); // Tutor's proficiency level
    const classesQualified = jsonData.subjects[subject].slice(0, tutorProficiency); // All classes up to their level

    return `
        <div class="tutor">
            <strong>${tutor.name}</strong><br>
            <strong>Qualified Classes:</strong> ${classesQualified.join(", ")}<br>
            Email: <a href="mailto:${tutor.email}">${tutor.email}</a><br>
            Phone: ${tutor.phone || "N/A"}
        </div>
    `;
}
//////////////////////////////////////////////////////////////////////////////////////////////
function createAccount(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const studentID = document.getElementById("student-id").value.trim();
    const phone = document.getElementById("phone").value.trim() || "N/A";

    // Extract name from email (e.g., "john.doe" -> "John Doe")
    const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    if (accounts.some(account => account.email === email)) {
        document.getElementById("message").innerText = "⚠️ Account with this email already exists!";
        document.getElementById("message").style.color = "red";
        return;
    }

    // Create new tutor profile
    const newTutor = {
        name,
        email,
        phone,
        studentID,
        competency: "0000000" // Default competency
    };

    accounts.push(newTutor);
    localStorage.setItem("accounts", JSON.stringify(accounts));

    document.getElementById("message").innerText = "✅ Account created successfully!";
    document.getElementById("message").style.color = "green";

    // Clear the form fields
    document.getElementById("signup-form").reset();

    // Remove the success message after 3 seconds
    setTimeout(() => {
        document.getElementById("message").innerText = "";
    }, 3000);
}

// Attach event listener
document.getElementById("signup-form")?.addEventListener("submit", createAccount);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function showAccountDetails(account) {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("account-section").style.display = "block";

    document.getElementById("account-name").innerText = account.email.split('@')[0];
    document.getElementById("account-email").innerText = account.email;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function addSkill() {
    const code = document.getElementById("teacher-code").value;
    const account = JSON.parse(localStorage.getItem("loggedInAccount"));

    if (!VALID_CODES.hasOwnProperty(code)) {
        alert("Invalid teacher code!");
        return;
    }

    const { subject, level } = VALID_CODES[code];
    const subjectIndex = SUBJECTS.indexOf(subject);

    let skillDigits = account.competency.split("").map(Number);
    skillDigits[subjectIndex] = level;
    account.competency = skillDigits.join("");

    // Update account in localStorage
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    const accountIndex = accounts.findIndex(acc => acc.email === account.email);
    accounts[accountIndex] = account;

    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("loggedInAccount", JSON.stringify(account));

    alert(`Skill for ${subject} updated to level ${level}.`);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function logout() {
    localStorage.removeItem("loggedInAccount");
    location.reload();
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function loginAccount(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const studentID = document.getElementById("login-student-id").value.trim();

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const account = accounts.find(acc => acc.email === email && acc.studentID === studentID);

    if (!account) {
        document.getElementById("account-message").innerText = "Invalid email or student ID!";
        return;
    }

    // Store session data in localStorage
    localStorage.setItem("loggedInAccount", JSON.stringify(account));

    // Redirect to dashboard
    window.location.href = "dashboard.html";
}

// Attach login event listener
document.getElementById("login-form")?.addEventListener("submit", loginAccount);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function loadDashboard() {
    const account = JSON.parse(localStorage.getItem("loggedInAccount"));

    if (!account) {
        alert("You must log in first!");
        window.location.href = "manage_account.html";
        return;
    }

    // Populate dashboard with user info
    document.getElementById("account-name").innerText = account.name || account.email.split('@')[0];
    document.getElementById("account-email").innerText = account.email;
}

// Attach function to run when dashboard loads
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        loadDashboard();
    }
});

function logout() {
    localStorage.removeItem("loggedInAccount");
    window.location.href = "manage_account.html";
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function loadTutorSubjects() {
    const account = JSON.parse(localStorage.getItem("loggedInAccount"));
    if (!account || !account.competency) return;

    const container = document.getElementById("subjects-container");
    container.innerHTML = "";

    Object.keys(account.competency).forEach(subject => {
        const subjectDiv = document.createElement("div");
        subjectDiv.innerHTML = `<h3>${subject}</h3>`;

        account.competency[subject].forEach(className => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = account.visibility?.[subject]?.includes(className) ?? true;
            checkbox.onchange = () => toggleVisibility(subject, className, checkbox.checked);
            
            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.append(` ${className}`);

            subjectDiv.appendChild(label);
            subjectDiv.appendChild(document.createElement("br"));
        });

        container.appendChild(subjectDiv);
    });
}

function toggleVisibility(subject, className, isChecked) {
    let account = JSON.parse(localStorage.getItem("loggedInAccount"));

    if (!account.visibility) {
        account.visibility = {};
    }

    if (!account.visibility[subject]) {
        account.visibility[subject] = [];
    }

    if (isChecked) {
        if (!account.visibility[subject].includes(className)) {
            account.visibility[subject].push(className);
        }
    } else {
        account.visibility[subject] = account.visibility[subject].filter(c => c !== className);
    }

    localStorage.setItem("loggedInAccount", JSON.stringify(account));

    let accounts = JSON.parse(localStorage.getItem("accounts"));
    const accountIndex = accounts.findIndex(acc => acc.email === account.email);
    accounts[accountIndex] = account;
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

function saveVisibility() {
    alert("Visibility preferences saved!");
}

// Load subjects on dashboard
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        loadTutorSubjects();
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateSubcategories() {
    const subject = document.getElementById("subject").value;
    const subcategorySelect = document.getElementById("subcategory");
    subcategorySelect.innerHTML = ""; // Clear previous options

    if (!subject) {
        subcategorySelect.style.display = "none";
        return;
    }

    // Get all classes for the selected subject from VALID_CODES
    let availableClasses = Object.values(VALID_CODES)
        .filter(code => code.subject === subject)
        .map(code => code.className);

    if (availableClasses.length === 0) {
        subcategorySelect.style.display = "none";
        return;
    }

    subcategorySelect.style.display = "block"; // Show dropdown

    availableClasses.forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        subcategorySelect.appendChild(option);
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("signup-form")) {
        document.getElementById("signup-form").addEventListener("submit", submitSignupForm);
    }

    loadJSON(); // Preload JSON data
});
