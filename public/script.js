document.getElementById('fileInput').addEventListener('change', function () {
    let fileNameDisplay = document.getElementById('selected-file');
    if (this.files.length > 0) {
        fileNameDisplay.textContent = `Selected file: ${this.files[0].name}`;
    } else {
        fileNameDisplay.textContent = "No file selected";
    }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    let fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert("Please select a file first.");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        let response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to process the file");
        }

        // Get filename from response headers
        let filename = response.headers.get('Content-Disposition').split('filename=')[1];

        // Create blob and trigger download
        let blob = await response.blob();
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert("File processed successfully. Download started.");
    } catch (error) {
        console.error("Error:", error);
        alert("Error processing file.");
    }
});
