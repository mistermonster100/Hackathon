async function findTutors() {
        const subject = document.getElementById("subject").value;
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "<p>Loading...</p>";

        try {
            const response = await fetch("tutors.json");
            const tutors = await response.json();
            const matchedTutors = tutors.filter(tutor => tutor.subjects.includes(subject));

            resultsDiv.innerHTML = matchedTutors.length ? "" : "<p>No tutors found.</p>";
            matchedTutors.forEach(tutor => {
                const tutorDiv = document.createElement("div");
                tutorDiv.classList.add("tutor");
                tutorDiv.innerHTML = `<h3>${tutor.name}</h3><p>${tutor.bio}</p>`;
                resultsDiv.appendChild(tutorDiv);
            });
        } catch (error) {
            resultsDiv.innerHTML = "<p>Error loading tutors.</p>";
        }
}
