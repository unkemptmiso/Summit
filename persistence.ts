
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
            showDirectoryDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
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

    // Chart
    chartToggles: {
        netWorth: boolean;
        liquid: boolean;
        liabilities: boolean;
        tracking: boolean;
    };

    // Custom Colors
    customColors?: Record<string, string>;

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

export async function saveToFile(handleOrPath: FileSystemFileHandle | string, data: AppData) {
    const content = JSON.stringify(data, null, 2);

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

export async function readFile(handleOrPath: FileSystemFileHandle | string): Promise<AppData> {
    if (typeof handleOrPath === 'string') {
        // Electron
        if (window.electronAPI) {
            const result = await window.electronAPI.readFile(handleOrPath);
            if (!result.success) throw new Error(result.error);
            return JSON.parse(result.content!) as AppData;
        }
        throw new Error("Electron API missing");
    } else {
        // Browser
        const file = await handleOrPath.getFile();
        const text = await file.text();
        return JSON.parse(text) as AppData;
    }
}
