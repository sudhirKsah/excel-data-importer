import React from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';

const ErrorModal = ({ errors, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <HeadlessDialog.Panel className="bg-white rounded-lg max-w-3xl w-full p-6">
                    <HeadlessDialog.Title className="text-lg font-medium text-red-600 mb-4">
                        Validation Errors
                    </HeadlessDialog.Title>

                    <div className="overflow-y-auto max-h-96">
                        <div className="space-y-4">
                            {Object.entries(errors).map(([sheet, sheetErrors]) => (
                                <div key={sheet} className="border rounded p-4">
                                    <h3 className="font-medium mb-2">{sheet}</h3>
                                    <ul className="space-y-2">
                                        {sheetErrors.map((error, index) => (
                                            <li key={index} className="text-sm text-red-600">
                                                Row {error.row}: {error.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </HeadlessDialog.Panel>
            </div>
        </HeadlessDialog>
    );
};

export default ErrorModal;