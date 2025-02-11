// Valid teacher-provided codes for certification
const VALID_CODES = {
    "M-A1": { subject: "Math", level: 1 },  // Algebra 1
    "M-GE": { subject: "Math", level: 2 },  // Geometry
    "M-A2": { subject: "Math", level: 3 },  // Algebra 2
    "M-PC": { subject: "Math", level: 4 },  // Precalculus
    "M-CAB": { subject: "Math", level: 5 }, // Calculus AB
    "M-CBC": { subject: "Math", level: 6 }, // Calculus BC
    "M-C3": { subject: "Math", level: 7 },  // Calculus 3

    "E-9": { subject: "English", level: 1 },  // English 9
    "E-10": { subject: "English", level: 2 }, // English 10
    "E-11": { subject: "English", level: 3 }, // English 11
    "E-12": { subject: "English", level: 4 }, // English 12

    "S-WH": { subject: "Social Studies", level: 1 },  // World History
    "S-APH": { subject: "Social Studies", level: 2 }, // AP World History
    "S-UH": { subject: "Social Studies", level: 3 },  // US History
    "S-APU": { subject: "Social Studies", level: 4 }, // AP US History
    "S-EH": { subject: "Social Studies", level: 5 },  // European History

    "P-1": { subject: "Physics", level: 1 },  // Physics 1
    "P-2": { subject: "Physics", level: 2 },  // Physics 2
    "P-C": { subject: "Physics", level: 3 },  // Physics C

    "C-HC": { subject: "Chemistry", level: 1 },  // Honors Chemistry
    "C-AP": { subject: "Chemistry", level: 2 },  // AP Chemistry

    "CS-P": { subject: "Computer Science", level: 1 }, // CS Principles
    "CS-1": { subject: "Computer Science", level: 2 }, // CS 1
    "CS-A": { subject: "Computer Science", level: 3 }, // CS A

    "B-H": { subject: "Biology", level: 1 },  // Honors Biology
    "B-AP": { subject: "Biology", level: 2 }  // AP Biology
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

// Add or update a tutor's profile
function addOrUpdateTutor(name, email, phone, code) {
    let tutors = loadTutors();
    let tutor = tutors.find(t => t.email === email);

    if (!VALID_CODES.hasOwnProperty(code)) {
        alert("Invalid teacher code! Please enter a valid teacher-provided code.");
        return;
    }

    const { subject, level } = VALID_CODES[code];

    if (!tutor) {
        tutor = {
            name,
            email,
            phone,
            competency: "0000000" // Default competency for all subjects (7 digits, all zeroes)
        };
        tutors.push(tutor);
    }

    // Assign the correct skill level based on the teacher code
    const subjectIndex = SUBJECTS.indexOf(subject);
    if (subjectIndex === -1) {
        alert("Error: Subject not found.");
        return;
    }

    // Update the competency string
    let skillDigits = tutor.competency.split("").map(Number);
    skillDigits[subjectIndex] = level;
    tutor.competency = skillDigits.join("");

    saveTutors(tutors);
    alert(`Successfully set ${subject} skill to level ${level} for ${name}.`);
}

// Handle tutor signup form submission
function submitSignupForm(event) {
    event.preventDefault();

    const form = document.getElementById("signup-form");
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value || "N/A";
    addOrUpdateTutor(name, email, phone);
    form.reset();
}

// Find tutors based on selected subject and subcategory
async function findTutors() {
    await loadJSON(); // Load data from JSON

    const subject = document.getElementById("subject").value; // Selected subject (e.g., Math)
    const subcategory = document.getElementById("subcategory").value; // Selected class (e.g., Algebra 2)
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    // Validate selection
    if (!subject || !subcategory) {
        resultsDiv.innerHTML = "<p>Please select both a subject and a subcategory.</p>";
        return;
    }

    // Get subject index (to match the competency string)
    const subjectIndex = SUBJECTS.indexOf(subject);
    if (subjectIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subject selected.</p>";
        return;
    }

    // Find the subcategory (class) index
    const subcategoryIndex = jsonData.subjects[subject].indexOf(subcategory);
    if (subcategoryIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid class selected.</p>";
        return;
    }

    // Required proficiency for the class (e.g., Algebra 2 requires level 3)
    const requiredProficiency = subcategoryIndex + 1;

    // Filter tutors based on proficiency
    const tutors = loadTutors().filter(tutor => {
        return parseInt(tutor.competency[subjectIndex]) >= requiredProficiency;
    });

    // Display tutors with all classes they qualify for
    resultsDiv.innerHTML = tutors.length
        ? tutors.map(tutor => displayTutorClasses(tutor, subject, subjectIndex)).join("")
        : `<p>No tutors found for ${subcategory} (requires proficiency level ${requiredProficiency}+).</p>`;
}

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

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const studentID = document.getElementById("student-id").value.trim();
    const phone = document.getElementById("phone").value.trim() || "N/A";

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    if (accounts.some(account => account.email === email)) {
        document.getElementById("message").innerText = "Account with this email already exists!";
        return;
    }

    const newAccount = {
        name,
        email,
        phone,
        studentID,
        competency: "0000000"  // Default competency
    };

    accounts.push(newAccount);
    localStorage.setItem("accounts", JSON.stringify(accounts));
    document.getElementById("message").innerText = "Account created successfully!";
    document.getElementById("signup-form").reset();
}

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
function updateSubcategories() {
            console.log("updateSubcategories is working");
            const subject = document.getElementById("subject").value;
            const subcategorySelect = document.getElementById("subcategory");
            subcategorySelect.innerHTML = '';

            if (subject && subcategories[subject]) {
                subcategorySelect.style.display = "block";
                subcategories[subject].forEach(sub => {
                    let option = document.createElement("option");
                    option.value = sub;
                    option.textContent = sub;
                    subcategorySelect.appendChild(option);
                });
            } else {
                subcategorySelect.style.display = "none";
            }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("signup-form")) {
        document.getElementById("signup-form").addEventListener("submit", submitSignupForm);
    }

    loadJSON(); // Preload JSON data
});
