"use client";
import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const QRScanner = ({ onScanSuccess, onClose }) => {
    const [isScanning, setIsScanning] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let active = true;

        if (videoRef.current) {
            codeReader
                .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
                    if (result && active) {
                        onScanSuccess(result.getText()); // Return the scanned location ID
                        setIsScanning(false);
                    }
                    if (error && active) {
                        console.error("QR Scanner error:", error);
                    }
                })
                .catch((err) => {
                    console.error("QR Scanner setup error:", err);
                });

            return () => {
                active = false;
                codeReader.reset();
            };
        }
    }, [onScanSuccess]);

    return (
        <div className="qr-scanner-overlay">
            {isScanning ? (
                <>
                    <video ref={videoRef} width="100%" height="100%" />
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white py-2 px-4 rounded-md"
                    >
                        Close Scanner
                    </button>
                </>
            ) : (
                <button
                    onClick={onClose}
                    className="bg-red-500 text-white py-2 px-4 rounded-md"
                >
                    Close Scanner
                </button>
            )}
        </div>
    );
};

export default QRScanner;
