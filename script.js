// Valid teacher-provided codes for certification
const VALID_CODES = {
    "CS-Rho": 0,       // Computer Science
    "BIO-Phi": 1,      // Biology
    "PHYS-Theta": 2,   // Physics
    "CHEM-Lambda": 3,  // Chemistry
    "SS-Eta": 4,       // Social Studies
    "ENG-Mu": 5,       // English
    "MATH-Pi": 6       // Math
};

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
function addOrUpdateTutor(name, email, phone, code, proficiency) {
    let tutors = loadTutors();
    let tutor = tutors.find(t => t.email === email);

    if (!tutor) {
        tutor = {
            name,
            email,
            phone,
            competency: "0000000" // Default competency: all zeros
        };
        tutors.push(tutor);
    }

    const result = updateSkill(tutor, code, parseInt(proficiency));
    if (result.success) {
        saveTutors(tutors);
    }

    return result.message;
}

// Handle tutor signup form submission
function submitSignupForm(event) {
    event.preventDefault();

    const form = document.getElementById("signup-form");
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const code = form["teacher-code"].value;
    const proficiency = form["proficiency-level"].value;

    const message = addOrUpdateTutor(name, email, phone, code, proficiency);
    document.getElementById("message").innerText = message;

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
