---
slug: digital_signature_appearance_configuration
title: Digital Signature Appearance Configuration
source_doc: 0-PRC-0005
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Digital Signature Appearance Configuration

To ensure consistency and adherence to company standards, all digital signatures used within Aker Kvaerner Chemetics **must** conform to a specific appearance. The standard for digital signatures is the signer’s initials (e.g., JS), which are placed immediately to the right of the signer’s published name in the revision log. This page outlines the steps to configure this standard appearance for your digital signature profile.

### Step 1: Create Initials Graphic in PDF
1.  **Open Microsoft Word**: Start Microsoft Word and open a new document.
2.  **Set Page Margins**: Set all page margins to 0.25 inches.
3.  **Select Font**: Choose the Arial Font.
4.  **Set Font Size**: Set the font point size to 300. To do this, type "300" in the font size box and press Enter.
5.  **Type Initials**: Type your first and last initials (e.g., JS) with no period.
6.  **Publish to PDF**: Publish this Word document containing your initials to a PDF file. The specific method for publishing from Windows applications to PDF is detailed in [[application_specific_document_publishing]].

### Step 2: Configure Signature Appearance in Adobe Acrobat/Approver
1.  **Access User Settings**: In Adobe Acrobat or Adobe Approver, select `Tools > Self-Sign Security > User Settings…`.
2.  **Select Signature Appearance**: On the left pane of the User Settings window, select "Signature appearance".
3.  **Create New Appearance**: Press the "New…" button to create a new signature appearance.
4.  **Enter Title**: In the "Title" text box of the new window, enter "Kvaerner Standard Signature".
5.  **Import Graphic**:
    *   Under the "Configure Graphic" group, select the "Import Graphic from PDF file" button.
    *   Then, select the "Import Graphic" button.
    *   Navigate to and choose the PDF file you created in Step 1 (containing your initials) using the browser button.
6.  **Deselect Text Options**: In the "Configure Signature Appearance" window, **deselect all check-boxes** under the "Configure text" group. The preview window will show how your signature will look as you deselect each option.
7.  **Save Configuration**: The configuration for the standard appearance of an Aker Kvaerner Chemetics signature is automatically saved in your profile.

Once configured, this "Kvaerner Standard Signature" appearance can be selected when [[applying_digital_signatures]] to documents, ensuring compliance with company standards. This configuration is part of your [[digital_signature_profile_creation]].

### Detailed Configuration Steps
*   To set the font point size to 300, type `300` in the box and press enter.
*   The preview window will show what your signature will look like as you de-select each option under the "Configure text" group.

### Saving Appearance Settings
The configuration for the standard appearance of an Aker Kvaerner Chemetics signature is saved in your profile.
---