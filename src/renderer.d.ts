export { };

declare global {
    interface Window {
        electronAPI?: {
            saveFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
            readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
            showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
            showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
        };
        showSavePicker?: (options?: any) => Promise<FileSystemFileHandle>;
        showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    }

    // Fallback for environments where these aren't defined (avoiding 'Cannot find name')
    // We use simple shapes that satisfy our usage.
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
