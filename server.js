const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json()); // Parse JSON body
app.use(cors()); // Allow requests from frontend

app.post("/upload", (req, res) => {
    const { fileContent, fileName } = req.body;
    if (!fileContent || !fileName) {
        return res.status(400).json({ message: "No file provided" });
    }

    try {
        let modifiedData = fileContent
            .replace(/\/\/launch/g, 'lr_start_transaction("launch");')
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
            .replace(/\/\/login/g, `Web_reg_find("Text=", "Savecount=", Last);\nlr_start_transaction("login");`)
            .replace(/\/\/end login/g, 'lr_end_transaction("login", LR_AUTO);');

        res.json({ modifiedData, fileName: fileName.replace(".c", "_modified.c") });
    } catch (error) {
        res.status(500).json({ message: "Error processing file" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
