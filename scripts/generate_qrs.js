import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const passwords = {
    1: "glitch_protocol_start",
    2: "echo_silence_break",
    3: "css_style_master",
    4: "binary_search_log_n"
};

const outputDir = path.join(__dirname, '..', 'public', 'qrcodes');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

Object.entries(passwords).forEach(([round, password]) => {
    const filename = path.join(outputDir, `round-${round}.png`);
    QRCode.toFile(filename, password, {
        color: {
            dark: '#000000',  // Blue dots
            light: '#0000' // Transparent background
        }
    }, function (err) {
        if (err) throw err;
        console.log(`Generated QR for Round ${round}: ${password}`);
    });
});
