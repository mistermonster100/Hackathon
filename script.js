let jsonData = {}; // Placeholder for JSON data

async function loadJSON() {
    try {
        const response = await fetch("students.json"); // Load external JSON file
        jsonData = await response.json();
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
}
async function submitSignupForm(event) {
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

async function findTutors() {
    await loadJSON();

    // Combine JSON data and localStorage data
    const storedTutors = JSON.parse(localStorage.getItem("tutors")) || [];
    const allTutors = [...jsonData.students, ...storedTutors];

    const subjectSelect = document.getElementById("subject");
    const subcategorySelect = document.getElementById("subcategory");
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    let subject = subjectSelect.value;
    let subcategory = subcategorySelect.value;

    if (!subject || !subcategory) {
        resultsDiv.innerHTML = "<p>Please select both a subject and a subcategory.</p>";
        return;
    }

    let subjectIndex = Object.keys(jsonData.subjects).indexOf(subject);
    if (subjectIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subject selected.</p>";
        return;
    }

    let subcategoryIndex = jsonData.subjects[subject].indexOf(subcategory);
    if (subcategoryIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subcategory selected.</p>";
        return;
    }

    let requiredProficiency = subcategoryIndex + 1;

    let tutors = allTutors
        .filter(student => parseInt(student.competency[subjectIndex]) >= requiredProficiency)
        .map(student => `
            <p>
                <strong>${student.name}</strong> - Proficiency: ${student.competency[subjectIndex]}<br>
                Email: <a href="mailto:${student.email}">${student.email}</a><br>
                Phone: ${student.phone}
            </p>
        `);

    resultsDiv.innerHTML = tutors.length ? tutors.join("") : `<p>No tutors found for ${subcategory} (requires level ${requiredProficiency}+).</p>`;
}


    const subjectSelect = document.getElementById("subject");
    const subcategorySelect = document.getElementById("subcategory");
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    let subject = subjectSelect.value;
    let subcategory = subcategorySelect.value;

    if (!subject || !subcategory) {
        resultsDiv.innerHTML = "<p>Please select both a subject and a subcategory.</p>";
        return;
    }

    let subjectIndex = Object.keys(jsonData.subjects).indexOf(subject);
    if (subjectIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subject selected.</p>";
        return;
    }

    let subcategoryIndex = jsonData.subjects[subject].indexOf(subcategory);
    if (subcategoryIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subcategory selected.</p>";
        return;
    }

    let requiredProficiency = subcategoryIndex + 1; // Start at 2 for the first subcategory

    let tutors = jsonData.students
        .filter(student => parseInt(student.competency[subjectIndex]) >= requiredProficiency)
        .map(student => `
            <p>
                <strong>${student.name}</strong> - Proficiency: ${student.competency[subjectIndex]}<br>
                Email: <a href="mailto:${student.email}">${student.email}</a><br>
                Phone: ${student.phone}
            </p>
        `);

    resultsDiv.innerHTML = tutors.length ? tutors.join("") : `<p>No tutors found for ${subcategory} (requires level ${requiredProficiency}+).</p>`;
}

// Load JSON data on page load
window.onload = loadJSON;


const subcategories = {
            "Math": ["Algebra", "Geometry", "Algebra 2", "Precalculus", "Calculus AB", "Calculus BC", "Calculus 3"],
            "English": ["English 9", "English 10", "English 11", "English 12"],
            "History": ["World History", "AP World History", "US History", "AP US History", "European History"],
            "Physics": ["Physics 1", "Physics 2", "Physics C"],
            "Chemistry": ["Honors Chemistry", "ASCP/AP Chemistry"],
            "Computer Science": ["CS Principles", "CS 1", "CS A", "Software Development"],
            "Biology": ["Honors Biology", "AP Biology"]
        };

function updateSubcategories() {
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
