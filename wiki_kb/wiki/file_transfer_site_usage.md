---
slug: file_transfer_site_usage
title: File Transfer Site Usage for Construction Subcontracts
source_doc: 0-SPC-6003
doc_type: SPC
discipline: 0
discipline_name: Administration
source_folder: Specification
track: A
---

# File Transfer Site Usage for Construction Subcontracts

The File Transfer Site (FTP) is the primary method for transferring documents between Aker Kvaerner Chemetics and the Subcontractor. This site facilitates secure and organized document exchange for construction subcontracts, as detailed in 0-SPC-6003.

**Site Structure and Access**
The File Transfer Site contains two sub-directories:
*   **Incoming**: Used for documents transmitted by the Subcontractor to Aker Kvaerner Chemetics.
*   **Outgoing**: Used for documents transmitted by Aker Kvaerner Chemetics to the Subcontractor.

It is not possible to view files directly within either directory on the File Transfer Site. Files can only be retrieved by a party who possesses the exact filename. Files placed in either directory **will** be deleted after 24 hours. Therefore, file transfers **must** be scheduled to allow access by the receiving party during normal working hours.

**FTP Client Programs**
Files are uploaded to the File Transfer Site using an FTP client program.
*   **Windows NT "ftp" client**: The built-in "ftp" command-line program in Windows NT is suitable for uploading files.
*   **Graphical User Interface (GUI) clients**: Examples include WS_FTP from www.ipswitch.com. Free or shareware GUI FTP clients available on the Internet may also be used if a graphical interface is preferred.

**File Preparation for Transfer**
All files to be transferred **shall** be placed into a single ZIP archive. WINZIP **shall** be used for creating this ZIP archive.

**Login Details**
*   **FTP Address**: ftp.kvaerner.com
*   **Username**: anonymous
*   **Password**: <your e-mail address> (e.g., j.smith@anycompany.com)

**Uploading Documents (Subcontractor to Aker Kvaerner Chemetics)**
1.  Log into the File Transfer Site using an FTP client program.
2.  Transfer the ZIP archive into the "incoming" directory.
3.  Use the "binary" transfer mode of the FTP client program.
4.  Send an e-mail message to Aker Kvaerner Chemetics Document Control (chemetics.doccontrol@akerkvaerner.com) advising that a file has been placed on the File Transfer Site.
5.  The e-mail message **shall** include a link to the file in the format: ftp://ftp.kvaerner.com/incoming/uploaded_file_name.zip.
6.  The e-mail message **shall** also have the transmittal attached, as described in [[document_transmittal_requirements_construction_subcontract]].
7.  Document transfer by the Subcontractor may also be governed by [[construction_subcontractor_document_supply_0_spc_6091]].

**Downloading Documents (Aker Kvaerner Chemetics to Subcontractor)**
Upon receipt of an e-mail message from Aker Kvaerner Chemetics advising of a file, click on the provided link in the e-mail to initiate downloading. Internet Explorer or any other Internet Browser (by cutting and pasting the link into the address box) can be used for downloading.

**Error Handling**
If the browser issues an error message during download, it indicates that an incorrect link was used or the file was deleted due to exceeding the 24-hour retention period. In such cases, contact Aker Kvaerner Chemetics Document Control.

**Site Structure and Access**
The File Transfer Site contains two dedicated sub-directories:
*   **incoming**: For documents transmitted by the Subcontractor to Aker Kvaerner Chemetics.
*   **outgoing**: For documents transmitted by Aker Kvaerner Chemetics to the Subcontractor.

It is not possible to view the contents of either directory directly on the File Transfer Site. Files can only be retrieved by a party who possesses the exact filename. Files placed in either directory will be automatically deleted after 24 hours. Therefore, file transfers must be scheduled to ensure the receiving party can access the files during normal working hours.

Note that document transfer by the Subcontractor may also be governed by the procedures outlined in 0-SPC-6091: Construction Subcontractor Document Supply.

**Uploading Documents to the Site (Subcontractor to Aker Kvaerner Chemetics)**
Documents are uploaded to the File Transfer Site using an FTP client program. Windows NT includes a command-line FTP client named "ftp," which is suitable for this purpose. For users who prefer a graphical interface, clients like WS_FTP from www.ipswitch.com are available, or other free/shareware FTP clients found on the Internet may be used.

Before uploading, all files to be transferred must be consolidated into a single ZIP archive. WINZIP shall be used for creating this archive.

To upload:
1.  Log into the File Transfer Site using your FTP client program.
    *   **FTP Address:** ftp.kvaerner.com
    *   **Username:** anonymous
    *   **Password:** <your e-mail address> (e.g., j.smith@anycompany.com)
2.  Transfer the ZIP archive into the "incoming" directory. Ensure the "binary" transfer mode is selected in your FTP program.
3.  After the transfer, send an e-mail message to Aker Kvaerner Chemetics Document Control (chemetics.doccontrol@akerkvaerner.com) advising that a file has been placed on the site.
4.  This e-mail message shall include the transmittal (as described in Section 5 of 0-SPC-6003) attached.
5.  Crucially, the e-mail message must also include a direct link to the uploaded file, in the format: `ftp://ftp.kvaerner.com/incoming/uploaded_file_name.zip`.

**Downloading Documents from the Site (Aker Kvaerner Chemetics to Subcontractor)**
Upon receiving an e-mail notification from Aker Kvaerner Chemetics advising of an available file, click on the provided link within the e-mail to initiate the download. Internet Explorer or any other internet browser can be used for this purpose; simply cut the link from the e-mail and paste it into the browser's address bar.

If the browser displays an error message, it indicates either an incorrect link was used or the file has been automatically deleted due to exceeding the 24-hour retention period. In such cases, contact Aker Kvaerner Chemetics Document Control immediately.
---