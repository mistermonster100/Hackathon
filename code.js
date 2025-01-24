// Valid codes for teacher certification
const VALID_CODES = {
    "CS-Rho": 0,       // Computer Science
    "BIO-Phi": 1,      // Biology
    "PHYS-Theta": 2,   // Physics
    "CHEM-Lambda": 3,  // Chemistry
    "SS-Eta": 4,       // Social Studies
    "ENG-Mu": 5,       // English
    "MATH-Pi": 6       // Math
};

// Maximum skill levels per subject
const MAX_LEVELS = [2, 2, 3, 2, 5, 4, 7]; // Aligns with competency ranges
const SUBJECTS = ["CS", "Biology", "Physics", "Chemistry", "Social Studies", "English", "Math"];

// Load tutors from localStorage (or initialize an empty array)
function loadTutors() {
    return JSON.parse(localStorage.getItem("tutors")) || [];
}

// Save tutors to localStorage
function saveTutors(tutors) {
    localStorage.setItem("tutors", JSON.stringify(tutors));
}

// Add or update a tutor
function addOrUpdateTutor(name, email, phone, code, proficiency) {
    let tutors = loadTutors();
    let tutor = tutors.find(t => t.email === email);

    // If the tutor doesn't exist, create a new one
    if (!tutor) {
        tutor = {
            name,
            email,
            phone,
            competency: "0000000" // Default competency: all zeros
        };
        tutors.push(tutor);
    }

    // Validate and update the skill
    const result = updateSkill(tutor, code, parseInt(proficiency));
    if (result.success) {
        saveTutors(tutors);
    }

    return result.message;
}

// Update the competency of a tutor
function updateSkill(tutor, code, level) {
    if (!VALID_CODES.hasOwnProperty(code)) {
        return { success: false, message: "Invalid teacher-provided code." };
    }

    const subjectIndex = VALID_CODES[code];
    if (level < 0 || level > MAX_LEVELS[subjectIndex]) {
        return { success: false, message: `Invalid skill level for ${SUBJECTS[subjectIndex]}. Max level: ${MAX_LEVELS[subjectIndex]}` };
    }

    // Update the specific digit in the competency string
    const skillDigits = tutor.competency.split("").map(Number);
    skillDigits[subjectIndex] = level;
    tutor.competency = skillDigits.join("");

    return { success: true, message: `Successfully updated ${SUBJECTS[subjectIndex]} to level ${level}.` };
}

// Debug/Test Functions (Optional)
function displayTutors() {
    const tutors = loadTutors();
    console.log("Current Tutors:", tutors);
}

// Example usage (can be called from the frontend)
console.log(addOrUpdateTutor("John Doe", "john.doe@example.com", "123-456-7890", "MATH-Pi", 6));
console.log(addOrUpdateTutor("Jane Smith", "jane.smith@example.com", "987-654-3210", "BIO-Phi", 2));

displayTutors();
