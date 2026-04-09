---
slug: digital_signature_profile_creation
title: Digital Signature Profile Creation
source_doc: 0-PRC-0005
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Digital Signature Profile Creation

Before applying digital signatures to documents using Adobe Acrobat Self-Sign Security or Adobe Approver, personnel **must** set up a personal digital signature profile. This profile is a critical component for secure digital signing.

### Profile Components
A digital signature profile is a password-protected file that contains several key elements:
*   **User's Name**: The name associated with the digital signature.
*   **Password**: A secure password protecting the profile.
*   **Basic Attributes**: Other fundamental user information.
*   **Private Key**: Stored in an encrypted format, essential for creating digital signatures.
*   **Public Key**: Wrapped in a certificate, used by others to verify your signature.
*   **Trusted Certificates**: A list of certificates belonging to other users whose signatures you trust.
*   **Time-out Value**: Defines when a password is required for signing after initial login.

### Step-by-Step Profile Creation
1.  **Access Self-Sign Security**: In Adobe Acrobat or Adobe Approver, navigate to `Tools > Self-Sign Security > Log In`.
2.  **Start New Profile**: Click the "New User Profile" button.
3.  **Enter User Name**: In the "Create New User" dialog box, the user's name for the profile **must** be entered.
    *   The user profile name **shall** be the first name followed by a space and the last name (e.g., John Smith).
    *   The first letter of each name part in the user profile name **must** be capitalized.
    *   User profile names **must** be unique within the organization. If two or more people share the same first and last name, they **shall** include their middle name in their profile to ensure uniqueness.
    *   The user profile name is the name seen in the Signatures palette when a signature is added to a document.
4.  **Set Password**: A password containing at least six characters **must** be entered.
    *   The same password **must** be entered in both the "User Password" and "Confirm Password" text boxes.
    *   The signature's security is directly tied to its password. Passwords **should** be memorable.
    *   A password **should** consist of two short, unrelated words, with a special character in between (e.g., Sky$is-red, rain+fell, $cut%hurt$). If speaking a foreign language, pick one word in English and the second word in the other language.
5.  **Save Profile Location**: The profile **is to be stored** at `Q:\Signatures\Aker Kvaerner Chemetics`. The filename for the profile will default to the name used for the profile, without any spaces.
6.  **Finalize Creation**:
    *   Click "OK" to create the profile after entering the user profile name and password.
    *   Press the "Save" button to save the profile.
    *   Users can then click "OK" to end the profile creation process.
    *   Alternatively, after saving, users can click "User Settings" to modify the profile’s password, password options, or to configure the appearance of their signature.

This profile is essential for [[applying_digital_signatures]] and for configuring the [[digital_signature_appearance_configuration]].

### Password Recommendations
*   Passwords should be memorable.
*   A password should consist of two short unrelated words, with a special character in between.
*   If speaking a foreign language, pick one word in English and the second word in the other language for the password.
*   Examples of valid passwords include: Sky$is-red, rain+fell, $cut%hurt$.

### Profile Creation Completion
After entering the user profile name and password, click `OK` to create the profile. The `Save` button must be pressed to save the profile. After saving the profile, users can click `OK` to end the profile creation process.

### Post-Creation Options
After saving the profile, users can click `User Settings` to change the profile’s password, password options, or to set the appearance of their signature.

### Digital Signature Key Storage
All Aker Kvaerner Chemetics personnel responsible for checking or approving project documents will store their digital signature key in `Q:\Signatures\Aker Kvaerner ChemeticsAker Kvaerner Chemetics`.
---