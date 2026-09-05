import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
    PROGRESS_INTERVAL_MS,
    PROGRESS_STEP,
    REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { isSignedIn } = useOutletContext<AuthContext>();

    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    const processFile = (selectedFile: File) => {
        if (!isSignedIn) {
            return;
        }

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        setFile(selectedFile);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                return;
            }

            progressIntervalRef.current = setInterval(() => {
                setProgress((currentProgress) => {
                    const nextProgress = Math.min(currentProgress + PROGRESS_STEP, 100);

                    if (nextProgress === 100 && progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                        setTimeout(() => onComplete?.(reader.result as string), REDIRECT_DELAY_MS);
                    }

                    return nextProgress;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) {
            return;
        }

        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (isSignedIn) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (!isSignedIn) {
            return;
        }

        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                <input
                    type="file"
                    className="drop-input"
                    accept=".jpeg,.png,.jpg"
                    disabled={!isSignedIn}
                    onChange={handleChange}
                />
                <div className="drop-content">
                    <div className="drop-icon">
                        <UploadIcon size={20}/>

                    </div>
                    <p>
                        {isSignedIn?(
                            "Click to upload or just drag and drop"
                        ):(
                            "Sign in or sign up with Puter to upload"
                        )}
                    </p>
                    <p className="help">
                        Maximum file size 10MB.
                    </p>
                </div>
                
                </div>
            ) : (
                <div className="upload-status">
                <div className="status-content">
                    <div className="status-icon">
                        {progress === 100 ? (
                            <CheckCircle2 className="check"/>
                        ):(
                            <ImageIcon size={20}/>

                        )}
                    </div>

                    <h3>{file.name}</h3>

                    <div className="progress">
                        <div className="bar" style={{ width: `${progress}%` }}>
                        </div>
                        <p className="status-text">
                            {progress <100 ? 'Analysing Floor Plan...': 'Redirecting...'}
                        </p>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default Upload