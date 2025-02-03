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


// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("signup-form")) {
        document.getElementById("signup-form").addEventListener("submit", submitSignupForm);
    }

    loadJSON(); // Preload JSON data
});
