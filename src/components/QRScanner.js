"use client";
import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const QRScanner = ({ onScanSuccess }) => {
    const [isScanning, setIsScanning] = useState(true);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let active = true;

        const startScanning = async () => {
            try {
                if (videoRef.current) {
                    await codeReader.decodeFromVideoDevice(
                        null, 
                        videoRef.current, 
                        (result, error) => {
                            if (result && active) {
                                onScanSuccess(result.getText());
                                setIsScanning(false);
                            }
                            if (error && active && error.name !== 'NotFoundException') {
                                // Only log non-NotFoundException errors
                                console.error("QR Scanner error:", error);
                                setError("Camera error. Please check permissions.");
                            }
                        }
                    );
                }
            } catch (err) {
                console.error("QR Scanner setup error:", err);
                setError("Failed to start camera. Please check permissions.");
            }
        };

        startScanning();

        return () => {
            active = false;
            try {
                codeReader.reset();
            } catch (err) {
                console.error("Error resetting scanner:", err);
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="qr-scanner-container">
            {error ? (
                <div className="text-center p-4">
                    <p className="text-red-500 mb-2">{error}</p>
                    <p className="text-sm text-gray-600">Please allow camera access and try again.</p>
                </div>
            ) : (
                <div className="relative">
                    <video 
                        ref={videoRef} 
                        className="w-full h-64 object-cover rounded-lg"
                        autoPlay
                        playsInline
                        muted
                    />
                    {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-lg p-4">
                                <div className="animate-pulse text-white text-center">
                                    <div className="text-lg font-semibold mb-2">Scanning...</div>
                                    <div className="text-sm">Point camera at QR code</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QRScanner;
