---
slug: digital_document_publishing
title: Digital Document Publishing Process
source_doc: 0-PRC-0005
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Digital Document Publishing Process

Digital publishing is one of the two permitted methods for creating unalterable records of project documents at Aker Kvaerner Chemetics. This process primarily utilizes Adobe Portable Document Format (PDF) and digital signatures.

### Process Overview
1.  **Document Conversion**: Documents are published into Adobe Portable Document Format (PDF).
2.  **Digital Signing**: Authorized personnel affix their digital signatures to the PDF documents.
3.  **Storage**: Published and digitally signed documents **shall** be stored in the project electronic file. These documents are kept in the same folder as their native format versions. The structure of the project electronic file is defined in [[document_control_1_prc_0003]].
4.  **Verification**: Personnel can view digital signatures using Adobe Approver or Adobe Acrobat. To verify the authenticity of a digital signature, personnel **must** have received the digital signature key belonging to the signer. All Aker Kvaerner Chemetics personnel responsible for checking or approving project documents **shall** store their digital signature key in `Q:\Signatures\Aker Kvaerner ChemeticsAker Kvaerner Chemetics`.
5.  **Notification**: Upon completion of publication and any required checking and approval (as covered by 0-PRC-7004, see [[document_approval_and_revision_process]]), the responsible Discipline Lead **shall** advise Document Control.
6.  **Database Update**: Document Control will then update the project Document Control Database, which is managed under [[control_of_project_documents_0_prc_0006]].

### Digital Signature Management
Detailed procedures for managing digital signatures are crucial for this process:
*   **Profile Creation**: Before signing, a digital signature profile **must** be set up. This profile is a password-protected file containing the user's name, password, private and public keys, and a list of trusted certificates. Refer to [[digital_signature_profile_creation]] for detailed instructions.
*   **Appearance Configuration**: The standard Aker Kvaerner Chemetics digital signature appearance, consisting of the signer's initials, **must** be configured. This involves creating an initials graphic and importing it into the signature settings. See [[digital_signature_appearance_configuration]] for guidance.
*   **Applying Signatures**: The process of applying a digital signature to an open PDF document in Adobe Acrobat or Adobe Approver involves selecting the signature tool, drawing a signature box, entering the password, and selecting the configured signature appearance. Specific instructions are provided in [[applying_digital_signatures]].

### Application-Specific Publishing
Instructions for publishing documents from various applications (AutoCAD, PDMS, and Windows applications) into PDF format are detailed in [[application_specific_document_publishing]]. It is crucial that the names of the published files meet the requirements of [[document_number_format_and_components]] (0-PRC-0002).

This method ensures a secure and traceable record of document approval and status.

### Viewing and Verifying Digital Signatures
Personnel can view digital signatures in Adobe Portable Document Format using Adobe Approver or Adobe Acrobat. To verify the authenticity of digital signatures, personnel must have received the digital signature key belonging to the signer.
---