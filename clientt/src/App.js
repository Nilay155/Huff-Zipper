import React, { useState } from 'react';

function App() {
    const [file, setFile] = useState(null);
    const [compressedFileUrl, setCompressedFileUrl] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/compress', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setCompressedFileUrl(data.url);
            } else {
                console.error('Error uploading file:', response.statusText);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className="App">
            <h1>Huffman File Compressor</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Compress</button>
            </form>
            {compressedFileUrl && (
                <div>
                    <h2>Compressed File:</h2>
                    <a href={compressedFileUrl} download>
                        Download Compressed File
                    </a>
                </div>
            )}
        </div>
    );
}

export default App;
