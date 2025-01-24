import java.util.HashMap;
import java.util.Map;

public class Tutor {
    private String name;
    private String contactInfo;
    private int skillNumber;

    // Subjects and their max levels
    private static final String[] SUBJECTS = {"CS", "Biology", "Physics", "Chemistry", "Social Studies", "English", "Math"};
    private static final int[] MAX_LEVELS = {2, 2, 3, 2, 5, 4, 7}; // Updated Math max level to 7

    // A map to store valid codes for each subject (this would typically come from a database or external system)
    private static final Map<String, Integer> VALID_CODES = new HashMap<>();

    static {
        VALID_CODES.put("CS-Rho", 0); // Example: "CS-Rho" certifies Computer Science
        VALID_CODES.put("BIO-Phi", 1); // Example: "BIO-Phi" certifies Biology
        VALID_CODES.put("PHYS-Theta", 2); // Example: "PHYS-Theta" certifies Physics
        VALID_CODES.put("CHEM-Lambda", 3); // Example: "CHEM-Lambda" certifies Chemistry
        VALID_CODES.put("SS-Eta", 4);  // Example: "SS-Eta" certifies Social Studies
        VALID_CODES.put("ENG-Mu", 5); // Example: "ENG-Mu" certifies English
        VALID_CODES.put("MATH-Pi", 6); // Example: "MATH-Pi" certifies Math
    }

    // Constructor
    public Tutor(String name, String contactInfo) {
        this.name = name;
        this.contactInfo = contactInfo;
        this.skillNumber = 0; // Default to no skills
    }

    // Getter and Setter for Name
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Getter and Setter for Contact Info
    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    // Getter for Skill Number
    public int getSkillNumber() {
        return skillNumber;
    }

    // Update skill level with validation
    public boolean updateSkill(String code, int level) {
        if (!VALID_CODES.containsKey(code)) {
            System.out.println("Invalid code. Please provide a valid teacher-provided code.");
            return false;
        }

        int subjectIndex = VALID_CODES.get(code);

        if (level < 0 || level > MAX_LEVELS[subjectIndex]) {
            System.out.println("Invalid skill level for " + SUBJECTS[subjectIndex] + ". Max level: " + MAX_LEVELS[subjectIndex]);
            return false;
        }

        int divisor = (int) Math.pow(10, subjectIndex);
        int oldDigit = (skillNumber / divisor) % 10;
        skillNumber = skillNumber - (oldDigit * divisor) + (level * divisor);
        System.out.println("Successfully updated " + SUBJECTS[subjectIndex] + " to level " + level + ".");
        return true;
    }

    // Display tutor details
    public void displayTutorInfo() {
        System.out.println("Name: " + name);
        System.out.println("Contact Info: " + contactInfo);
        System.out.println("Skills:");
        for (int i = 0; i < SUBJECTS.length; i++) {
            int level = (skillNumber / (int) Math.pow(10, i)) % 10;
            if (level > 0) {
                System.out.println("  - " + SUBJECTS[i] + ": Level " + level + " (Max: " + MAX_LEVELS[i] + ")");
            }
        }
    }

    public static void main(String[] args) {
        // Example usage
        Tutor tutor = new Tutor("John Doe", "john.doe@example.com");

        // Try updating without a valid code
        tutor.updateSkill("INVALID-CODE", 3); // Should print error

        // Correctly update a skill with a valid code
        tutor.updateSkill("MATH-404", 6); // Math updated to level 6
        tutor.updateSkill("BIO-456", 2);  // Biology updated to level 2

        // Display tutor details
        tutor.displayTutorInfo();
    }
}
