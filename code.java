public class Tutor {
    private String name;
    private String contactInfo;
    private int skillNumber;

    // Subjects and their max levels
    private static final String[] SUBJECTS = {"CS", "Biology", "Physics", "Chemistry", "Social Studies", "English", "Math"};
    private static final int[] MAX_LEVELS = {2, 2, 3, 2, 5, 4, 6};

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

    // Update a specific skill level
    public boolean updateSkill(int subjectIndex, int level) {
        if (subjectIndex < 0 || subjectIndex >= SUBJECTS.length) {
            System.out.println("Invalid subject index.");
            return false;
        }

        if (level < 0 || level > MAX_LEVELS[subjectIndex]) {
            System.out.println("Invalid skill level for " + SUBJECTS[subjectIndex] + ". Max level: " + MAX_LEVELS[subjectIndex]);
            return false;
        }

        int divisor = (int) Math.pow(10, subjectIndex);
        int oldDigit = (skillNumber / divisor) % 10;
        skillNumber = skillNumber - (oldDigit * divisor) + (level * divisor);
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
        
        tutor.updateSkill(6, 5); // Update Math to Level 5
        tutor.updateSkill(4, 3); // Update Social Studies to Level 3
        tutor.updateSkill(0, 2); // Update CS to Level 2

        tutor.displayTutorInfo();
    }
}

