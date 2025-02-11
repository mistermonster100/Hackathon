
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    // 🔹 Replace with your Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyDjSRPgwoeNdSnRleq85mS_mqmV9Tdrkzs",
      authDomain: "tiger-tutors.firebaseapp.com",
      projectId: "tiger-tutors",
      storageBucket: "tiger-tutors.firebasestorage.app",
      messagingSenderId: "343214157028",
      appId: "1:343214157028:web:9bf5d0453068e95ddf90f1",
      measurementId: "G-3ZMT5ERRFR"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

const subcategories = {
            "Math": ["Algebra", "Geometry", "Algebra 2", "Precalculus", "Calculus AB", "Calculus BC", "Calculus 3"],
            "English": ["English 9", "English 10", "English 11", "English 12"],
            "Social Studies": ["World History", "AP World History", "US History", "AP US History", "European History"],
            "Physics": ["Physics 1", "Physics 2", "Physics C"],
            "Chemistry": ["Honors Chemistry", "ACP/AP Chemistry"],
            "Computer Science": ["CS Principles", "CS 1", "CS A", "Software Development"],
            "Biology": ["Honors Biology", "AP Biology"]
};


// Maximum skill levels for each subject
const MAX_LEVELS = [3, 2, 3, 2, 5, 4, 7]; // Aligns with subject ranges
const SUBJECTS = ["Computer Science", "Biology", "Physics", "Chemistry", "Social Studies", "English", "Math"];

// JSON Data placeholder
let jsonData = await fetchFirestoreData("users");
let subjectJson = await fetchFirestoreData("subjects");
//console.log(subjectJson);
//console.log(subjectJson[4].classes.indexOf("Algebra 2"))


// Load tutors from `localStorage` or `students.json`
function loadTutors() {
    const jsonTutors = jsonData; // Load preset tutors from JSON
    return jsonTutors;
}

// Find tutors based on selected subject and subcategory
async function findTutors() {

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
    const subjectIndex = subjectJson.findIndex(item => item.id === subject);
    if (subjectIndex === -1) {
        resultsDiv.innerHTML = "<p>Invalid subject selected.</p>";
        return;
    }

    // Find the subcategory (class) index
        /*let mathIndex = subjectJson.findIndex(item => item.id === "Math");
        console.log(subjectJson[mathIndex].classes.indexOf("Algebra 2"))*/

    const subcategoryIndex = subjectJson[subjectIndex].classes.indexOf(subcategory);
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
    //console.log(subjectJson);
    const subjectObj = subjectJson.find(item => item.id === subject);
    const classesQualified = subjectObj ? subjectObj.classes.slice(0, tutorProficiency) : [];// All classes up to their level

    return `
        <div class="tutor">
            <strong>${tutor.name}</strong><br>
            <strong>Qualified Classes:</strong> ${classesQualified.join(", ")}<br>
            Email: <a href="mailto:${tutor.email}">${tutor.email}</a><br>
            Phone: ${tutor.phone || "N/A"}
        </div>
    `;
}

function updateSubcategories() {
            //console.log("updateSubcategories is working");

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

async function fetchFirestoreData(collectionName) {
    let dataArray = []; // Temporary array for fetched data

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        querySnapshot.forEach((doc) => {
            dataArray.push({
                id: doc.id, // Store Firestore document ID
                ...doc.data() // Spread operator to include all fields
            });
        });

        //console.log(dataArray[1]); // This will log the array of data
        return dataArray; // Return the array for further use
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}


Object.assign(window, {updateSubcategories, findTutors});
