import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import DataTable from "../components/DataTable";
import ErrorModal from "../components/ErrorModal";
import { Tab } from '@headlessui/react';

const UploadFile = () => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState({});
    const [importedData, setImportedData] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState("");
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [showImported, setShowImported] = useState(false);

    const backendEndpoint = import.meta.env.VITE_API_ENDPOINT || "http://localhost:5000";

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setShowImported(false); 
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        maxSize: 2 * 1024 * 1024,
        multiple: false
    });

    const uploadFile = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${backendEndpoint}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.errors && Object.keys(response.data.errors).length > 0) {
                setErrors(response.data.errors);
            }

            if (response.data.preview) {
                setPreviewData(response.data.preview);
                setSelectedSheet(Object.keys(response.data.preview)[0]);
                setShowPreview(true);
                setShowImported(false);
            }
        } catch (error) {
            alert("Error processing file");
            console.error(error);
        }
    };

    const handleDeleteRow = (sheetName, rowIndex) => {
        const confirmed = window.confirm("Are you sure you want to delete this row?");
        if (confirmed) {
            setPreviewData(prev => ({
                ...prev,
                [sheetName]: prev[sheetName].filter((_, idx) => idx !== rowIndex)
            }));
        }
    };

    const importData = async () => {
        try {
            const validData = {};
            Object.keys(previewData).forEach(sheet => {
                validData[sheet] = previewData[sheet].filter(row => !row._deleted);
            });

            const response = await axios.post(`${backendEndpoint}/import`, { data: validData });
            
            if (response.data.importedData) {
                setImportedData(response.data.importedData);
                setShowImported(true);
                setShowPreview(false);
                alert(`Successfully imported ${response.data.imported} records!`);
            }
        } catch (error) {
            alert("Error importing data");
            console.error(error);
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {!showPreview && !showImported && (
                <div className="mb-4">
                    <div {...getRootProps()} className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer rounded-lg hover:border-gray-400">
                        <input {...getInputProps()} />
                        <p>{file ? file.name : "Drag & drop an Excel file here or click to upload"}</p>
                        <p className="text-sm text-gray-500 mt-2">Only .xlsx files up to 2MB are accepted</p>
                    </div>
                    <button 
                        onClick={uploadFile}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Upload and Preview
                    </button>
                </div>
            )}

            {showPreview && Object.keys(previewData).length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-4">Preview Data</h2>
                    <Tab.Group>
                        <Tab.List className="flex border-b mb-4">
                            {Object.keys(previewData).map((sheet) => (
                                <Tab
                                    key={sheet}
                                    className={({ selected }) =>
                                        `px-4 py-2 ${selected ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`
                                    }
                                >
                                    {sheet}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels>
                            {Object.keys(previewData).map((sheet) => (
                                <Tab.Panel key={sheet}>
                                    <DataTable 
                                        data={previewData[sheet]}
                                        onDeleteRow={(rowIndex) => handleDeleteRow(sheet, rowIndex)}
                                    />
                                </Tab.Panel>
                            ))}
                        </Tab.Panels>
                    </Tab.Group>

                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={() => {
                                setShowPreview(false);
                                setFile(null);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            Upload Another File
                        </button>
                        <button
                            onClick={importData}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Import Valid Data
                        </button>
                    </div>
                </div>
            )}

            {showImported && importedData.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-4">Imported Data</h2>
                    <DataTable 
                        data={importedData}
                        hideDelete={true}
                    />
                    <button
                        onClick={() => {
                            setShowImported(false);
                            setFile(null);
                            setPreviewData({});
                        }}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Upload New File
                    </button>
                </div>
            )}

            <ErrorModal 
                errors={errors}
                isOpen={Object.keys(errors).length > 0}
                onClose={() => setErrors({})}
            />
        </div>
    );
};

export default UploadFile;