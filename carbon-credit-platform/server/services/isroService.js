// server/services/isroService.js
const { spawn } = require('child_process');
const path = require('path');

const verifyWithSatellite = (ngoWallet, landArea) => {
    return new Promise((resolve, reject) => {
        // Find the python script path
        const pythonScript = path.join(__dirname, 'isro_math.py');
        
        // Spawn Python process: 'python server/services/isro_math.py <wallet> <area>'
        // Note: Use 'python3' if you are on Mac/Linux
        const pythonProcess = spawn('python', [pythonScript, ngoWallet, landArea]);

        let resultData = "";

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject("Python script failed to execute.");
            } else {
                try {
                    resolve(JSON.parse(resultData));
                } catch (e) {
                    reject("Failed to parse Python output.");
                }
            }
        });
    });
};

module.exports = { verifyWithSatellite };
