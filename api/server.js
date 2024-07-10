const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { HuffmanCoding } = require('./huffman');

const app = express();
const port = 5000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

app.post('/compress', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const huffman = new HuffmanCoding(filePath);
    const compressedFilePath = huffman.compress();

    res.json({ url: `http://localhost:5000/${compressedFilePath}` });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
