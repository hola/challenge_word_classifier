const fs = require('fs');
const readline = require('readline');
module.exports = (path, onLine, maxLines) => {
    return new Promise((resolve, reject) => {
        let linesLeft = maxLines + 1;
        const reader = readline.createInterface({
            input: fs.createReadStream(path)
        });
        reader.on('line', line => {
            --linesLeft;
            if (maxLines === undefined || linesLeft > 0) {
                onLine(line);
            } else if (linesLeft === 0) {
                reader.close();
            }
            
        });
        reader.on('close', () => resolve());
    });
};