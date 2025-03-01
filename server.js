const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = 3000;

app.use(fileUpload());
app.use(express.static('public')); // Serve frontend files

// Handle file upload & processing
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded." });
    }

    let uploadedFile = req.files.file;

    // Read file content (as string)
    let fileContent = uploadedFile.data.toString('utf8');

    // Perform replacements
    let modifiedData = fileContent
        .replace(/\/\/launch/g, 'Web_reg_find("Text=","Savecount=",LAST);\nlr_start_transaction("launch");')
        .replace(/\/\/end launch/g,
            `if (atoi(lr_eval_string("{launchcheck}")) > 0) {
                lr_end_transaction("launch", LR_PASS);
            } else { 
                lr_end_transaction("launch", LR_FAIL);
                lr_error_message("error in vuser #%s Iteration #%s",
                    lr_eval_string("{p_vuserID}"),
                    lr_eval_string("{p_IterationNum}")
                );
            }`
        )
        .replace(/\/\/login/g, 'Web_reg_find("Text=","Savecount=",LAST);\nlr_start_transaction("login");')
        .replace(/\/\/end login/g,
            `if (atoi(lr_eval_string("{launchcheck}")) > 0) {
                lr_end_transaction("launch", LR_PASS);
            } else { 
                lr_end_transaction("launch", LR_FAIL);
                lr_error_message("error in vuser #%s Iteration #%s",
                    lr_eval_string("{p_vuserID}"),
                    lr_eval_string("{p_IterationNum}")
                );
            }`
        );

    // Send the modified file as a downloadable response
    res.setHeader('Content-Disposition', `attachment; filename=${uploadedFile.name.replace('.c', '_modified.c')}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(modifiedData);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
