
import {
    Transaction,
    AssetCategory,
    IncomeStream,
    MonthlyHistoryEntry,
    IncomeHistoryEntry,
    YearlyIncomeEntry,
    DrivingLogEntry,
    RecurringExpense
} from './types';

// --- Persistence Types ---

export interface EncryptedData {
    isEncrypted: true;
    version: number;
    salt: string;    // Hex
    iv: string;      // Hex
    data: string;    // Hex (Ciphertext)
}

export type PersistenceStrategy = 'electron' | 'browser';

// Extend Window interface
declare global {
    interface Window {
        showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>;
        showOpenFilePicker(options?: any): Promise<FileSystemFileHandle[]>;
        electronAPI?: {
            saveFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
            readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
            showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
            showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
            ensureDir: (path: string) => Promise<{ success: boolean; error?: string }>;
            saveReceipt: (path: string, buffer: ArrayBuffer) => Promise<{ success: boolean; error?: string }>;
            listFiles: (path: string) => Promise<{ success: boolean; files: { name: string; size: number; mtime: number; isDirectory: boolean }[]; error?: string }>;
            deleteFile: (path: string) => Promise<{ success: boolean; error?: string }>;
            showDirectoryDialog: (title?: string) => Promise<{ canceled: boolean; filePaths: string[] }>;
            getAppVersion: () => Promise<string>;
            onUpdateStatus: (callback: (data: { status: string; data?: any }) => void) => () => void;
            checkForUpdates: () => Promise<{ status: string; data?: any }>;
            quitAndInstall: () => Promise<void>;
            openUpdateFolder: () => Promise<{ success: boolean; error?: string }>;
            getUpdateLog: () => Promise<string>;
        };
    }
}

interface SaveFilePickerOptions {
    types?: { description: string; accept: Record<string, string[]> }[];
    suggestedName?: string;
}

interface OpenFilePickerOptions {
    types?: { description: string; accept: Record<string, string[]> }[];
    multiple?: boolean;
}

export interface AppData {
    // UI State
    activeTab: string;
    currentTheme: string;
    colorMode: 'light' | 'dark' | 'midnight';
    userName?: string;
    isPasswordProtectionEnabled?: boolean;
    passwordHash?: string;
    appFontSize: 'sm' | 'base' | 'lg';

    // Data State - Time
    currentYear: number;
    currentMonth: number;

    // Expenses
    transactions: Transaction[];
    assetStructure: AssetCategory[];
    monthlyHistory: MonthlyHistoryEntry[];
    recurringExpenses: RecurringExpense[];
    categories: string[];
    paymentMethods: string[];

    // Business
    businessTransactions: Transaction[];
    businessCategories: string[];
    businessPaymentMethods: string[];
    businessRecurringExpenses: RecurringExpense[];
    businessSearchQuery?: string; // Optional as it might be transient

    // Income
    incomeStreams: IncomeStream[];
    incomeHistory: IncomeHistoryEntry[];
    yearlyIncomeHistory: YearlyIncomeEntry[];
    incomeChartMetric: 'gross' | 'net';

    // Driving
    drivingLog: DrivingLogEntry[];
    drivingPurposes: string[];
    yearlyMileageRates?: Record<string, number>;
    yearlyOdometerStart?: Record<string, number>;
    yearlyOdometerEnd?: Record<string, number>;

    // Chart
    chartToggles: {
        netWorth: boolean;
        liquid: boolean;
        liabilities: boolean;
        tracking: boolean;
    };

    // Custom Colors
    customColors?: Record<string, string>;
    yearlyComments?: Record<string, string>;

    // Tab Visibility
    hiddenTabs?: string[];

    // Dashboard Customization
    dashboardOrder?: string[];
    hiddenDashboardWidgets?: string[];

    // Scratch Pad
    scratchPadUrl?: string;

    // Receipt Directories
    receiptsDir?: string;
    businessReceiptsDir?: string;
    versionHistoryDir?: string;
}

// --- Electron Types ---
// ... specific Electron return types usually come from 'electron' package, 
// but we can mock them broadly to avoid TS issues if 'electron' isn't in dependencies of renderer
namespace Electron {
    export interface SaveDialogReturnValue {
        canceled: boolean;
        filePath?: string;
    }
    export interface OpenDialogReturnValue {
        canceled: boolean;
        filePaths: string[];
    }
}



