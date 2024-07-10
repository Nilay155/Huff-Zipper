const fs = require('fs');
const path = require('path');

class HeapNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }

    lessThan(other) {
        return this.freq < other.freq;
    }

    equals(other) {
        if (other == null) {
            return false;
        }
        if (!(other instanceof HeapNode)) {
            return false;
        }
        return this.freq === other.freq;
    }
}

class HuffmanCoding {
    constructor(filePath) {
        this.filePath = filePath;
        this.heap = [];
        this.codes = {};
        this.reverseMapping = {};
    }

    makeFrequencyDict(text) {
        const frequency = {};
        for (const character of text) {
            if (!frequency[character]) {
                frequency[character] = 0;
            }
            frequency[character] += 1;
        }
        return frequency;
    }

    makeHeap(frequency) {
        for (const key in frequency) {
            const node = new HeapNode(key, frequency[key]);
            this.heap.push(node);
        }
        this.heap.sort((a, b) => a.freq - b.freq);
    }

    mergeNodes() {
        while (this.heap.length > 1) {
            const node1 = this.heap.shift();
            const node2 = this.heap.shift();

            const merged = new HeapNode(null, node1.freq + node2.freq);
            merged.left = node1;
            merged.right = node2;

            this.heap.push(merged);
            this.heap.sort((a, b) => a.freq - b.freq);
        }
    }

    makeCodesHelper(root, currentCode) {
        if (!root) {
            return;
        }

        if (root.char !== null) {
            this.codes[root.char] = currentCode;
            this.reverseMapping[currentCode] = root.char;
            return;
        }

        this.makeCodesHelper(root.left, currentCode + "0");
        this.makeCodesHelper(root.right, currentCode + "1");
    }

    makeCodes() {
        const root = this.heap.shift();
        const currentCode = "";
        this.makeCodesHelper(root, currentCode);
    }

    getEncodedText(text) {
        let encodedText = "";
        for (const character of text) {
            encodedText += this.codes[character];
        }
        return encodedText;
    }

    padEncodedText(encodedText) {
        const extraPadding = 8 - (encodedText.length % 8);
        for (let i = 0; i < extraPadding; i++) {
            encodedText += "0";
        }

        const paddedInfo = extraPadding.toString(2).padStart(8, '0');
        encodedText = paddedInfo + encodedText;
        return encodedText;
    }

    getByteArray(paddedEncodedText) {
        if (paddedEncodedText.length % 8 !== 0) {
            console.error("Encoded text not padded properly");
            process.exit(1);
        }

        const byteArray = [];
        for (let i = 0; i < paddedEncodedText.length; i += 8) {
            const byte = paddedEncodedText.slice(i, i + 8);
            byteArray.push(parseInt(byte, 2));
        }
        return Buffer.from(byteArray);
    }

    compress() {
        const filename = path.parse(this.filePath).name;
        const outputPath = `uploads/${filename}.bin`;

        const text = fs.readFileSync(this.filePath, 'utf8').trim();

        const frequency = this.makeFrequencyDict(text);
        this.makeHeap(frequency);
        this.mergeNodes();
        this.makeCodes();

        const encodedText = this.getEncodedText(text);
        const paddedEncodedText = this.padEncodedText(encodedText);

        const byteArray = this.getByteArray(paddedEncodedText);
        fs.writeFileSync(outputPath, byteArray);

        console.log("Compressed");
        return outputPath;
    }

    removePadding(paddedEncodedText) {
        const paddedInfo = paddedEncodedText.slice(0, 8);
        const extraPadding = parseInt(paddedInfo, 2);

        paddedEncodedText = paddedEncodedText.slice(8);
        const encodedText = paddedEncodedText.slice(0, -extraPadding);

        return encodedText;
    }

    decodeText(encodedText) {
        let currentCode = "";
        let decodedText = "";

        for (const bit of encodedText) {
            currentCode += bit;
            if (this.reverseMapping[currentCode]) {
                const character = this.reverseMapping[currentCode];
                decodedText += character;
                currentCode = "";
            }
        }

        return decodedText;
    }

    decompress(inputPath) {
        const filename = path.parse(this.filePath).name;
        const outputPath = `uploads/${filename}_decompressed.txt`;

        const bitString = fs.readFileSync(inputPath)
            .reduce((acc, byte) => acc + byte.toString(2).padStart(8, '0'), '');

        const encodedText = this.removePadding(bitString);

        const decompressedText = this.decodeText(encodedText);

        fs.writeFileSync(outputPath, decompressedText);

        console.log("Decompressed");
        return outputPath;
    }
}

module.exports = { HuffmanCoding };
