// Valid teacher-provided codes for certification
const VALID_CODES = {
    "MATH-Algebra1": { subject: "Math", level: 1 },
    "MATH-Geometry": { subject: "Math", level: 2 },
    "MATH-Algebra2": { subject: "Math", level: 3 },
    "MATH-Precalculus": { subject: "Math", level: 4 },
    "MATH-CalculusAB": { subject: "Math", level: 5 },
    "MATH-CalculusBC": { subject: "Math", level: 6 },
    "MATH-Calculus3": { subject: "Math", level: 7 },
    
    "ENG-English9": { subject: "English", level: 1 },
    "ENG-English10": { subject: "English", level: 2 },
    "ENG-English11": { subject: "English", level: 3 },
    "ENG-English12": { subject: "English", level: 4 },
    
    "PHYS-Physics1": { subject: "Physics", level: 1 },
    "PHYS-Physics2": { subject: "Physics", level: 2 },
    "PHYS-PhysicsC": { subject: "Physics", level: 3 },

    "CHEM-Honors": { subject: "Chemistry", level: 1 },
    "CHEM-AP": { subject: "Chemistry", level: 2 },

    "CS-Principles": { subject: "Computer Science", level: 1 },
    "CS-CS1": { subject: "Computer Science", level: 2 },
    "CS-CSA": { subject: "Computer Science", level: 3 },
    
    "BIO-Honors": { subject: "Biology", level: 1 },
    "BIO-AP": { subject: "Biology", level: 2 }
};
const MASTER_TEACHER_CODE = "MASTER-DELETE-123"; // Change this for security
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

// Load tutors from `localStorage` or `students.json`
function loadTutors() {
    const jsonTutors = jsonData.students || []; // Load preset tutors from JSON
    const localTutors = JSON.parse(localStorage.getItem("tutors")) || []; // Load new tutors from localStorage

    // Combine and deduplicate tutors based on unique email
    const combinedTutors = [...jsonTutors, ...localTutors];
    const uniqueTutors = combinedTutors.filter((tutor, index, self) =>
        index === self.findIndex(t => t.email === tutor.email) // Deduplicate by email
    );

    return uniqueTutors;
}

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
    const code = form["teacher-code"].value;

    addOrUpdateTutor(name, email, phone, code);
    form.reset();
}

// Find tutors based on selected subject and subcategory
async function findTutors() {
    await loadJSON(); // Ensure JSON data is loaded

    const subject = document.getElementById("subject").value; // Selected subject
    const subcategory = document.getElementById("subcategory").value; // Selected subcategory
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    // Validate user input
    if (!subject || !subcategory) {
        resultsDiv.innerHTML = "<p>Please select both a subject and a subcategory.</p>";
        return;
    }

    // Find subject index
    const subjectIndex = SUBJECTS.indexOf(subject);
    if (subjectIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subject selected.</p>";
        return;
    }

    // Find subcategory index
    const subcategoryIndex = jsonData.subjects[subject].indexOf(subcategory);
    if (subcategoryIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subcategory selected.</p>";
        return;
    }

    // Calculate required proficiency (subcategory index + 1)
    const requiredProficiency = subcategoryIndex + 1;

    // Filter tutors based on competency
    const tutors = loadTutors().filter(tutor => {
        return parseInt(tutor.competency[subjectIndex]) >= requiredProficiency;
    });

    // Display results
    resultsDiv.innerHTML = tutors.length
        ? tutors.map(tutor => `
            <p>
                <strong>${tutor.name}</strong> - Proficiency: ${tutor.competency[subjectIndex]}<br>
                Email: <a href="mailto:${tutor.email}">${tutor.email}</a><br>
                Phone: ${tutor.phone}
            </p>
        `).join("")
        : `<p>No tutors found for ${subcategory} (requires level ${requiredProficiency}+).</p>`;
}


// Dynamically update subcategories based on subject selection
function updateSubcategories() {
    const subject = document.getElementById("subject").value; // Get selected subject
    const subcategorySelect = document.getElementById("subcategory"); // Subcategory dropdown
    subcategorySelect.innerHTML = ""; // Clear previous options

    // If a subject is selected and it exists in the `subjects` object
    if (subject && jsonData.subjects[subject]) {
        subcategorySelect.style.display = "block"; // Show dropdown
        jsonData.subjects[subject].forEach(sub => {
            const option = document.createElement("option");
            option.value = sub; // Value of the subcategory
            option.textContent = sub; // Display text
            subcategorySelect.appendChild(option);
        });
    } else {
        subcategorySelect.style.display = "none"; // Hide dropdown if no subject selected
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("signup-form")) {
        document.getElementById("signup-form").addEventListener("submit", submitSignupForm);
    }

    loadJSON(); // Preload JSON data
});