export function getStrategy(): PersistenceStrategy {
    return window.electronAPI ? 'electron' : 'browser';
}

export async function saveToFile(handleOrPath: FileSystemFileHandle | string, data: AppData | EncryptedData | string) {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    if (typeof handleOrPath === 'string') {
        // Electron
        if (window.electronAPI) {
            const result = await window.electronAPI.saveFile(handleOrPath, content);
            if (!result.success) throw new Error(result.error);
        }
    } else {
        // Browser
        const writable = await handleOrPath.createWritable();
        await writable.write(content);
        await writable.close();
    }
}

export async function getNewFileHandle(): Promise<FileSystemFileHandle | string> {
    if (window.electronAPI) {
        const result = await window.electronAPI.showSaveDialog();
        if (result.canceled || !result.filePath) throw new Error("Cancelled");
        return result.filePath;
    }

    // Browser fallback
    const opts: SaveFilePickerOptions = {
        types: [{ description: 'Summit Data File', accept: { 'application/json': ['.json'] } }],
        suggestedName: 'summit_data.json',
    };
    return window.showSaveFilePicker!(opts);
}

export async function getOpenFileHandle(): Promise<FileSystemFileHandle | string> {
    if (window.electronAPI) {
        const result = await window.electronAPI.showOpenDialog();
        if (result.canceled || result.filePaths.length === 0) throw new Error("Cancelled");
        return result.filePaths[0];
    }

    // Browser fallback
    const opts: OpenFilePickerOptions = {
        types: [{ description: 'Summit Data File', accept: { 'application/json': ['.json'] } }],
        multiple: false,
    };
    const handles = await window.showOpenFilePicker!(opts);
    return handles[0];
}

export async function readFile(handleOrPath: FileSystemFileHandle | string): Promise<AppData | EncryptedData> {
    if (typeof handleOrPath === 'string') {
        // Electron
        if (window.electronAPI) {
            const result = await window.electronAPI.readFile(handleOrPath);
            if (!result.success) throw new Error(result.error);
            return JSON.parse(result.content!);
        }
        throw new Error("Electron API missing");
    } else {
        // Browser
        const validHandle = handleOrPath as FileSystemFileHandle;
        const file = await validHandle.getFile();
        const text = await file.text();
        return JSON.parse(text);
    }
}

// --- Encryption Helpers ---

const ENC_ALGO = { name: 'AES-GCM', length: 256 };
const KDF_ALGO = { name: 'PBKDF2', hash: 'SHA-256' };

function buffToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuff(hex: string): ArrayBuffer {
    const tokens = hex.match(/.{1,2}/g);
    if (!tokens) return new ArrayBuffer(0);
    return new Uint8Array(tokens.map(byte => parseInt(byte, 16))).buffer;
}

export async function deriveKey(password: string, saltHex: string | null = null): Promise<{ key: CryptoKey; salt: string }> {
    const enc = new TextEncoder();

    let salt: Uint8Array;
    if (saltHex) {
        const buffer = hexToBuff(saltHex);
        // Ensure we have a valid buffer for the salt
        if (buffer.byteLength === 0) {
            salt = crypto.getRandomValues(new Uint8Array(16));
        } else {
            salt = new Uint8Array(buffer);
        }
    } else {
        salt = crypto.getRandomValues(new Uint8Array(16));
    }

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            ...KDF_ALGO,
            salt: salt as any,
            iterations: 100000
        },
        keyMaterial,
        ENC_ALGO,
        false,
        ['encrypt', 'decrypt']
    );

    return { key, salt: buffToHex(salt.buffer as ArrayBuffer) };
}

export async function encryptData(data: AppData, password: string): Promise<EncryptedData> {
    const { key, salt } = await deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));

    const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
    );

    return {
        isEncrypted: true,
        version: 1,
        salt: salt,
        iv: buffToHex(iv.buffer),
        data: buffToHex(encryptedContent)
    };
}

export async function decryptData(encrypted: EncryptedData, password: string): Promise<AppData> {
    try {
        const { key } = await deriveKey(password, encrypted.salt);
        const iv = hexToBuff(encrypted.iv);
        const data = hexToBuff(encrypted.data);

        const decryptedContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decryptedContent));
    } catch (e) {
        throw new Error("Decryption failed");
    }
}
