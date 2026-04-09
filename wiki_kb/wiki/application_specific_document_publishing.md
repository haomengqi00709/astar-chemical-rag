---
slug: application_specific_document_publishing
title: Application-Specific Document Publishing
source_doc: 0-PRC-0005
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Application-Specific Document Publishing

This section provides specific instructions for publishing documents from various applications into Adobe Portable Document Format (PDF) for project use. Regardless of the source application, all published files **must** meet the naming requirements of [[document_number_format_and_components]] (0-PRC-0002).

### Publishing from AutoCAD
1.  **Use Batch-Plotting**: Utilize the AutoCAD batch-plotting program.
2.  **Select Plotting Device**: Select the Plotting Device named "Acrobat Queue: ACROBATQ".
3.  **Retrieve Files**: After batch-plotting, the published files will be located in the directory `I:\ACROBATQ\ACAD\OUT`.
4.  **Move to Project Directory**: Move these published files from `I:\ACROBATQ\ACAD\OUT` to the designated project directory.

### Publishing from PDMS
1.  **Use Plotting Program**: Use the PDMS plotting program.
2.  **Select Plot Queue**: Select the Plot Queue named "Create Adobe Acrobat plot".
3.  **Retrieve Files**: After plotting, the published files will be located in the directory `I:\ACROBATQ\PDMS\OUT`.
4.  **Move to Project Directory**: Move these published files from `I:\ACROBATQ\PDMS\OUT` to the designated project directory.

### Publishing from Windows Applications (Using "Print to file")
This method requires a postscript printer to be set as your default printer. If this is not the case, **consult IT Support**.
1.  **Standard Print Instruction**: Use the standard `File / Print` instruction within the Windows application.
2.  **Select "Print to file"**: Select the "Print to file" check box.
3.  **Navigate to Input Directory**: Navigate to the directory `I:\ACROBATQ\OFFICE\IN`.
4.  **Specify File Name**: Specify the desired file name in the "File name" box.
5.  **Retain File Extension**: Leave the file extension as ".prn".
6.  **Initiate Print**: Press the "Open" button. Then, press "OK" after selecting the "Print to file" check box and any other print options. The file will be placed in the queue to be processed after pressing "Open".
7.  **Retrieve Files**: The published files will be left in the directory `I:\ACROBATQ\OFFICE\OUT`.
8.  **Move to Project Directory**: Move these published files from `I:\ACROBATQ\OFFICE\OUT` to the designated project directory.

### Publishing from Windows Applications (Using Adobe Acrobat Distiller)
This method requires Adobe Acrobat to be installed. If the "Acrobat Distiller" printer is not available, Adobe Acrobat is not installed.
1.  **Standard Print Instruction**: Use the standard `File / Print` instruction within the Windows application.
2.  **Select "Acrobat Distiller"**: Select the "Acrobat Distiller" printer from the list of available printers.
3.  **Initiate Print**: Press "OK" after selecting the "Acrobat Distiller" printer and any other print options.
4.  **Navigate to Project Directory**: Navigate to the project directory.
5.  **Specify File Name**: Specify the desired file name in the "File name" box.
6.  **Retain File Extension**: Leave the file extension as ".prn".
7.  **Save File**: Press the "Save" button. The file will be directly saved to the specified project directory.

These application-specific instructions facilitate the initial conversion of native documents into PDF format, which is a prerequisite for [[digital_document_publishing]] and subsequent digital signing.

### Prerequisites for Windows Applications (Print to file)
*   This procedure requires you to have a postscript printer as your default printer.
*   If a postscript printer is not the default, consult IT Support.

### Windows Applications (Print to file) - Additional Steps
*   When publishing from Windows Applications (Print to file), press `OK` after selecting the `Print to file` check box and any other print options.
*   When publishing from Windows Applications (Print to file), press the `Open` button to proceed.
*   When publishing from Windows Applications (Print to file), the file will be placed in the queue to be processed after pressing `Open`.

### Windows Applications (Using Adobe Acrobat) - Additional Steps
*   When publishing from Windows Applications (Using Adobe Acrobat), press `OK` after selecting the `Acrobat Distiller` printer and any other print options.
*   When publishing from Windows Applications (Using Adobe Acrobat), ensure the file extension is left as `.prn`.
---