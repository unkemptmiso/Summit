export { };

declare global {
    interface Window {
        electronAPI?: {
            saveFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
            readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
            showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
            showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
            saveDirectoryDialog: () => Promise<FileSystemHandle>;
            showDirectoryDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
            ensureDir: (path: string) => Promise<{ success: boolean; error?: string }>;
            saveReceipt: (path: string, buffer: ArrayBuffer) => Promise<{ success: boolean; error?: string }>;

            // Updates
            checkForUpdates: () => Promise<any>;
            quitAndInstall: () => Promise<void>;
            getAppVersion: () => Promise<string>;
            onUpdateStatus: (callback: (data: { status: string; data?: any }) => void) => () => void;
        };
        showSavePicker?: (options?: any) => Promise<FileSystemFileHandle>;
        showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    }

    // Fallback for environments where these aren't defined
    interface FileSystemHandle {
        kind: 'file' | 'directory';
        name: string;
    }

    interface FileSystemFileHandle extends FileSystemHandle {
        kind: 'file';
        getFile(): Promise<File>;
        createWritable(options?: any): Promise<FileSystemWritableFileStream>;
    }

    interface FileSystemWritableFileStream extends WritableStream {
        write(data: any): Promise<void>;
        close(): Promise<void>;
    }
}
