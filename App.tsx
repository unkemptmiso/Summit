import React, { useState, useMemo, useRef, ChangeEvent, useEffect } from 'react';
import JSZip from 'jszip';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  TrendingUp,
  Briefcase,
  Car,
  Settings,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  FileUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ArrowUpCircle,
  FolderPlus,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  LineChart,
  Activity,
  Calendar,
  Eye,
  EyeOff,
  Search,
  X,
  Download,
  Check,
  Edit2,
  Save,
  Palette,
  Type,
  Repeat,
  Upload,
  Archive,
  Mountain,
  FileJson,
  Save as SaveIcon,
  FolderOpen
} from 'lucide-react';
import {
  Transaction,
  AssetCategory,
  IncomeStream,
  MonthlyHistoryEntry,
  IncomeHistoryEntry,
  DrivingLogEntry,
  CategoryStat,
  AssetItem,
  RecurringExpense
} from './types';
import {
  AppData,
  saveToFile,
  getNewFileHandle,
  getOpenFileHandle,
  readFile
} from './persistence';

// --- Constants & Initial Data ---
const INITIAL_CATEGORIES = [
  "Rent", "Mortgage", "Food - Groceries", "Food - Eating Out", "Fun",
  "Gifts", "Household items", "Fitness", "Lift/Uber", "Travel (tickets and lodging)",
  "Living", "Clothing", "Health care", "Miscellaneous", "Business", "Baby",
  "Insurance", "Car", "Investment"
];

const INITIAL_BUSINESS_CATEGORIES = [
  "Supplies",
  "Advertising",
  "Office expense",
  "Taxes and licenses",
  "Travel and meals: Travel; Deductible meals",
  "Insurance (other than health)",
  "Legal and professional services",
  "Car and truck expenses",
  "Commissions and fees",
  "Contract labor",
  "Depletion",
  "Depreciation and section 179 expense",
  "Employee benefit programs",
  "Energy efficient commercial buildings deduction",
  "Interest: Mortgage; Other",
  "Pension and profit-sharing plans",
  "Rent or lease: Vehicles/machinery; Other business property",
  "Repairs and maintenance",
  "Wages",
  "Other expenses"
];

const INITIAL_PAYMENT_METHODS = ["Chase Sapphire", "Amex Gold", "Wells Fargo", "Cash", "Debit Card"];

const INITIAL_DRIVING_PURPOSES = [
  "New Client Advertising",
  "Client Meeting",
  "Clinical Day",
  "Networking",
  "Licensing"
];

const INITIAL_INCOME_STREAMS: IncomeStream[] = [
  { id: '1', name: 'W-2 (Main Job)', grossAmount: 0, netAmount: 0 },
  { id: '2', name: 'LLC Income', grossAmount: 0, netAmount: 0 },
  { id: '3', name: 'Investment Income', grossAmount: 0, netAmount: 0 }
];

const INITIAL_ASSET_STRUCTURE: AssetCategory[] = [
  {
    id: '1',
    name: 'Liquid Assets & Investments',
    items: [
      { id: 'a1', name: 'Savings Account', value: '' },
      { id: 'a2', name: '401(k)', value: '' },
      { id: 'a3', name: 'Brokerage', value: '' }
    ]
  },
  {
    id: '2',
    name: 'Liabilities',
    isLiability: true,
    items: [
      { id: 'l1', name: 'Mortgage Principal', value: '' },
      { id: 'l2', name: 'Car Loan', value: '' }
    ]
  }
];

const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [
  { id: 'r1', description: 'Rent / Mortgage', amount: 2500, category: 'Rent', method: 'Wells Fargo' },
  { id: 'r2', description: 'Netflix', amount: 15.99, category: 'Fun', method: 'Chase Sapphire' },
  { id: 'r3', description: 'Spotify', amount: 9.99, category: 'Fun', method: 'Chase Sapphire' },
  { id: 'r4', description: 'Gym Membership', amount: 50, category: 'Fitness', method: 'Amex Gold' },
  { id: 'r5', description: 'Car Insurance', amount: 120, category: 'Insurance', method: 'Wells Fargo' },
];

// --- Theme Configurations ---
const THEMES = {
  blue: {
    name: 'Ocean',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-500',
    text: 'text-blue-500',
    textHover: 'hover:text-blue-400',
    border: 'border-blue-500',
    borderHover: 'hover:border-blue-400',
    shadow: 'shadow-blue-900/20',
    hex: '#2563eb',
    accentRaw: 'blue'
  },
  purple: {
    name: 'Galaxy',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-500',
    text: 'text-purple-500',
    textHover: 'hover:text-purple-400',
    border: 'border-purple-500',
    borderHover: 'hover:border-purple-400',
    shadow: 'shadow-purple-900/20',
    hex: '#9333ea',
    accentRaw: 'purple'
  },
  emerald: {
    name: 'Forest',
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-500',
    text: 'text-emerald-500',
    textHover: 'hover:text-emerald-400',
    border: 'border-emerald-500',
    borderHover: 'hover:border-emerald-400',
    shadow: 'shadow-emerald-900/20',
    hex: '#059669',
    accentRaw: 'emerald'
  },
  orange: {
    name: 'Sunset',
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-500',
    text: 'text-orange-500',
    textHover: 'hover:text-orange-400',
    border: 'border-orange-500',
    borderHover: 'hover:border-orange-400',
    shadow: 'shadow-orange-900/20',
    hex: '#ea580c',
    accentRaw: 'orange'
  },
  rose: {
    name: 'Rose',
    primary: 'bg-rose-600',
    primaryHover: 'hover:bg-rose-500',
    text: 'text-rose-500',
    textHover: 'hover:text-rose-400',
    border: 'border-rose-500',
    borderHover: 'hover:border-rose-400',
    shadow: 'shadow-rose-900/20',
    hex: '#e11d48',
    accentRaw: 'rose'
  },
};

const SIDEBAR_TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'expenses', icon: Receipt, label: 'Spending Ledger' },
  { id: 'assets', icon: Wallet, label: 'Asset Watch' },
  { id: 'income', icon: TrendingUp, label: 'Income Manager' },
  { id: 'business', icon: Briefcase, label: 'Business Center' },
  { id: 'mileage', icon: Car, label: 'Driving Log' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

const DASHBOARD_WIDGETS = [
  { id: 'stats', label: 'Key Metrics (Net Worth, Spending, Income)' },
  { id: 'savings', label: 'Savings/Burn Rate' },
  { id: 'networth-chart', label: 'Net Worth History' },
  { id: 'expense-chart', label: 'Expense Trends' }
];

const App: React.FC = () => {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState('expenses');
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [appFontSize, setAppFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [toast, setToast] = useState<{ message: string, show: boolean } | null>(null);
  const [dashboardChartTimeView, setDashboardChartTimeView] = useState<'month' | 'year'>('month');
  const [dashboardOrder, setDashboardOrder] = useState<string[]>(DASHBOARD_WIDGETS.map(w => w.id));
  const [hiddenDashboardWidgets, setHiddenDashboardWidgets] = useState<string[]>([]);

  const theme = THEMES[currentTheme];

  // --- Data State ---
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Expenses State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assetStructure, setAssetStructure] = useState<AssetCategory[]>(INITIAL_ASSET_STRUCTURE);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistoryEntry[]>([]);

  // Business State
  const [businessTransactions, setBusinessTransactions] = useState<Transaction[]>([]);
  const [businessCategories, setBusinessCategories] = useState<string[]>(INITIAL_BUSINESS_CATEGORIES);
  const [businessPaymentMethods, setBusinessPaymentMethods] = useState<string[]>(INITIAL_PAYMENT_METHODS);
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [isBusinessExportModalOpen, setIsBusinessExportModalOpen] = useState(false);
  const [isBusinessImportLedgerModalOpen, setIsBusinessImportLedgerModalOpen] = useState(false);
  const [businessImportLedgerYear, setBusinessImportLedgerYear] = useState(new Date().getFullYear());
  const [businessExportRange, setBusinessExportRange] = useState('currentViewMonth');
  const [businessRecurringExpenses, setBusinessRecurringExpenses] = useState<RecurringExpense[]>(INITIAL_RECURRING_EXPENSES);
  const [isBusinessRecurringModalOpen, setIsBusinessRecurringModalOpen] = useState(false);
  const [selectedBusinessRecurringIds, setSelectedBusinessRecurringIds] = useState<Set<string>>(new Set());

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Export & Import State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportLedgerModalOpen, setIsImportLedgerModalOpen] = useState(false);
  const [importLedgerYear, setImportLedgerYear] = useState(new Date().getFullYear());
  const [exportRange, setExportRange] = useState('currentViewMonth');

  // Global Export State
  const [isExportAllModalOpen, setIsExportAllModalOpen] = useState(false);
  const [exportAllRange, setExportAllRange] = useState('allTime');

  // Recurring Expenses State
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(INITIAL_RECURRING_EXPENSES);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<Set<string>>(new Set());

  // Income State
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>(INITIAL_INCOME_STREAMS);
  const [incomeHistory, setIncomeHistory] = useState<IncomeHistoryEntry[]>([]);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [newIncomeName, setNewIncomeName] = useState("");
  const [expandedIncomeHistoryIndex, setExpandedIncomeHistoryIndex] = useState<number | null>(null);
  // toggle for income chart 'gross' or 'net'
  const [incomeChartMetric, setIncomeChartMetric] = useState<'gross' | 'net'>('net');

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(INITIAL_PAYMENT_METHODS);
  const [drivingPurposes, setDrivingPurposes] = useState<string[]>(INITIAL_DRIVING_PURPOSES);
  const [drivingLog, setDrivingLog] = useState<DrivingLogEntry[]>([]);
  const [yearlyMileageRates, setYearlyMileageRates] = useState<Record<string, number>>({
    '2024': 0.67,
    '2025': 0.70
  });
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);

  // Asset Editing State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"asset" | "liability" | "tracking">("asset");
  const [addingAssetTo, setAddingAssetTo] = useState<string | null>(null);
  const [newAssetName, setNewAssetName] = useState("");

  // Settings State
  const [settingsActiveSection, setSettingsActiveSection] = useState('Appearance');
  const [settingsSubSection, setSettingsSubSection] = useState<string | null>(null);
  const [editingItemOriginalName, setEditingItemOriginalName] = useState<string | null>(null);
  const [editingItemNewName, setEditingItemNewName] = useState("");
  const [isAddingSettingsItem, setIsAddingSettingsItem] = useState(false);
  const [newSettingsItemName, setNewSettingsItemName] = useState("");

  // History Expansion State
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState<number | null>(null);

  // History Comment Modal State
  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean;
    type: 'asset' | 'income';
    displayDate: string;
    sortKey: string;
  }>({ isOpen: false, type: 'asset', displayDate: '', sortKey: '' });
  const [pendingComment, setPendingComment] = useState("");

  // Chart State (Assets)
  const [chartTimeView, setChartTimeView] = useState<'month' | 'year'>('month');
  const [chartToggles, setChartToggles] = useState({
    netWorth: true,
    liquid: false,
    liabilities: false,
    tracking: false
  });
  const [chartSelectedAssetId, setChartSelectedAssetId] = useState<string>("");

  // Chart State (Income)
  const [incomeChartTimeView, setIncomeChartTimeView] = useState<'month' | 'year'>('month');
  const [incomeChartSelectedStreamId, setIncomeChartSelectedStreamId] = useState<string>("");

  // --- Persistence State ---
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  // Electron Auto-Load Effect
  useEffect(() => {
    const loadLastFile = async () => {
      if (window.electronAPI) {
        const lastPath = localStorage.getItem('summit_last_file');
        if (lastPath) {
          try {
            const data = await readFile(lastPath);
            loadData(data);
            setFileHandle(lastPath);
            setSaveStatus('saved');
            setLastSavedTime(new Date());
            setToast({ message: "Resumed last session", show: true });
          } catch (e) {
            console.error("Failed to autoload:", e);
            localStorage.removeItem('summit_last_file');
          }
        }
      }
    };
    loadLastFile();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const businessFileInputRef = useRef<HTMLInputElement>(null);
  const drivingLogFileInputRef = useRef<HTMLInputElement>(null);
  const assetHistoryFileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Logic ---
  const appData: AppData = useMemo(() => ({
    activeTab, currentTheme, appFontSize,
    currentYear, currentMonth,
    transactions, assetStructure, monthlyHistory,
    recurringExpenses, categories, paymentMethods,
    businessTransactions, businessCategories, businessPaymentMethods,
    businessRecurringExpenses, businessSearchQuery,
    incomeStreams, incomeHistory, incomeChartMetric,
    drivingLog, drivingPurposes, yearlyMileageRates,
    chartToggles,
    customColors,
    hiddenTabs,
    dashboardOrder,
    hiddenDashboardWidgets
  }), [
    activeTab, currentTheme, appFontSize,
    currentYear, currentMonth,
    transactions, assetStructure, monthlyHistory,
    recurringExpenses, categories, paymentMethods,
    businessTransactions, businessCategories, businessPaymentMethods,
    businessRecurringExpenses, businessSearchQuery,
    incomeStreams, incomeHistory, incomeChartMetric,
    drivingLog, drivingPurposes, yearlyMileageRates,
    chartToggles,
    customColors,
    hiddenTabs,
    dashboardOrder,
    hiddenDashboardWidgets
  ]);

  const loadData = (data: AppData) => {
    // UI
    if (data.activeTab) setActiveTab(data.activeTab);
    if (data.currentTheme) setCurrentTheme(data.currentTheme as any);
    if (data.appFontSize) setAppFontSize(data.appFontSize);

    // Time
    if (data.currentYear) setCurrentYear(data.currentYear);
    if (data.currentMonth !== undefined) setCurrentMonth(data.currentMonth);

    // Expenses
    if (data.transactions) setTransactions(data.transactions);
    if (data.assetStructure) setAssetStructure(data.assetStructure);
    if (data.monthlyHistory) setMonthlyHistory(data.monthlyHistory);
    if (data.recurringExpenses) setRecurringExpenses(data.recurringExpenses);
    if (data.categories) setCategories(data.categories);
    if (data.paymentMethods) setPaymentMethods(data.paymentMethods);

    // Business
    if (data.businessTransactions) setBusinessTransactions(data.businessTransactions);
    if (data.businessCategories) setBusinessCategories(data.businessCategories);
    if (data.businessPaymentMethods) setBusinessPaymentMethods(data.businessPaymentMethods);
    if (data.businessRecurringExpenses) setBusinessRecurringExpenses(data.businessRecurringExpenses);

    // Income
    if (data.incomeStreams) setIncomeStreams(data.incomeStreams);
    if (data.incomeHistory) setIncomeHistory(data.incomeHistory);
    if (data.incomeChartMetric) setIncomeChartMetric(data.incomeChartMetric);

    // Driving
    if (data.drivingLog) setDrivingLog(data.drivingLog);
    if (data.drivingPurposes) setDrivingPurposes(data.drivingPurposes);
    if (data.yearlyMileageRates) setYearlyMileageRates(data.yearlyMileageRates);

    // Chart
    if (data.chartToggles) setChartToggles(data.chartToggles);

    // Custom Colors
    if (data.customColors) setCustomColors(data.customColors);

    // Tab Visibility
    if (data.hiddenTabs) setHiddenTabs(data.hiddenTabs);

    // Dashboard Customization
    if (data.dashboardOrder) setDashboardOrder(data.dashboardOrder);
    if (data.hiddenDashboardWidgets) setHiddenDashboardWidgets(data.hiddenDashboardWidgets);

    setToast({ message: "Data loaded successfully", show: true });
  };

  // Auto-Save Effect
  useEffect(() => {
    if (!fileHandle) return;

    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveToFile(fileHandle, appData);
        setSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus('error');
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [appData, fileHandle]);

  // Auto-populate asset values from latest history snapshot if current is empty
  useEffect(() => {
    if (monthlyHistory.length === 0) return;

    // Check if current assetStructure is "mostly empty" (no values entered)
    const isCurrentEmpty = assetStructure.every(cat =>
      cat.items.every(item => item.value === '' || item.value === 0 || item.value === '0')
    );

    if (isCurrentEmpty) {
      // Find the latest entry (they are sorted descending by sortKey/date usually)
      const latestEntry = monthlyHistory[0];
      if (latestEntry && latestEntry.snapshot) {
        setAssetStructure(latestEntry.snapshot);
      }
    }
  }, [monthlyHistory]); // Run when history is loaded or updated


  const updateFileHandle = (handle: FileSystemFileHandle | string | null) => {
    setFileHandle(handle);
    if (window.electronAPI && typeof handle === 'string') {
      localStorage.setItem('summit_last_file', handle);
    } else if (handle === null) {
      localStorage.removeItem('summit_last_file');
    }
  };

  const handleCreateNewFile = async () => {
    try {
      const handle = await getNewFileHandle();
      updateFileHandle(handle);
      await saveToFile(handle, appData);
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      setToast({ message: "File created and linked", show: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFile = async () => {
    try {
      const handle = await getOpenFileHandle();
      const data = await readFile(handle);
      loadData(data);
      updateFileHandle(handle);
      setSaveStatus('saved');
      setLastSavedTime(new Date());
    } catch (err) {
      console.error(err);
      alert("Failed to open file");
    }
  };

  const handleSaveAs = async () => {
    try {
      const handle = await getNewFileHandle();
      updateFileHandle(handle);
      await saveToFile(handle, appData);
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      setToast({ message: "Saved as new file", show: true });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Styles Effect ---
  useEffect(() => {
    // Apply font size to root
    const root = document.documentElement;
    if (appFontSize === 'sm') root.style.fontSize = '14px';
    else if (appFontSize === 'lg') root.style.fontSize = '18px';
    else root.style.fontSize = '16px';
  }, [appFontSize]);

  // --- Toast Effect ---
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Calculations ---
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // EXPENSES CALCULATIONS
  const currentMonthData = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  const displayedTransactions = useMemo(() => {
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      // Search all transactions across history
      return transactions.filter(t =>
        (t.description || "").toLowerCase().includes(lower) ||
        (t.category || "").toLowerCase().includes(lower)
      ).sort((a, b) => b.date.localeCompare(a.date));
    }
    return currentMonthData;
  }, [transactions, currentMonthData, searchQuery]);

  const lastMonthData = useMemo(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catTransactions = currentMonthData.filter(t => t.category === cat);
      const thisMonthTotal = catTransactions.reduce((sum, t) => sum + (parseFloat(t.amount.toString()) || 0), 0);
      const isMentioned = catTransactions.length > 0;

      const lastMonthTotal = lastMonthData
        .filter(t => t.category === cat)
        .reduce((sum, t) => sum + (parseFloat(t.amount.toString()) || 0), 0);

      const last12MonthsData = transactions.filter(t => {
        const d = new Date(t.date + 'T00:00:00');
        const now = new Date(currentYear, currentMonth, 1);
        const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        return diff >= 0 && diff < 12 && t.category === cat;
      });
      const avg12M = last12MonthsData.reduce((sum, t) => sum + (parseFloat(t.amount.toString()) || 0), 0) / 12;

      const diffPct = lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0 ? 100 : 0;

      return { name: cat, total: thisMonthTotal, lastTotal: lastMonthTotal, diffPct, avg12M, isMentioned };
    }).filter(s => s.total !== 0 || s.isMentioned).sort((a, b) => b.total - a.total);
  }, [categories, currentMonthData, lastMonthData, transactions, currentYear, currentMonth]);

  const totalMonthlySpend = currentMonthData.reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);

  const currentMonthIncome = useMemo(() => {
    const sortKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    const historyEntry = incomeHistory.find(h => h.sortKey === sortKey);
    if (historyEntry) return historyEntry.totalNet;
    return incomeStreams.reduce((acc, s) => acc + (parseFloat(s.netAmount.toString()) || 0), 0);
  }, [incomeHistory, incomeStreams, currentYear, currentMonth]);

  const savingsAmount = currentMonthIncome - totalMonthlySpend;
  const savingsRate = currentMonthIncome > 0 ? (savingsAmount / currentMonthIncome) * 100 : 0;

  const averageMonthlySpend = useMemo(() => {
    return categoryStats.reduce((acc, curr) => acc + curr.avg12M, 0);
  }, [categoryStats]);

  // BUSINESS CALCULATIONS
  const currentMonthBusinessData = useMemo(() => {
    return businessTransactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [businessTransactions, currentYear, currentMonth]);

  const displayedBusinessTransactions = useMemo(() => {
    if (businessSearchQuery.trim()) {
      const lower = businessSearchQuery.toLowerCase();
      return businessTransactions.filter(t =>
        (t.description || "").toLowerCase().includes(lower) ||
        (t.category || "").toLowerCase().includes(lower)
      ).sort((a, b) => b.date.localeCompare(a.date));
    }
    return currentMonthBusinessData;
  }, [businessTransactions, currentMonthBusinessData, businessSearchQuery]);

  const lastMonthBusinessData = useMemo(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return businessTransactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });
  }, [businessTransactions, currentYear, currentMonth]);

  const businessCategoryStats = useMemo(() => {
    return businessCategories.map(cat => {
      const catTransactions = currentMonthBusinessData.filter(t => t.category === cat);
      const thisMonthTotal = catTransactions.reduce((sum, t) => sum + (parseFloat(t.amount.toString()) || 0), 0);
      const isMentioned = catTransactions.length > 0;

      const lastMonthTotal = lastMonthBusinessData
        .filter(t => t.category === cat)
        .reduce((sum, t) => sum + (parseFloat(t.amount.toString()) || 0), 0);

      const last12MonthsData = businessTransactions.filter(t => {
        const d = new Date(t.date + 'T00:00:00');
        const now = new Date(currentYear, currentMonth, 1);
        const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        return diff >= 0 && diff < 12 && t.category === cat;
      });
      const avg12M = last12MonthsData.reduce((sum, t) => sum + (parseFloat(t.amount.toString()) || 0), 0) / 12;

      const diffPct = lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0 ? 100 : 0;

      return { name: cat, total: thisMonthTotal, lastTotal: lastMonthTotal, diffPct, avg12M, isMentioned };
    }).filter(s => s.total !== 0 || s.isMentioned).sort((a, b) => b.total - a.total);
  }, [businessCategories, currentMonthBusinessData, lastMonthBusinessData, businessTransactions, currentYear, currentMonth]);

  const totalBusinessMonthlySpend = currentMonthBusinessData.reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);

  const totalBusinessSpendYTD = useMemo(() => {
    return businessTransactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);
  }, [businessTransactions, currentYear]);

  const averageBusinessMonthlySpend = useMemo(() => {
    return businessCategoryStats.reduce((acc, curr) => acc + curr.avg12M, 0);
  }, [businessCategoryStats]);

  // NET WORTH CALCULATIONS
  const netWorthData = useMemo(() => {
    let assetsTotal = 0;
    let liabilitiesTotal = 0;
    assetStructure.forEach(cat => {
      if (cat.isTracking) return;
      const catSum = cat.items.reduce((sum, item) => sum + (parseFloat(item.value.toString()) || 0), 0);
      if (cat.isLiability) liabilitiesTotal += catSum;
      else assetsTotal += catSum;
    });
    return assetsTotal - liabilitiesTotal;
  }, [assetStructure]);

  // ASSET ALLOCATION
  const assetAllocationData = useMemo(() => {
    const items: { name: string; total: number; category: string }[] = [];
    assetStructure.forEach(cat => {
      if (cat.isLiability || cat.isTracking) return;
      cat.items.forEach(item => {
        const val = parseFloat(item.value.toString()) || 0;
        if (val > 0) {
          items.push({ name: item.name, total: val, category: cat.name });
        }
      });
    });
    return items.sort((a, b) => b.total - a.total);
  }, [assetStructure]);

  const totalAssetsValue = useMemo(() => assetAllocationData.reduce((acc, curr) => acc + curr.total, 0), [assetAllocationData]);

  const previousNetWorth = useMemo(() => {
    const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;

    const sortKey = `${prevYearVal}-${(prevMonthIndex + 1).toString().padStart(2, '0')}`;
    const legacyDate = `${prevYearVal}-${(prevMonthIndex + 1).toString().padStart(2, '0')}`;

    const entry = monthlyHistory.find(h => h.sortKey === sortKey || h.date === legacyDate);
    const prettyDate = `${months[prevMonthIndex]} ${prevYearVal}`;
    const entryPretty = monthlyHistory.find(h => h.date === prettyDate);

    return entry ? entry.netWorth : entryPretty ? entryPretty.netWorth : 0;
  }, [monthlyHistory, currentMonth, currentYear, months]);

  const monthlyNetDiff = netWorthData - previousNetWorth;
  const monthlyYield = previousNetWorth !== 0 ? (monthlyNetDiff / Math.abs(previousNetWorth)) * 100 : 0;

  const yearlyYield = useMemo(() => {
    const historyInYear = monthlyHistory.filter(h => {
      const y = h.sortKey ? parseInt(h.sortKey.split('-')[0]) : parseInt(h.date.split(' ').pop() || '0');
      return y === currentYear;
    });
    const total = historyInYear.reduce((acc, h) => acc + h.yield, 0) + monthlyYield;
    return total / (historyInYear.length + 1);
  }, [monthlyHistory, currentYear, monthlyYield]);

  // --- Driving Log Logic ---
  const displayedDrivingLog = useMemo(() => {
    return drivingLog
      .filter(l => l.date.startsWith(currentYear.toString()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [drivingLog, currentYear]);

  const totalYearlyMileage = useMemo(() => {
    return displayedDrivingLog.reduce((acc, curr) => acc + (parseFloat(curr.miles.toString()) || 0), 0);
  }, [displayedDrivingLog]);

  const handleAddDrivingLog = () => {
    setDrivingLog(prev => [{
      id: Date.now(),
      date: `${currentYear}-01-01`,
      miles: '',
      destination: '',
      purpose: ''
    }, ...prev]);
  };

  const handleDrivingLogImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        alert("CSV file seems empty or missing headers.");
        return;
      }

      const headerLine = lines[0].toLowerCase();
      const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/^"|"$/g, '').trim());

      const findIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

      const dateIdx = findIndex(['date', 'dt', 'time']);
      const destIdx = findIndex(['destination', 'location', 'place', 'dest', 'where']);
      const milesIdx = findIndex(['miles', 'mileage', 'dist', 'distance']);
      const purposeIdx = findIndex(['purpose', 'reason', 'desc', 'note']);

      if (dateIdx === -1 || milesIdx === -1) {
        alert("Could not identify required 'Date' or 'Miles' columns. Please check your CSV headers.");
        return;
      }

      const newEntries: DrivingLogEntry[] = [];
      let skippedCount = 0;
      let detectedYear = currentYear;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());

        const rawDate = cols[dateIdx];
        const rawMiles = cols[milesIdx];

        if (!rawDate || !rawMiles) {
          skippedCount++;
          continue;
        }

        const milesVal = parseFloat(rawMiles);
        if (isNaN(milesVal)) {
          skippedCount++;
          continue;
        }

        let formattedDate = "";

        // 1. ISO YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          formattedDate = rawDate;
          detectedYear = parseInt(rawDate.substring(0, 4));
        }
        // 2. US MM/DD/YYYY
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
          const [m, d, y] = rawDate.split('/');
          formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          detectedYear = parseInt(y);
        }
        // 3. MM/DD (assume current view year)
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
          const [m, d] = rawDate.split('/');
          formattedDate = `${currentYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        // 4. Try generic Date parse
        else {
          const ts = Date.parse(rawDate);
          if (!isNaN(ts)) {
            const d = new Date(ts);
            formattedDate = d.toISOString().split('T')[0];
            detectedYear = d.getFullYear();
          } else {
            skippedCount++;
            continue;
          }
        }

        newEntries.push({
          id: Math.random().toString(36).substr(2, 9),
          date: formattedDate,
          miles: milesVal,
          destination: (destIdx !== -1 && cols[destIdx]) ? cols[destIdx] : "",
          purpose: (purposeIdx !== -1 && cols[purposeIdx]) ? cols[purposeIdx] : "Imported"
        });
      }

      if (newEntries.length > 0) {
        setDrivingLog(prev => [...prev, ...newEntries]);
        setToast({
          message: `Driving Log for Year ${detectedYear} Imported 🎉 (${newEntries.length} added${skippedCount > 0 ? `, ${skippedCount} skipped` : ''})`,
          show: true
        });
      } else {
        alert("No valid entries found to import.");
      }

      if (drivingLogFileInputRef.current) drivingLogFileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // --- Global Export Logic ---
  const handleExportAll = async () => {
    try {
      const zip = new JSZip();

      const getDateFilter = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (exportAllRange === 'allTime') return true;

        if (exportAllRange === 'lastMonth') {
          const lm = new Date();
          lm.setMonth(lm.getMonth() - 1);
          lm.setDate(1);
          const endLm = new Date(lm);
          endLm.setMonth(endLm.getMonth() + 1);
          endLm.setDate(0);
          return d >= lm && d <= endLm;
        }
        if (exportAllRange === 'last3Months') {
          const m = new Date(); m.setMonth(m.getMonth() - 3); m.setDate(1);
          return d >= m;
        }
        if (exportAllRange === 'last6Months') {
          const m = new Date(); m.setMonth(m.getMonth() - 6); m.setDate(1);
          return d >= m;
        }
        if (exportAllRange === 'ytd') {
          const y = new Date(new Date().getFullYear(), 0, 1);
          return d >= y;
        }
        if (exportAllRange === 'last2Years') {
          const y = new Date(new Date().getFullYear() - 1, 0, 1);
          return d >= y;
        }
        return true;
      };

      // 1. Spending Ledger CSV
      const filteredTransactions = transactions.filter(t => getDateFilter(t.date)).sort((a, b) => a.date.localeCompare(b.date));
      if (filteredTransactions.length > 0) {
        const rows = [
          "Date,Description,Amount,Category,Method",
          ...filteredTransactions.map(t => `${t.date},"${(t.description || "").replace(/"/g, '""')}",${t.amount},${t.category},${t.method}`)
        ];

        // Spending Summary
        rows.push("", "MONTHLY SUMMARY", "Month,Total Spend");
        const monthlySum: { [k: string]: number } = {};
        let yearlySum = 0;
        filteredTransactions.forEach(t => {
          const key = t.date.substring(0, 7);
          const val = parseFloat(t.amount.toString()) || 0;
          monthlySum[key] = (monthlySum[key] || 0) + val;
          yearlySum += val;
        });
        Object.keys(monthlySum).sort().forEach(k => rows.push(`${k},${monthlySum[k].toFixed(2)}`));
        rows.push(`TOTAL YEARLY SPEND (in Range),${yearlySum.toFixed(2)}`);

        zip.file("SpendingLedger.csv", rows.join("\n"));
      }

      // 2. Asset Watch CSV
      const filteredAssets = monthlyHistory.filter(h => getDateFilter(h.sortKey ? h.sortKey + '-01' : h.date)).sort((a, b) => (a.sortKey || "").localeCompare(b.sortKey || ""));
      if (filteredAssets.length > 0 || monthlyHistory.length > 0) {
        const rows = ["Date,Net Worth,Monthly Diff,Monthly Yield,Comments"];
        filteredAssets.forEach(h => {
          rows.push(`${h.date},${h.netWorth},${h.netDiff},${h.yield.toFixed(2)}%,"${(h.comment || "").replace(/"/g, '""')}"`);
        });

        // Yearly Summary
        rows.push("", "YEARLY SUMMARY", "Year,Ending Net Worth,Average Yield");
        const years = Array.from(new Set(monthlyHistory.map(h => h.sortKey ? h.sortKey.split('-')[0] : h.date.split(' ').pop()))).sort();
        years.forEach(y => {
          const yearEntries = monthlyHistory.filter(h => (h.sortKey && h.sortKey.startsWith(y as string)) || h.date.endsWith(y as string)).sort((a, b) => (b.sortKey || "").localeCompare(a.sortKey || "")); // Descending to get latest
          if (yearEntries.length > 0) {
            const endNW = yearEntries[0].netWorth;
            const avgYield = yearEntries.reduce((acc, curr) => acc + curr.yield, 0) / yearEntries.length;
            rows.push(`${y},${endNW},${avgYield.toFixed(2)}%`);
          }
        });

        zip.file("AssetWatch.csv", rows.join("\n"));
      }

      // 3. Income Manager CSV
      const filteredIncome = incomeHistory.filter(h => getDateFilter(h.sortKey ? h.sortKey + '-01' : h.date)).sort((a, b) => (a.sortKey || "").localeCompare(b.sortKey || ""));
      if (filteredIncome.length > 0) {
        const rows = ["Date,Total Gross,Total Net,Comment"];
        filteredIncome.forEach(h => {
          rows.push(`${h.date},${h.totalGross},${h.totalNet},"${(h.comment || "").replace(/"/g, '""')}"`);
        });

        // Summary
        rows.push("", "YEARLY INCOME SUMMARY", "Year,Total Gross,Total Net");
        const incomeMap: { [y: string]: { gross: number, net: number } } = {};
        filteredIncome.forEach(h => {
          const y = h.sortKey ? h.sortKey.split('-')[0] : h.date.split(' ').pop() || "Unknown";
          if (!incomeMap[y]) incomeMap[y] = { gross: 0, net: 0 };
          incomeMap[y].gross += h.totalGross;
          incomeMap[y].net += h.totalNet;
        });
        Object.keys(incomeMap).sort().forEach(y => {
          rows.push(`${y},${incomeMap[y].gross},${incomeMap[y].net}`);
        });

        zip.file("IncomeManager.csv", rows.join("\n"));
      }

      // 4. Business Center CSV
      const filteredBusiness = businessTransactions.filter(t => getDateFilter(t.date)).sort((a, b) => a.date.localeCompare(b.date));
      if (filteredBusiness.length > 0) {
        const rows = [
          "Date,Description,Amount,Category,Method",
          ...filteredBusiness.map(t => `${t.date},"${(t.description || "").replace(/"/g, '""')}",${t.amount},${t.category},${t.method}`)
        ];

        rows.push("", "CUMULATIVE YEARLY SPEND PER CATEGORY", "Year,Category,Total");
        const busCatSum: { [key: string]: number } = {};
        const yearsObj: { [y: string]: number } = {};

        filteredBusiness.forEach(t => {
          const y = t.date.substring(0, 4);
          const key = `${y},${t.category}`;
          const val = parseFloat(t.amount.toString()) || 0;
          busCatSum[key] = (busCatSum[key] || 0) + val;
          yearsObj[y] = (yearsObj[y] || 0) + val;
        });

        Object.keys(busCatSum).sort().forEach(k => rows.push(`${k},${busCatSum[k].toFixed(2)}`));

        rows.push("", "TOTAL SPENDING PER YEAR", "Year,Total");
        Object.keys(yearsObj).sort().forEach(y => rows.push(`${y},${yearsObj[y].toFixed(2)}`));

        zip.file("BusinessCenter.csv", rows.join("\n"));
      }

      // 5. Driving Log CSV
      const filteredDriving = drivingLog.filter(l => getDateFilter(l.date)).sort((a, b) => a.date.localeCompare(b.date));
      if (filteredDriving.length > 0) {
        const rows = [
          "Date,Miles,Destination,Purpose",
          ...filteredDriving.map(l => `${l.date},${l.miles},"${(l.destination || "").replace(/"/g, '""')}","${(l.purpose || "").replace(/"/g, '""')}"`)
        ];

        rows.push("", "SUMMARY", "Year,Total Miles,Rate Used,Total Deduction");
        const driveMap: { [y: string]: number } = {};
        filteredDriving.forEach(l => {
          const y = l.date.substring(0, 4);
          driveMap[y] = (driveMap[y] || 0) + (parseFloat(l.miles.toString()) || 0);
        });
        Object.keys(driveMap).sort().forEach(y => {
          const rate = yearlyMileageRates[y] || 0.67;
          const ded = driveMap[y] * rate;
          rows.push(`${y},${driveMap[y].toFixed(2)},$${rate},${ded.toFixed(2)}`);
        });

        zip.file("DrivingLog.csv", rows.join("\n"));
      }

      // Generate Zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Summit_Export_${exportAllRange}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportAllModalOpen(false);
      setToast({ message: "Export All successful! Downloading zip...", show: true });

    } catch (error) {
      console.error(error);
      alert("Failed to zip files.");
    }
  };


  // --- Chart Data Preparation (ASSETS) ---
  const chartData = useMemo(() => {
    const sortedHistory = [...monthlyHistory].sort((a, b) => {
      const keyA = a.sortKey || a.date;
      const keyB = b.sortKey || b.date;
      return keyA.localeCompare(keyB);
    });

    return sortedHistory.map(entry => {
      let liquid = 0;
      let liabilities = 0;
      let tracking = 0;
      let selectedAssetValue = 0;

      if (entry.snapshot) {
        entry.snapshot.forEach(cat => {
          const catSum = cat.items.reduce((s, i) => s + (parseFloat(i.value.toString()) || 0), 0);

          if (cat.isLiability) liabilities += catSum;
          else if (cat.isTracking) tracking += catSum;
          else liquid += catSum;

          if (chartSelectedAssetId) {
            const foundItem = cat.items.find(i => i.id === chartSelectedAssetId);
            if (foundItem) selectedAssetValue = parseFloat(foundItem.value.toString()) || 0;
          }
        });
      }

      const dateObj = new Date(entry.sortKey ? entry.sortKey + '-01' : entry.date);
      const monthShort = months[dateObj.getMonth()].substring(0, 3);
      const year = dateObj.getFullYear();

      return {
        label: chartTimeView === 'month' ? `${monthShort} '${year.toString().slice(2)}` : year.toString(),
        fullDate: entry.date,
        netWorth: entry.netWorth,
        liquid,
        liabilities,
        tracking,
        selectedAsset: selectedAssetValue
      };
    });
  }, [monthlyHistory, chartTimeView, chartSelectedAssetId]);

  // --- Chart Data Preparation (INCOME) ---
  const incomeChartData = useMemo(() => {
    const sorted = [...incomeHistory].sort((a, b) => (a.sortKey || a.date).localeCompare(b.sortKey || b.date));
    return sorted.map(entry => {
      let selectedStreamGross = 0;
      let selectedStreamNet = 0;
      if (incomeChartSelectedStreamId) {
        const found = entry.streams.find(s => s.id === incomeChartSelectedStreamId);
        if (found) {
          selectedStreamGross = parseFloat(found.grossAmount.toString()) || 0;
          selectedStreamNet = parseFloat(found.netAmount.toString()) || 0;
        }
      }

      const dateObj = new Date(entry.sortKey ? entry.sortKey + '-01' : entry.date);
      const monthShort = months[dateObj.getMonth()].substring(0, 3);
      const year = dateObj.getFullYear();

      return {
        label: incomeChartTimeView === 'month' ? `${monthShort} '${year.toString().slice(2)}` : year.toString(),
        fullDate: entry.date,
        totalGross: entry.totalGross,
        totalNet: entry.totalNet,
        selectedStreamGross,
        selectedStreamNet
      };
    });
  }, [incomeHistory, incomeChartTimeView, incomeChartSelectedStreamId]);

  const totalIncomeYTD = useMemo(() => {
    // Current month income from the live inputs (using Net for YTD Spendable calculation)
    const currentMonthIncome = incomeStreams.reduce((acc, s) => acc + (parseFloat(s.netAmount.toString()) || 0), 0);

    // Historical income from saved months in the current year
    const historySum = incomeHistory
      .filter(h => {
        if (!h.sortKey) return false;
        const [yStr, mStr] = h.sortKey.split('-');
        const y = parseInt(yStr);
        const m = parseInt(mStr); // 1-based index from sortKey

        // Check if it is the same year and strictly a previous month
        return y === currentYear && m < (currentMonth + 1);
      })
      .reduce((acc, h) => acc + h.totalNet, 0);

    return historySum + currentMonthIncome;
  }, [incomeStreams, incomeHistory, currentYear, currentMonth]);


  // --- Handlers ---
  const addBlankRow = () => {
    if (searchQuery) {
      if (!confirm("Adding a row will clear your current search. Continue?")) return;
      setSearchQuery("");
    }

    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const newTx: Transaction = {
      id: Math.random(),
      date: `${currentYear}-${formattedMonth}-01`,
      description: "",
      amount: "",
      category: categories[0],
      method: paymentMethods[0],
      createdAt: Date.now()
    };
    setTransactions([...transactions, newTx]);
  };

  const updateTransaction = (id: number | string, field: keyof Transaction, value: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleLedgerImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        // Clean text - handle BOM and standardise newlines
        const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = cleanText.split('\n');

        if (lines.length < 2) {
          alert("The file appears to be empty or missing headers.");
          return;
        }

        const headerRow = lines[0].toLowerCase();
        // Robust CSV splitter to handle quoted commas
        const parseCSVLine = (str: string) => {
          const arr = [];
          let quote = false;
          let col = '';
          for (let c of str) {
            if (c === '"') { quote = !quote; continue; }
            if (c === ',' && !quote) { arr.push(col); col = ''; continue; }
            col += c;
          }
          arr.push(col);
          return arr.map(c => c.trim());
        };

        const headers = parseCSVLine(headerRow);

        const getIdx = (patterns: string[]) => headers.findIndex(h => patterns.some(p => h.includes(p)));

        // Flexible matching
        const dateIdx = getIdx(['date', 'time', 'day', 'dt']);
        const descIdx = getIdx(['description', 'desc', 'memo', 'merchant', 'name', 'payee', 'transaction', 'trans', 'detail', 'narrative', 'store', 'expense']);
        const amountIdx = getIdx(['amount', 'amt', 'value', 'price', 'cost']);
        const catIdx = getIdx(['category', 'cat', 'type']);
        const methodIdx = getIdx(['method', 'account', 'payment', 'source', 'bank']);

        if (amountIdx === -1) {
          alert(`Could not find an 'Amount' column.\nFound headers: ${headers.join(', ')}`);
          return;
        }

        const newTransactions: Transaction[] = [];
        const detectedMethods = new Set<string>();
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = parseCSVLine(line);

          // Amount parsing
          const rawAmount = cols[amountIdx];
          if (!rawAmount) { errorCount++; continue; }

          const cleanAmount = rawAmount.replace(/[$,\s]/g, '');
          const amountVal = parseFloat(cleanAmount);

          if (isNaN(amountVal)) { errorCount++; continue; }

          // Date parsing
          let finalDateStr = "";
          let rawDate = dateIdx !== -1 ? cols[dateIdx] : "";

          if (rawDate) {
            // Attempt standard parse first
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              // Heuristic: does rawDate contain 4 digits?
              if (/\d{4}/.test(rawDate)) {
                finalDateStr = d.toISOString().split('T')[0];
              } else {
                // Force year
                finalDateStr = `${importLedgerYear}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
              }
            }
          }

          // Fallback: check month names in entire line or date col?
          if (!finalDateStr) {
            const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            const shortMonthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            const lowerLine = line.toLowerCase();

            let mIdx = monthNames.findIndex(m => lowerLine.includes(m));
            if (mIdx === -1) {
              mIdx = shortMonthNames.findIndex(m => lowerLine.includes(m));
            }

            if (mIdx !== -1) {
              finalDateStr = `${importLedgerYear}-${(mIdx + 1).toString().padStart(2, '0')}-01`;
            }
          }

          if (!finalDateStr) { errorCount++; continue; }

          // Payment Method Logic
          let methodVal = paymentMethods[0];
          if (methodIdx !== -1 && cols[methodIdx]) {
            const rawMethod = cols[methodIdx].trim();
            if (rawMethod) {
              methodVal = rawMethod;
              detectedMethods.add(methodVal);
            }
          }

          newTransactions.push({
            id: Math.random().toString(36).substr(2, 9),
            date: finalDateStr,
            description: (descIdx !== -1 && cols[descIdx]) ? cols[descIdx] : "Imported Transaction",
            amount: Math.abs(amountVal),
            category: (catIdx !== -1 && cols[catIdx]) ? cols[catIdx] : "Miscellaneous",
            method: methodVal,
            createdAt: Date.now()
          });
        }

        if (newTransactions.length > 0) {
          // Update payment methods if new ones are found
          if (detectedMethods.size > 0) {
            setPaymentMethods(prev => {
              const uniqueNew = Array.from(detectedMethods).filter(m => !prev.includes(m));
              return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
            });
          }

          setTransactions(prev => [...prev, ...newTransactions]);
          setToast({ message: `Success! ${newTransactions.length} items imported.`, show: true });
          setIsImportLedgerModalOpen(false);
        } else {
          alert(`No valid entries found.\n${errorCount} rows skipped due to invalid Date or Amount.`);
        }

      } catch (e) {
        console.error(e);
        alert("Error parsing file: " + (e instanceof Error ? e.message : String(e)));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    let filtered = [...transactions];

    // Sort all by date first to easily find ranges if needed
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    let rangeLabel = "";

    switch (exportRange) {
      case 'currentViewMonth':
        filtered = filtered.filter(t => {
          const d = new Date(t.date + 'T00:00:00');
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        rangeLabel = `${months[currentMonth]}_${currentYear}`;
        break;
      case 'currentViewYear':
        filtered = filtered.filter(t => {
          const d = new Date(t.date + 'T00:00:00');
          return d.getFullYear() === currentYear;
        });
        rangeLabel = `${currentYear}_FullYear`;
        break;
      case 'last3Months':
        {
          const d = new Date();
          d.setMonth(d.getMonth() - 3);
          d.setDate(1); // Reset to 1st of month to include full history
          d.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date + 'T00:00:00') >= d);
          rangeLabel = "Last3Months";
        }
        break;
      case 'last6Months':
        {
          const d = new Date();
          d.setMonth(d.getMonth() - 6);
          d.setDate(1); // Reset to 1st of month
          d.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date + 'T00:00:00') >= d);
          rangeLabel = "Last6Months";
        }
        break;
      case 'last12Months':
        {
          const d = new Date();
          d.setMonth(d.getMonth() - 12);
          d.setDate(1); // Reset to 1st of month
          d.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date + 'T00:00:00') >= d);
          rangeLabel = "Last12Months";
        }
        break;
      case 'allTime':
        rangeLabel = "AllTime";
        break;
    }

    if (filtered.length === 0) {
      alert("No transactions found for the selected range.");
      return;
    }

    const headers = ["Date", "Description", "Amount", "Category", "Method"];
    const csvRows = filtered.map(t => {
      const safeDesc = (t.description || "").replace(/"/g, '""');

      // Transform date from YYYY-MM-DD to MM/DD/YYYY
      let formattedDate = t.date;
      if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
        const [y, m, d] = t.date.split('-');
        formattedDate = `${m}/${d}/${y}`;
      }

      return `${formattedDate},"${safeDesc}",${t.amount},${t.category},${t.method}`;
    });

    const totalSpend = filtered.reduce((acc, t) => acc + (parseFloat(t.amount.toString()) || 0), 0);
    const uniqueMonths = new Set(filtered.map(t => t.date.substring(0, 7))).size || 1;
    const avgSpend = totalSpend / uniqueMonths;

    // Calculate category breakdown
    const categoryBreakdown = filtered.reduce((acc, t) => {
      const cat = t.category || "Uncategorized";
      const amt = parseFloat(t.amount.toString()) || 0;
      acc[cat] = (acc[cat] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdownRows = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([cat, total]) => `${cat},${(total as number).toFixed(2)}`);

    const csvContent = [
      headers.join(","),
      ...csvRows,
      "",
      `TOTAL SPEND,${totalSpend.toFixed(2)}`,
      `AVERAGE MONTHLY SPEND,${avgSpend.toFixed(2)}`,
      `MONTHS INCLUDED,${uniqueMonths}`,
      "",
      "CATEGORY BREAKDOWN",
      "Category,Total Amount",
      ...categoryBreakdownRows
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ledger_export_${rangeLabel}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  // --- Business Handlers ---
  const addBlankBusinessRow = () => {
    if (businessSearchQuery) {
      if (!confirm("Adding a row will clear your current search. Continue?")) return;
      setBusinessSearchQuery("");
    }

    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const newTx: Transaction = {
      id: Math.random(),
      date: `${currentYear}-${formattedMonth}-01`,
      description: "",
      amount: "",
      category: businessCategories[0],
      method: businessPaymentMethods[0],
      createdAt: Date.now()
    };
    setBusinessTransactions([...businessTransactions, newTx]);
  };

  const updateBusinessTransaction = (id: number | string, field: keyof Transaction, value: string) => {
    setBusinessTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAddSettingsItem = () => {
    if (!newSettingsItemName.trim()) return;
    const val = newSettingsItemName.trim();

    if (settingsSubSection === 'categories') {
      if (settingsActiveSection === 'Business Center') {
        if (!businessCategories.includes(val)) setBusinessCategories(prev => [...prev, val]);
      } else {
        if (!categories.includes(val)) setCategories(prev => [...prev, val]);
      }
    } else if (settingsSubSection === 'methods') {
      if (settingsActiveSection === 'Business Center') {
        if (!businessPaymentMethods.includes(val)) setBusinessPaymentMethods(prev => [...prev, val]);
      } else {
        if (!paymentMethods.includes(val)) setPaymentMethods(prev => [...prev, val]);
      }
    } else if (settingsSubSection === 'purposes') {
      if (!drivingPurposes.includes(val)) setDrivingPurposes(prev => [...prev, val]);
    }

    setNewSettingsItemName("");
    setIsAddingSettingsItem(false);
  };

  const handleReceiptUpload = async (file: File, transactionId: number | string) => {
    if (!window.electronAPI) {
      alert("Receipt upload is only available in the Electron app.");
      return;
    }

    const transaction = businessTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    try {
      // Format Date
      let datePart = transaction.date;
      if (!datePart) {
        const now = new Date();
        datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      }
      const [year, month, day] = datePart.split('-');
      const formattedDate = `${month}.${day}.${year.slice(2)}`;

      // Format Description & Amount
      const description = (transaction.description || "Untitled").replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const amount = transaction.amount || "0";
      const ext = file.name.split('.').pop();
      const filename = `${formattedDate} - ${description} - ${amount}.${ext}`;

      // Folder and Save
      const folderName = `${currentYear} - Business Expense`;
      await window.electronAPI.ensureDir(folderName);

      const buffer = await file.arrayBuffer();
      const filePath = `${folderName}/${filename}`;
      await window.electronAPI.saveReceipt(filePath, buffer);

      // Update Transaction
      updateBusinessTransaction(transactionId, 'receiptPath', filePath);

    } catch (error) {
      console.error("Failed to upload receipt:", error);
      alert("Failed to upload receipt.");
    }
  };

  const handleBusinessLedgerImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = cleanText.split('\n');

        if (lines.length < 2) {
          alert("The file appears to be empty or missing headers.");
          return;
        }

        const headerRow = lines[0].toLowerCase();
        const parseCSVLine = (str: string) => {
          const arr = [];
          let quote = false;
          let col = '';
          for (let c of str) {
            if (c === '"') { quote = !quote; continue; }
            if (c === ',' && !quote) { arr.push(col); col = ''; continue; }
            col += c;
          }
          arr.push(col);
          return arr.map(c => c.trim());
        };

        const headers = parseCSVLine(headerRow);
        const getIdx = (patterns: string[]) => headers.findIndex(h => patterns.some(p => h.includes(p)));

        const dateIdx = getIdx(['date', 'time', 'day', 'dt']);
        const descIdx = getIdx(['description', 'desc', 'memo', 'merchant', 'name', 'payee', 'transaction', 'trans', 'detail', 'narrative', 'store', 'expense']);
        const amountIdx = getIdx(['amount', 'amt', 'value', 'price', 'cost']);
        const catIdx = getIdx(['category', 'cat', 'type']);
        const methodIdx = getIdx(['method', 'account', 'payment', 'source', 'bank']);

        if (amountIdx === -1) {
          alert(`Could not find an 'Amount' column.\nFound headers: ${headers.join(', ')}`);
          return;
        }

        const newTransactions: Transaction[] = [];
        const detectedMethods = new Set<string>();
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = parseCSVLine(line);

          const rawAmount = cols[amountIdx];
          if (!rawAmount) { errorCount++; continue; }

          const cleanAmount = rawAmount.replace(/[$,\s]/g, '');
          const amountVal = parseFloat(cleanAmount);

          if (isNaN(amountVal)) { errorCount++; continue; }

          let finalDateStr = "";
          let rawDate = dateIdx !== -1 ? cols[dateIdx] : "";

          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              if (/\d{4}/.test(rawDate)) {
                finalDateStr = d.toISOString().split('T')[0];
              } else {
                finalDateStr = `${businessImportLedgerYear}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
              }
            }
          }

          if (!finalDateStr) {
            const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            const shortMonthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            const lowerLine = line.toLowerCase();

            let mIdx = monthNames.findIndex(m => lowerLine.includes(m));
            if (mIdx === -1) {
              mIdx = shortMonthNames.findIndex(m => lowerLine.includes(m));
            }

            if (mIdx !== -1) {
              finalDateStr = `${businessImportLedgerYear}-${(mIdx + 1).toString().padStart(2, '0')}-01`;
            }
          }

          if (!finalDateStr) { errorCount++; continue; }

          let methodVal = businessPaymentMethods[0];
          if (methodIdx !== -1 && cols[methodIdx]) {
            const rawMethod = cols[methodIdx].trim();
            if (rawMethod) {
              methodVal = rawMethod;
              detectedMethods.add(methodVal);
            }
          }

          newTransactions.push({
            id: Math.random().toString(36).substr(2, 9),
            date: finalDateStr,
            description: (descIdx !== -1 && cols[descIdx]) ? cols[descIdx] : "Imported Transaction",
            amount: Math.abs(amountVal),
            category: (catIdx !== -1 && cols[catIdx]) ? cols[catIdx] : "Miscellaneous",
            method: methodVal,
            createdAt: Date.now()
          });
        }

        if (newTransactions.length > 0) {
          if (detectedMethods.size > 0) {
            setBusinessPaymentMethods(prev => {
              const uniqueNew = Array.from(detectedMethods).filter(m => !prev.includes(m));
              return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
            });
          }

          setBusinessTransactions(prev => [...prev, ...newTransactions]);
          setToast({ message: `Success! ${newTransactions.length} business items imported.`, show: true });
          setIsBusinessImportLedgerModalOpen(false);
        } else {
          alert(`No valid entries found.\n${errorCount} rows skipped.`);
        }

      } catch (e) {
        console.error(e);
        alert("Error parsing file: " + (e instanceof Error ? e.message : String(e)));
      } finally {
        if (businessFileInputRef.current) businessFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleBusinessExport = () => {
    let filtered = [...businessTransactions];
    const now = new Date();

    filtered.sort((a, b) => a.date.localeCompare(b.date));

    let rangeLabel = "";

    switch (businessExportRange) {
      case 'currentViewMonth':
        filtered = filtered.filter(t => {
          const d = new Date(t.date + 'T00:00:00');
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        rangeLabel = `${months[currentMonth]}_${currentYear}`;
        break;
      case 'currentViewYear':
        filtered = filtered.filter(t => {
          const d = new Date(t.date + 'T00:00:00');
          return d.getFullYear() === currentYear;
        });
        rangeLabel = `${currentYear}_FullYear`;
        break;
      case 'last3Months':
        {
          const d = new Date();
          d.setMonth(d.getMonth() - 3);
          d.setDate(1); // Start from 1st of month
          d.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date + 'T00:00:00') >= d);
          rangeLabel = "Last3Months";
        }
        break;
      case 'last6Months':
        {
          const d = new Date();
          d.setMonth(d.getMonth() - 6);
          d.setDate(1); // Start from 1st of month
          d.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date + 'T00:00:00') >= d);
          rangeLabel = "Last6Months";
        }
        break;
      case 'last12Months':
        {
          const d = new Date();
          d.setMonth(d.getMonth() - 12);
          d.setDate(1); // Start from 1st of month
          d.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date + 'T00:00:00') >= d);
          rangeLabel = "Last12Months";
        }
        break;
      case 'allTime':
        rangeLabel = "AllTime";
        break;
    }

    if (filtered.length === 0) {
      alert("No business transactions found for the selected range.");
      return;
    }

    const headers = ["Date", "Description", "Amount", "Category", "Method"];
    const csvRows = filtered.map(t => {
      const safeDesc = (t.description || "").replace(/"/g, '""');

      // Transform date from YYYY-MM-DD to MM/DD/YYYY
      let formattedDate = t.date;
      if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
        const [y, m, d] = t.date.split('-');
        formattedDate = `${m}/${d}/${y}`;
      }

      return `${formattedDate},"${safeDesc}",${t.amount},${t.category},${t.method}`;
    });

    const totalSpend = filtered.reduce((acc, t) => acc + (parseFloat(t.amount.toString()) || 0), 0);
    const uniqueMonths = new Set(filtered.map(t => t.date.substring(0, 7))).size || 1;
    const avgSpend = totalSpend / uniqueMonths;

    // Calculate category breakdown
    const categoryBreakdown = filtered.reduce((acc, t) => {
      const cat = t.category || "Uncategorized";
      const amt = parseFloat(t.amount.toString()) || 0;
      acc[cat] = (acc[cat] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdownRows = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([cat, total]) => `${cat},${(total as number).toFixed(2)}`);

    const csvContent = [
      headers.join(","),
      ...csvRows,
      "",
      `TOTAL BUSINESS SPEND,${totalSpend.toFixed(2)}`,
      `AVERAGE MONTHLY BUSINESS SPEND,${avgSpend.toFixed(2)}`,
      `MONTHS INCLUDED,${uniqueMonths}`,
      "",
      "CATEGORY BREAKDOWN",
      "Category,Total Amount",
      ...categoryBreakdownRows
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `business_ledger_export_${rangeLabel}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsBusinessExportModalOpen(false);
  };

  // --- Business Recurring Handlers ---
  const handleOpenBusinessRecurringModal = () => {
    setSelectedBusinessRecurringIds(new Set(businessRecurringExpenses.map(r => r.id)));
    setIsBusinessRecurringModalOpen(true);
  };

  const toggleBusinessRecurringSelection = (id: string) => {
    const newSet = new Set(selectedBusinessRecurringIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBusinessRecurringIds(newSet);
  };

  const handleAddBusinessRecurringToLedger = () => {
    const newTransactions: Transaction[] = [];
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-01`;

    businessRecurringExpenses.forEach(r => {
      if (selectedBusinessRecurringIds.has(r.id)) {
        newTransactions.push({
          id: Math.random(),
          date: dateStr,
          description: r.description,
          amount: r.amount,
          category: r.category,
          method: r.method,
          createdAt: Date.now()
        });
      }
    });

    if (newTransactions.length > 0) {
      setBusinessTransactions(prev => [...prev, ...newTransactions]);
    }
    setIsBusinessRecurringModalOpen(false);
  };

  const addNewBusinessRecurringTemplate = () => {
    setBusinessRecurringExpenses(prev => [...prev, {
      id: Date.now().toString(),
      description: "New Item",
      amount: "",
      category: businessCategories[0],
      method: businessPaymentMethods[0]
    }]);
  };

  const updateBusinessRecurringTemplate = (id: string, field: keyof RecurringExpense, value: string) => {
    setBusinessRecurringExpenses(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteBusinessRecurringTemplate = (id: string) => {
    setBusinessRecurringExpenses(prev => prev.filter(r => r.id !== id));
    const newSet = new Set(selectedBusinessRecurringIds);
    newSet.delete(id);
    setSelectedBusinessRecurringIds(newSet);
  };

  const handleExportDrivingLog = () => {
    if (displayedDrivingLog.length === 0) {
      alert(`No driving log entries found for ${currentYear}.`);
      return;
    }

    const headers = ["Date", "Miles", "Destination", "Purpose"];
    const csvRows = displayedDrivingLog.map(l => {
      const safeDest = (l.destination || "").replace(/"/g, '""');
      const safePurp = (l.purpose || "").replace(/"/g, '""');
      return `${l.date},${l.miles},"${safeDest}","${safePurp}"`;
    });

    const currentRate = yearlyMileageRates[currentYear.toString()] || 0.67;
    const totalDeduction = totalYearlyMileage * currentRate;

    const csvContent = [
      headers.join(","),
      ...csvRows,
      "",
      `TOTAL MILES FOR ${currentYear},${totalYearlyMileage.toFixed(2)}`,
      `DEDUCTION RATE,$${currentRate.toFixed(3)}/mile`,
      `TOTAL TAX DEDUCTION,$${totalDeduction.toFixed(2)}`
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DrivingLog_${currentYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Recurring Expenses Handlers ---
  const handleOpenRecurringModal = () => {
    setSelectedRecurringIds(new Set(recurringExpenses.map(r => r.id)));
    setIsRecurringModalOpen(true);
  };

  const moveDashboardWidget = (id: string, direction: 'up' | 'down') => {
    const index = dashboardOrder.indexOf(id);
    if (index === -1) return;
    const newOrder = [...dashboardOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setDashboardOrder(newOrder);
  };

  const toggleDashboardWidgetVisibility = (id: string) => {
    setHiddenDashboardWidgets(prev =>
      prev.includes(id)
        ? prev.filter(w => w !== id)
        : [...prev, id]
    );
  };

  const toggleRecurringSelection = (id: string) => {
    const newSet = new Set(selectedRecurringIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRecurringIds(newSet);
  };

  const handleAddRecurringToLedger = () => {
    const newTransactions: Transaction[] = [];
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-01`;

    recurringExpenses.forEach(r => {
      if (selectedRecurringIds.has(r.id)) {
        newTransactions.push({
          id: Math.random(),
          date: dateStr,
          description: r.description,
          amount: r.amount,
          category: r.category,
          method: r.method,
          createdAt: Date.now()
        });
      }
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...prev, ...newTransactions]);
    }
    setIsRecurringModalOpen(false);
  };

  const addNewRecurringTemplate = () => {
    setRecurringExpenses(prev => [...prev, {
      id: Date.now().toString(),
      description: "New Item",
      amount: "",
      category: categories[0],
      method: paymentMethods[0]
    }]);
  };

  const updateRecurringTemplate = (id: string, field: keyof RecurringExpense, value: string) => {
    setRecurringExpenses(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteRecurringTemplate = (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    const newSet = new Set(selectedRecurringIds);
    newSet.delete(id);
    setSelectedRecurringIds(newSet);
  };

  // --- Settings Handlers ---
  const handleUpdateCategory = () => {
    if (!editingItemOriginalName || !editingItemNewName.trim()) return;
    setCategories(prev => prev.map(c => c === editingItemOriginalName ? editingItemNewName : c));
    setTransactions(prev => prev.map(t => t.category === editingItemOriginalName ? { ...t, category: editingItemNewName } : t));
    setEditingItemOriginalName(null);
    setEditingItemNewName("");
  };

  const handleUpdatePaymentMethod = () => {
    if (!editingItemOriginalName || !editingItemNewName.trim()) return;
    setPaymentMethods(prev => prev.map(m => m === editingItemOriginalName ? editingItemNewName : m));
    setTransactions(prev => prev.map(t => t.method === editingItemOriginalName ? { ...t, method: editingItemNewName } : t));
    setEditingItemOriginalName(null);
    setEditingItemNewName("");
  };

  const handleUpdateBusinessCategory = () => {
    if (!editingItemOriginalName || !editingItemNewName.trim()) return;
    setBusinessCategories(prev => prev.map(c => c === editingItemOriginalName ? editingItemNewName : c));
    setBusinessTransactions(prev => prev.map(t => t.category === editingItemOriginalName ? { ...t, category: editingItemNewName } : t));
    setEditingItemOriginalName(null);
    setEditingItemNewName("");
  };

  const handleUpdateBusinessPaymentMethod = () => {
    if (!editingItemOriginalName || !editingItemNewName.trim()) return;
    setBusinessPaymentMethods(prev => prev.map(m => m === editingItemOriginalName ? editingItemNewName : m));
    setBusinessTransactions(prev => prev.map(t => t.method === editingItemOriginalName ? { ...t, method: editingItemNewName } : t));
    setEditingItemOriginalName(null);
    setEditingItemNewName("");
  };

  const handleUpdateDrivingPurpose = () => {
    if (!editingItemOriginalName || !editingItemNewName.trim()) return;
    setDrivingPurposes(prev => prev.map(p => p === editingItemOriginalName ? editingItemNewName : p));
    setDrivingLog(prev => prev.map(l => l.purpose === editingItemOriginalName ? { ...l, purpose: editingItemNewName } : l));
    setEditingItemOriginalName(null);
    setEditingItemNewName("");
  };

  // --- ASSET WATCH LOGIC ---
  const handleSaveNewCategory = () => {
    if (!newCategoryName.trim()) {
      setIsAddingCategory(false);
      return;
    }
    setAssetStructure(prev => [...prev, {
      id: Date.now().toString(),
      name: newCategoryName,
      isLiability: newCategoryType === 'liability',
      isTracking: newCategoryType === 'tracking',
      items: []
    }]);
    setNewCategoryName("");
    setNewCategoryType("asset");
    setIsAddingCategory(false);
  };

  const removeAssetCategory = (id: string) => {
    setAssetStructure(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveNewAsset = (catId: string) => {
    if (!newAssetName.trim()) {
      setAddingAssetTo(null);
      return;
    }
    setAssetStructure(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: [...cat.items, { id: Date.now().toString(), name: newAssetName, value: '' }] } : cat
    ));
    setNewAssetName("");
    setAddingAssetTo(null);
  };

  const updateAssetValue = (catId: string, itemId: string, value: string) => {
    setAssetStructure(prev => prev.map(cat =>
      cat.id === catId ? {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, value } : item)
      } : cat
    ));
  };

  const removeAssetItem = (catId: string, itemId: string) => {
    setAssetStructure(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
    ));
  };

  const saveMonthToHistory = () => {
    const displayDate = `${months[currentMonth] || 'Unknown'} ${currentYear}`;
    const sortKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    setPendingComment("");
    setCommentModal({ isOpen: true, type: 'asset', displayDate, sortKey });
  };

  const handleConfirmSave = () => {
    const { type, displayDate, sortKey } = commentModal;
    try {
      if (type === 'asset') {
        const preTaxIncome = (incomeStreams || []).reduce((acc, s) => {
          const val = s?.grossAmount ? parseFloat(String(s.grossAmount)) : 0;
          return acc + (isNaN(val) ? 0 : val);
        }, 0) * 12;

        const snapshot = assetStructure ? JSON.parse(JSON.stringify(assetStructure)) : [];

        const newEntry: MonthlyHistoryEntry = {
          date: displayDate,
          sortKey: sortKey,
          netWorth: netWorthData || 0,
          netDiff: monthlyNetDiff || 0,
          yield: monthlyYield || 0,
          preTaxIncome: preTaxIncome,
          comment: pendingComment || "",
          snapshot: snapshot
        };

        setMonthlyHistory(prev => {
          const historyArray = Array.isArray(prev) ? prev : [];
          const filtered = historyArray.filter(h => h && (h.sortKey || h.date) !== sortKey && h.date !== displayDate);
          return [...filtered, newEntry].sort((a, b) => {
            const keyA = a.sortKey || a.date || "";
            const keyB = b.sortKey || b.date || "";
            return String(keyB).localeCompare(String(keyA));
          });
        });
        setToast({ message: `Snapshot saved for ${displayDate}`, show: true });
      } else {
        const totalGross = (incomeStreams || []).reduce((acc, s) => {
          const val = s?.grossAmount ? parseFloat(String(s.grossAmount)) : 0;
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        const totalNet = (incomeStreams || []).reduce((acc, s) => {
          const val = s?.netAmount ? parseFloat(String(s.netAmount)) : 0;
          return acc + (isNaN(val) ? 0 : val);
        }, 0);

        const newEntry: IncomeHistoryEntry = {
          date: displayDate,
          sortKey: sortKey,
          totalGross: totalGross,
          totalNet: totalNet,
          streams: incomeStreams ? JSON.parse(JSON.stringify(incomeStreams)) : [],
          comment: pendingComment || ""
        };

        setIncomeHistory(prev => {
          const historyArray = Array.isArray(prev) ? prev : [];
          const filtered = historyArray.filter(h => h && (h.sortKey || h.date) !== sortKey && h.date !== displayDate);
          return [...filtered, newEntry].sort((a, b) => {
            const keyA = a.sortKey || a.date || "";
            const keyB = b.sortKey || b.date || "";
            return String(keyB).localeCompare(String(keyA));
          });
        });
        setToast({ message: `Income history saved for ${displayDate}`, show: true });
      }
      setCommentModal({ ...commentModal, isOpen: false });
    } catch (err) {
      console.error(`Failed to save ${type} history:`, err);
      alert(`Failed to save to history: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const updateHistoryComment = (identifier: string, newComment: string) => {
    setMonthlyHistory(prev => prev.map(h =>
      (h.sortKey || h.date) === identifier ? { ...h, comment: newComment } : h
    ));
  };

  const handleAssetHistoryImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          alert("File seems empty.");
          return;
        }

        const headerLine = lines[0].toLowerCase();
        // Simple CSV splitter
        const parseCSVLine = (str: string) => {
          const arr = [];
          let quote = false;
          let col = '';
          for (let c of str) {
            if (c === '"') { quote = !quote; continue; }
            if (c === ',' && !quote) { arr.push(col); col = ''; continue; }
            col += c;
          }
          arr.push(col);
          return arr.map(c => c.trim().replace(/^"|"$/g, ''));
        };

        const headers = parseCSVLine(headerLine);
        const findIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

        const dateIdx = findIdx(['date', 'time', 'dt']);
        const assetIdx = findIdx(['asset', 'name', 'item', 'description', 'account']);
        const amountIdx = findIdx(['amount', 'value', 'balance', 'worth']);

        if (dateIdx === -1 || assetIdx === -1 || amountIdx === -1) {
          alert("Could not identify Date, Asset, or Amount columns in CSV.");
          return;
        }

        const groupedData = new Map<string, { dateStr: string, items: { name: string, value: number }[] }>();

        // 1. Group by Month
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = parseCSVLine(line);

          const rawDate = cols[dateIdx];
          const rawAsset = cols[assetIdx];
          const rawAmount = cols[amountIdx];

          if (!rawDate || !rawAsset || !rawAmount) continue;

          const val = parseFloat(rawAmount.replace(/[$,]/g, ''));
          if (isNaN(val)) continue;

          // Parse Date
          let d = new Date(rawDate);
          if (isNaN(d.getTime())) continue;

          // SortKey: YYYY-MM
          const sortKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;

          if (!groupedData.has(sortKey)) {
            groupedData.set(sortKey, {
              dateStr: `${months[d.getMonth()]} ${d.getFullYear()}`,
              items: []
            });
          }
          groupedData.get(sortKey)!.items.push({ name: rawAsset, value: val });
        }

        // --- NEW LOGIC: Update Asset Structure with New Items ---
        let updatedStructure = JSON.parse(JSON.stringify(assetStructure)) as AssetCategory[];
        let structureModified = false;

        // Ensure "Liquid Assets & Investments" category exists or find it
        let defaultCat = updatedStructure.find(c => c.name === 'Liquid Assets & Investments' || c.id === '1');
        if (!defaultCat) {
          // Fallback or create if totally missing
          defaultCat = updatedStructure[0]; // Use first category if Liquid Assets not found by name
          if (!defaultCat) {
            defaultCat = { id: '1', name: 'Liquid Assets & Investments', isLiability: false, isTracking: false, items: [] };
            updatedStructure.unshift(defaultCat);
            structureModified = true;
          }
        }

        const findInStructure = (name: string) => {
          for (const cat of updatedStructure) {
            if (cat.items.some(i => i.name.toLowerCase() === name.toLowerCase())) return cat;
          }
          return null;
        };

        // Gather all unique item names from import
        const allImportedNames = new Set<string>();
        groupedData.forEach(data => data.items.forEach(i => allImportedNames.add(i.name)));

        allImportedNames.forEach(name => {
          if (!findInStructure(name)) {
            // Add new item to the default category (Liquid Assets)
            defaultCat!.items.push({
              id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              name: name,
              value: '' // Initialize with empty value for current/future editing
            });
            structureModified = true;
          }
        });

        if (structureModified) {
          setAssetStructure(updatedStructure);
        }
        // ---------------------------------------------------------

        // 2. Build History Entries (using updatedStructure)
        const newEntries: MonthlyHistoryEntry[] = [];

        const findCategoryInfo = (assetName: string) => {
          for (const cat of updatedStructure) {
            if (cat.items.some(i => i.name.toLowerCase() === assetName.toLowerCase())) {
              return { id: cat.id, name: cat.name, isLiability: cat.isLiability, isTracking: cat.isTracking };
            }
          }
          return null;
        };

        groupedData.forEach((data, sortKey) => {
          const catMap = new Map<string, AssetCategory>();

          data.items.forEach((item, idx) => {
            const knownCat = findCategoryInfo(item.name);
            const targetCat = knownCat || defaultCat!; // Should always find knownCat now, but fallback to defaultCat

            if (!catMap.has(targetCat.id)) {
              catMap.set(targetCat.id, {
                id: targetCat.id,
                name: targetCat.name,
                isLiability: targetCat.isLiability,
                isTracking: targetCat.isTracking,
                items: []
              });
            }

            // Attempt to preserve the ID from the main structure to allow linking/charting
            const structCat = updatedStructure.find(c => c.id === targetCat.id);
            const structItem = structCat?.items.find(i => i.name.toLowerCase() === item.name.toLowerCase());
            const itemId = structItem ? structItem.id : `imp_hist_${idx}`;

            catMap.get(targetCat.id)!.items.push({ id: itemId, name: item.name, value: item.value });
          });

          const snapshotCategories: AssetCategory[] = Array.from(catMap.values());
          const totalNetWorth = data.items.reduce((acc, i) => acc + i.value, 0);

          newEntries.push({
            date: data.dateStr,
            sortKey: sortKey,
            netWorth: totalNetWorth,
            netDiff: 0,
            yield: 0,
            preTaxIncome: 0,
            comment: "Imported via CSV",
            snapshot: snapshotCategories
          });
        });

        // 3. Merge and Recalculate Diffs (Existing Logic)
        setMonthlyHistory(prev => {
          const combined = [...prev];
          newEntries.forEach(ne => {
            const idx = combined.findIndex(e => (e.sortKey || e.date) === ne.sortKey);
            if (idx !== -1) {
              if (confirm(`Overwrite entry for ${ne.date}?`)) {
                combined[idx] = ne;
              }
            } else {
              combined.push(ne);
            }
          });

          combined.sort((a, b) => {
            const kA = a.sortKey || a.date;
            const kB = b.sortKey || b.date;
            return kA.localeCompare(kB);
          });

          const recalculated = combined.map((entry, i) => {
            if (i === 0) return { ...entry, netDiff: 0, yield: 0 };
            const prevEntry = combined[i - 1];
            const diff = entry.netWorth - prevEntry.netWorth;
            const yld = prevEntry.netWorth !== 0 ? (diff / Math.abs(prevEntry.netWorth)) * 100 : 0;
            return { ...entry, netDiff: diff, yield: yld };
          });

          return recalculated.sort((a, b) => (b.sortKey || b.date).localeCompare(a.sortKey || a.date));
        });

        setToast({ message: `Imported ${newEntries.length} history entries. Added new assets to watch list.`, show: true });

      } catch (err) {
        console.error(err);
        alert("Error parsing CSV");
      } finally {
        if (assetHistoryFileInputRef.current) assetHistoryFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const toggleHistoryExpansion = (index: number) => {
    setExpandedHistoryIndex(expandedHistoryIndex === index ? null : index);
  };

  // --- INCOME LOGIC ---
  const handleAddIncomeStream = () => {
    if (!newIncomeName.trim()) {
      setIsAddingIncome(false);
      return;
    }
    setIncomeStreams(prev => [...prev, { id: Date.now().toString(), name: newIncomeName, grossAmount: 0, netAmount: 0 }]);
    setNewIncomeName("");
    setIsAddingIncome(false);
  };

  const removeIncomeStream = (id: string) => {
    setIncomeStreams(prev => prev.filter(s => s.id !== id));
  };

  const saveIncomeToHistory = () => {
    const displayDate = `${months[currentMonth] || 'Unknown'} ${currentYear}`;
    const sortKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    setPendingComment("");
    setCommentModal({ isOpen: true, type: 'income', displayDate, sortKey });
  };

  const updateIncomeHistoryComment = (identifier: string, newComment: string) => {
    setIncomeHistory(prev => prev.map(h =>
      (h.sortKey || h.date) === identifier ? { ...h, comment: newComment } : h
    ));
  };

  const toggleIncomeHistoryExpansion = (index: number) => {
    setExpandedIncomeHistoryIndex(expandedIncomeHistoryIndex === index ? null : index);
  };


  const getPreviousItemValue = (prevSnapshot: AssetCategory[] | undefined, catId: string, itemId: string): number => {
    if (!prevSnapshot) return 0;
    const cat = prevSnapshot.find(c => c.id === catId);
    if (!cat) return 0;
    const item = cat.items.find(i => i.id === itemId);
    if (!item) return 0;
    return parseFloat(item.value.toString()) || 0;
  };

  // --- Components ---
  const NEON_PALETTE = [
    '#00f3ff', // Cyan
    '#00ff9f', // Green
    '#ffe600', // Yellow
    '#ff0055', // Red
    '#d500f9', // Purple
    '#ff9100', // Orange
    '#2979ff', // Blue
    '#ff1744', // Pink
    '#1de9b6', // Teal
    '#651fff'  // Deep Purple
  ];

  const PieChartComp = ({ data, hideEmptyMessage = false }: { data: { name: string; total: number }[], hideEmptyMessage?: boolean }) => {
    let cumulativePercent = 0;
    const total = data.reduce((acc, cur) => acc + cur.total, 0);
    if (total === 0) {
      if (hideEmptyMessage) return null;
      return <div className="h-full flex items-center justify-center text-gray-600 italic">No data</div>;
    }

    return (
      <svg viewBox="-105 -105 210 210" className="w-full h-full -rotate-90" shapeRendering="geometricPrecision">
        {data.map((slice, i) => {
          const slicePercent = slice.total / total;
          const [startX, startY] = [
            100 * Math.cos(2 * Math.PI * cumulativePercent),
            100 * Math.sin(2 * Math.PI * cumulativePercent)
          ];
          cumulativePercent += slicePercent;
          const [endX, endY] = [
            100 * Math.cos(2 * Math.PI * cumulativePercent),
            100 * Math.sin(2 * Math.PI * cumulativePercent)
          ];
          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
          const color = customColors[slice.name] || NEON_PALETTE[i % NEON_PALETTE.length];
          return (
            <path
              key={slice.name}
              d={`M 0 0 L ${startX} ${startY} A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={color}
              stroke={color}
              strokeWidth="0.5"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${slice.name}: $${slice.total.toFixed(2)}`}</title>
            </path>
          );
        })}
        <circle cx="0" cy="0" r="60" fill="#0d0d0d" />
      </svg>
    );
  };

  const PerformanceChart = () => {
    if (chartData.length < 2) return (
      <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 p-12 shadow-xl flex flex-col items-center justify-center text-gray-500 space-y-2">
        <Activity size={48} className="opacity-20" />
        <p className="text-sm">Not enough data to chart performance.</p>
        <p className="text-xs text-gray-600">Save at least two months of history.</p>
      </div>
    );

    const width = 800;
    const height = 300;
    const padding = 40;

    // Neon Color Palette
    const neonColors = {
      netWorth: '#00f3ff',     // Cyan Neon
      liquid: '#00ff9f',       // Green Neon
      liabilities: '#ff0055',  // Red Neon
      tracking: '#ffe600',     // Yellow Neon
      selected: '#d500f9'      // Purple Neon
    };

    // Calculate min/max for scaling
    const allValues = chartData.flatMap(d => {
      const vals = [];
      if (chartToggles.netWorth) vals.push(d.netWorth);
      if (chartToggles.liquid) vals.push(d.liquid);
      if (chartToggles.liabilities) vals.push(d.liabilities);
      if (chartToggles.tracking) vals.push(d.tracking);
      if (chartSelectedAssetId) vals.push(d.selectedAsset);
      return vals;
    });

    const maxVal = Math.max(...allValues, 100);
    const minVal = Math.min(...allValues, 0);
    const range = maxVal - minVal;

    const getCoord = (val: number, index: number) => {
      const x = padding + (index / (chartData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / (range || 1)) * (height - padding * 2);
      return { x, y };
    };

    // Path Generators
    const createLinePath = (key: keyof typeof chartData[0]) => {
      return chartData.map((d, i) => {
        const { x, y } = getCoord(d[key] as number, i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    const createAreaPath = (key: keyof typeof chartData[0]) => {
      const lineStr = createLinePath(key);
      const { x: lastX } = getCoord(0, chartData.length - 1);
      const { x: firstX } = getCoord(0, 0);
      const bottomY = height - padding;
      return `${lineStr} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    };

    // Render helper for a data series
    const renderSeries = (key: keyof typeof chartData[0], color: string) => {
      const isSelected = key === 'selectedAsset';

      return (
        <g key={key}>
          {/* Area Fill */}
          <path
            d={createAreaPath(key)}
            fill={color}
            fillOpacity="0.1"
            stroke="none"
          />
          {/* Line */}
          <path
            d={createLinePath(key)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={isSelected ? "4 4" : "none"}
            className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          />
          {/* Dots */}
          {chartData.map((d, i) => {
            const { x, y } = getCoord(d[key] as number, i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={color}
              />
            );
          })}
        </g>
      );
    };

    return (
      <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6">
        {/* Chart Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
            <button onClick={() => setChartTimeView('month')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${chartTimeView === 'month' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>MONTH</button>
            <button onClick={() => setChartTimeView('year')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${chartTimeView === 'year' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>YEAR</button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { key: 'netWorth', label: 'Net Worth', color: neonColors.netWorth },
              { key: 'liquid', label: 'Liquid', color: neonColors.liquid },
              { key: 'liabilities', label: 'Liabilities', color: neonColors.liabilities },
              { key: 'tracking', label: 'Tracking', color: neonColors.tracking }
            ].map(item => {
              const isActive = chartToggles[item.key as keyof typeof chartToggles];
              return (
                <button
                  key={item.key}
                  onClick={() => setChartToggles(prev => ({ ...prev, [item.key]: !isActive }))}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all duration-300`}
                  style={isActive ? {
                    backgroundColor: `${item.color}15`, // ~8% opacity
                    borderColor: `${item.color}60`,
                    color: item.color,
                    boxShadow: `0 0 10px ${item.color}20`
                  } : {
                    borderColor: '#1f2937',
                    color: '#4b5563',
                    backgroundColor: 'transparent'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? item.color : '#4b5563', boxShadow: isActive ? `0 0 5px ${item.color}` : 'none' }} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="relative group">
            <select
              value={chartSelectedAssetId}
              onChange={(e) => setChartSelectedAssetId(e.target.value)}
              className="appearance-none bg-gray-900 border border-gray-800 text-xs font-bold px-4 py-2 pr-8 rounded-xl outline-none transition-colors min-w-[150px]"
              style={{
                color: chartSelectedAssetId ? neonColors.selected : '#9ca3af',
                borderColor: chartSelectedAssetId ? `${neonColors.selected}60` : '#1f2937'
              }}
            >
              <option value="">Track Individual Asset...</option>
              {assetStructure.flatMap(cat => cat.items.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              )))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} style={{ color: chartSelectedAssetId ? neonColors.selected : '#6b7280' }} />
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-[300px] relative group">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = height - padding - pct * (height - padding * 2);
              return (
                <g key={pct}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />
                  <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-gray-600 text-[10px] font-mono">
                    ${Math.round(minVal + pct * range).toLocaleString()}
                  </text>
                </g>
              )
            })}

            {/* Data Series */}
            {chartToggles.liabilities && renderSeries('liabilities', neonColors.liabilities)}
            {chartToggles.tracking && renderSeries('tracking', neonColors.tracking)}
            {chartToggles.liquid && renderSeries('liquid', neonColors.liquid)}
            {chartToggles.netWorth && renderSeries('netWorth', neonColors.netWorth)}
            {chartSelectedAssetId && renderSeries('selectedAsset', neonColors.selected)}

            {/* X Axis Labels */}
            {chartData.map((d, i) => {
              if (chartData.length > 12 && i % Math.ceil(chartData.length / 12) !== 0) return null;
              const { x } = getCoord(0, i);
              return (
                <text key={i} x={x} y={height - 10} textAnchor="middle" className="fill-gray-500 text-[10px] font-medium uppercase tracking-wider">
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const IncomePerformanceChart = () => {
    if (incomeChartData.length < 2) return (
      <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 p-12 shadow-xl flex flex-col items-center justify-center text-gray-500 space-y-2">
        <Activity size={48} className="opacity-20" />
        <p className="text-sm">Not enough data to chart income history.</p>
        <p className="text-xs text-gray-600">Save at least two months of history.</p>
      </div>
    );

    const width = 800;
    const height = 300;
    const padding = 40;

    const neonColors = {
      total: '#00f3ff',     // Cyan Neon
      selected: '#d500f9'   // Purple Neon
    };

    const allValues = incomeChartData.flatMap(d => {
      const totalVal = incomeChartMetric === 'gross' ? d.totalGross : d.totalNet;
      const vals = [totalVal];
      if (incomeChartSelectedStreamId) {
        const selectedVal = incomeChartMetric === 'gross' ? d.selectedStreamGross : d.selectedStreamNet;
        vals.push(selectedVal);
      }
      return vals;
    });

    const maxVal = Math.max(...allValues, 100);
    const minVal = Math.min(...allValues, 0);
    const range = maxVal - minVal;

    const getCoord = (val: number, index: number) => {
      const x = padding + (index / (incomeChartData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / (range || 1)) * (height - padding * 2);
      return { x, y };
    };

    const createLinePath = (key: 'total' | 'selected') => {
      return incomeChartData.map((d, i) => {
        let val = 0;
        if (key === 'total') {
          val = incomeChartMetric === 'gross' ? d.totalGross : d.totalNet;
        } else {
          val = incomeChartMetric === 'gross' ? d.selectedStreamGross : d.selectedStreamNet;
        }
        const { x, y } = getCoord(val, i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    const createAreaPath = (key: 'total' | 'selected') => {
      const lineStr = createLinePath(key);
      const { x: lastX } = getCoord(0, incomeChartData.length - 1);
      const { x: firstX } = getCoord(0, 0);
      const bottomY = height - padding;
      return `${lineStr} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    };

    const renderSeries = (key: 'total' | 'selected', color: string) => {
      const isSelected = key === 'selected';
      return (
        <g key={key}>
          <path d={createAreaPath(key)} fill={color} fillOpacity="0.1" stroke="none" />
          <path d={createLinePath(key)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={isSelected ? "4 4" : "none"} className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
          {incomeChartData.map((d, i) => {
            let val = 0;
            if (key === 'total') val = incomeChartMetric === 'gross' ? d.totalGross : d.totalNet;
            else val = incomeChartMetric === 'gross' ? d.selectedStreamGross : d.selectedStreamNet;

            const { x, y } = getCoord(val, i);
            return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
          })}
        </g>
      );
    };

    return (
      <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
            <button onClick={() => setIncomeChartTimeView('month')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${incomeChartTimeView === 'month' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>MONTH</button>
            <button onClick={() => setIncomeChartTimeView('year')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${incomeChartTimeView === 'year' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>YEAR</button>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
            <button onClick={() => setIncomeChartMetric('net')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${incomeChartMetric === 'net' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
              NET INCOME
            </button>
            <button onClick={() => setIncomeChartMetric('gross')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${incomeChartMetric === 'gross' ? 'bg-gray-800 text-white border border-gray-700' : 'text-gray-500 hover:text-gray-300'}`}>
              GROSS INCOME
            </button>
          </div>

          <div className="relative group">
            <select
              value={incomeChartSelectedStreamId}
              onChange={(e) => setIncomeChartSelectedStreamId(e.target.value)}
              className="appearance-none bg-gray-900 border border-gray-800 text-xs font-bold px-4 py-2 pr-8 rounded-xl outline-none transition-colors min-w-[150px]"
              style={{
                color: incomeChartSelectedStreamId ? neonColors.selected : '#9ca3af',
                borderColor: incomeChartSelectedStreamId ? `${neonColors.selected}60` : '#1f2937'
              }}
            >
              <option value="">Track Individual Stream...</option>
              {incomeStreams.map(stream => (
                <option key={stream.id} value={stream.id}>{stream.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} style={{ color: incomeChartSelectedStreamId ? neonColors.selected : '#6b7280' }} />
            </div>
          </div>
        </div>

        <div className="w-full h-[300px] relative group">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = height - padding - pct * (height - padding * 2);
              return (
                <g key={pct}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />
                  <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-gray-600 text-[10px] font-mono">
                    ${Math.round(minVal + pct * range).toLocaleString()}
                  </text>
                </g>
              )
            })}

            {renderSeries('total', neonColors.total)}
            {incomeChartSelectedStreamId && renderSeries('selected', neonColors.selected)}

            {incomeChartData.map((d, i) => {
              if (incomeChartData.length > 12 && i % Math.ceil(incomeChartData.length / 12) !== 0) return null;
              const { x } = getCoord(0, i);
              return (
                <text key={i} x={x} y={height - 10} textAnchor="middle" className="fill-gray-500 text-[10px] font-medium uppercase tracking-wider">
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const ExpenseTrendsChart = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Data Processing
    const { processedData, maxTotal, categoryColors } = useMemo(() => {
      const grouped: Record<string, { total: number, categories: Record<string, number> }> = {};

      const relevantTransactions = transactions;

      relevantTransactions.forEach(t => {
        const date = new Date(t.date + 'T00:00:00');
        if (isNaN(date.getTime())) return;

        let key = '';

        if (dashboardChartTimeView === 'month') {
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
          key = `${date.getFullYear()}`;
        }

        if (!grouped[key]) {
          grouped[key] = { total: 0, categories: {} };
        }

        const amt = parseFloat(t.amount.toString()) || 0;
        if (amt > 0) {
          grouped[key].total += amt;
          grouped[key].categories[t.category] = (grouped[key].categories[t.category] || 0) + amt;
        }
      });

      // Convert to array
      let arr = Object.keys(grouped).map(key => {
        const dateObj = new Date(key + (key.includes('-') ? '-01' : '-01-01') + 'T00:00:00');
        let label = '';
        if (dashboardChartTimeView === 'month') {
          label = `${months[dateObj.getMonth()].substring(0, 3)} '${dateObj.getFullYear().toString().slice(2)}`;
        } else {
          label = key;
        }
        return {
          key,
          label,
          ...grouped[key]
        };
      });

      // Sort chronologically
      arr.sort((a, b) => a.key.localeCompare(b.key));

      // Slice for viewability
      if (dashboardChartTimeView === 'month') {
        arr = arr.slice(-12);
      } else {
        arr = arr.slice(-5);
      }

      const max = Math.max(...arr.map(d => d.total), 100);

      // Determine colors based on global frequency in this slice
      const catTotals: Record<string, number> = {};
      arr.forEach(d => {
        Object.entries(d.categories).forEach(([cat, amt]) => {
          catTotals[cat] = (catTotals[cat] || 0) + amt;
        });
      });
      const sortedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);
      const colors: Record<string, string> = {};
      sortedCats.forEach((cat, i) => {
        colors[cat] = customColors[cat] || NEON_PALETTE[i % NEON_PALETTE.length];
      });

      return { processedData: arr, maxTotal: max, categoryColors: colors };
    }, [transactions, dashboardChartTimeView]);

    if (processedData.length === 0) return (
      <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-8 shadow-xl flex flex-col items-center justify-center min-h-[400px] col-span-1 md:col-span-3">
        <Activity size={48} className="text-gray-700 mb-4" />
        <p className="text-gray-500">No expense data available yet.</p>
      </div>
    );

    const width = 1000;
    const height = 400;
    const padding = 80;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = Math.min(60, chartWidth / processedData.length - 20);
    const gap = (chartWidth - (processedData.length * barWidth)) / (processedData.length + 1);

    return (
      <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 shadow-xl relative overflow-hidden col-span-1 md:col-span-3">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Expense Trends</h3>
            <p className="text-gray-500 text-xs">Breakdown by category over time</p>
          </div>
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setDashboardChartTimeView('month')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardChartTimeView === 'month' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              MONTH
            </button>
            <button
              onClick={() => setDashboardChartTimeView('year')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardChartTimeView === 'year' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              YEAR
            </button>
          </div>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = height - padding - (pct * chartHeight);
              return (
                <g key={pct}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />
                  <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-gray-500 text-xs font-mono">
                    ${Math.round(pct * maxTotal).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {processedData.map((d, i) => {
              const x = padding + gap + (i * (barWidth + gap));
              const totalHeight = (d.total / maxTotal) * chartHeight;
              const topY = height - padding - totalHeight;
              let stackY = height - padding;

              const barCats = Object.keys(categoryColors).filter(c => d.categories[c]);
              const isHovered = hoveredIndex === i;

              return (
                <g
                  key={d.key}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Total Amount Label */}
                  <text
                    x={x + barWidth / 2}
                    y={topY - 10}
                    textAnchor="middle"
                    className="fill-gray-300 text-[10px] md:text-xs font-bold font-mono"
                  >
                    ${d.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>

                  {isHovered ? (
                    barCats.map(cat => {
                      const amt = d.categories[cat] || 0;
                      const h = (amt / maxTotal) * chartHeight;
                      stackY -= h;
                      return (
                        <rect
                          key={cat}
                          x={x}
                          y={stackY}
                          width={barWidth}
                          height={h}
                          fill={categoryColors[cat]}
                          stroke="#0d0d0d"
                          strokeWidth="1"
                        />
                      );
                    })
                  ) : (
                    <rect
                      x={x}
                      y={topY}
                      width={barWidth}
                      height={totalHeight}
                      fill={theme.hex}
                      rx={4}
                      ry={4}
                      className="opacity-80 hover:opacity-100"
                    />
                  )}

                  {/* Label */}
                  <text x={x + barWidth / 2} y={height - 15} textAnchor="middle" className="fill-gray-400 text-xs font-bold uppercase">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredIndex !== null && processedData[hoveredIndex] && (
            <div className={`absolute top-4 ${hoveredIndex >= processedData.length / 2 ? 'left-4' : 'right-4'} bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl min-w-[200px] z-10 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}>
              <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-2">{processedData[hoveredIndex].label}</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs uppercase font-bold">Total</span>
                <span className="text-white font-mono font-bold">${processedData[hoveredIndex].total.toLocaleString()}</span>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-hidden">
                {Object.entries(processedData[hoveredIndex].categories)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
                        <span className="text-gray-300">{cat}</span>
                      </div>
                      <span className="text-gray-400 font-mono">${amt.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const NetWorthHistoryChart = () => {
    const [view, setView] = useState<'month' | 'year'>('month');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Filter and Sort Data
    const data = useMemo(() => {
      let sorted = [...monthlyHistory].sort((a, b) => {
        const keyA = a.sortKey || a.date;
        const keyB = b.sortKey || b.date;
        return keyA.localeCompare(keyB);
      });

      if (view === 'year') {
        const yearlyMap = new Map();
        sorted.forEach(h => {
          const sortKey = h.sortKey || h.date;
          // Parse year from sortKey (YYYY-MM) or date
          const y = sortKey.includes('-') ? sortKey.split('-')[0] : (new Date(h.date).getFullYear().toString() || "Unknown");
          yearlyMap.set(y, h); // Overwrites, so we get the last one
        });
        return Array.from(yearlyMap.values());
      }

      // Month view: limit to last 24 to avoid crowding if history is long
      return sorted.slice(-24);
    }, [monthlyHistory, view]);

    if (data.length < 2) {
      return (
        <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px] col-span-1 md:col-span-3 mb-6">
          <Activity size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-500">Not enough history to show Net Worth trends.</p>
          <p className="text-xs text-gray-600">Save detailed monthly history in Asset Watch.</p>
        </div>
      );
    }

    const width = 1000;
    const height = 400;
    const padding = 100;

    const values = data.map(d => d.netWorth);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const domainMin = minVal - (range * 0.1); // 10% padding
    const domainMax = maxVal + (range * 0.1);
    const domainRange = domainMax - domainMin;

    const getX = (i: number) => padding + (i / (data.length - 1)) * (width - padding * 2);
    const getY = (v: number) => height - padding - ((v - domainMin) / domainRange) * (height - padding * 2);

    const points = data.map((d, i) => `${getX(i)},${getY(d.netWorth)}`).join(' ');

    return (
      <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 shadow-xl relative overflow-hidden col-span-1 md:col-span-3 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Net Worth Over Time</h3>
            <p className="text-gray-500 text-xs">Historical balance sheet performance</p>
          </div>
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button onClick={() => setView('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'month' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>MONTHLY</button>
            <button onClick={() => setView('year')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'year' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>YEARLY</button>
          </div>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid & Y Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const val = domainMin + pct * domainRange;
              const y = height - padding - (pct * (height - padding * 2));
              return (
                <g key={pct}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />
                  <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-gray-500 text-xs font-mono">${Math.round(val).toLocaleString()}</text>
                </g>
              );
            })}

            {/* Area */}
            <path d={`M ${points.split(' ')[0]} L ${points.split(' ').join(' L ')} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`} fill="#00ff9f" fillOpacity="0.1" stroke="none" />

            {/* Line */}
            <polyline points={points} fill="none" stroke="#00ff9f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(0,255,159,0.3)]" />

            {/* Dots & Interactivity */}
            {data.map((d, i) => {
              const x = getX(i);
              const y = getY(d.netWorth);
              const isHovered = hoveredIndex === i;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#00ff9f" : "#0d0d0d"}
                  stroke="#00ff9f"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* X Axis Labels */}
            {data.map((d, i) => {
              // Skip labels to prevent overcrowding
              if (data.length > 12 && i % Math.ceil(data.length / 12) !== 0) return null;

              const dateObj = new Date(d.sortKey ? d.sortKey + '-01' : d.date);
              let label = "";
              if (!isNaN(dateObj.getTime())) {
                label = view === 'month'
                  ? `${months[dateObj.getMonth()].substring(0, 3)} '${dateObj.getFullYear().toString().slice(2)}`
                  : dateObj.getFullYear().toString();
              } else {
                label = d.date.split(' ').pop() || '';
              }

              return (
                <text key={i} x={getX(i)} y={height - 20} textAnchor="middle" className="fill-gray-500 text-xs font-bold uppercase">{label}</text>
              );
            })}
          </svg>

          {/* Tooltip HTML Overlay */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div
              className="absolute bg-gray-900/95 backdrop-blur-md border border-gray-700 p-3 rounded-xl shadow-2xl z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-opacity duration-200"
              style={{
                left: `${(padding + (hoveredIndex / (data.length - 1)) * (width - padding * 2)) / width * 100}%`,
                top: `${(height - padding - ((data[hoveredIndex].netWorth - domainMin) / domainRange) * (height - padding * 2)) / height * 100}%`
              }}
            >
              <div className="text-xs text-gray-400 uppercase font-bold mb-1">{data[hoveredIndex].date}</div>
              <div className="text-lg font-bold text-[#00ff9f] font-mono">${data[hoveredIndex].netWorth.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 flex flex-col p-6 space-y-8 bg-[#0d0d0d] flex-shrink-0">
          <div className="flex items-center space-x-2 px-2">
            <div className={`w-8 h-8 ${theme.primary} rounded-lg flex items-center justify-center`}>
              <Mountain size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Summit</h1>
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
            {SIDEBAR_TABS.filter(item => !hiddenTabs.includes(item.id) || item.id === 'settings').map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? `${theme.primary} text-white shadow-lg ${theme.shadow}` : 'text-gray-400 hover:bg-gray-800'
                  }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-gray-800 space-y-2">
            {!fileHandle ? (
              <>
                <button onClick={handleCreateNewFile} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all">
                  <SaveIcon size={14} /> <span>NEW FILE</span>
                </button>
                <button onClick={handleOpenFile} className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs font-bold transition-all">
                  <FolderOpen size={14} /> <span>OPEN FILE</span>
                </button>
              </>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <FileJson size={10} /> LINKED FILE
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${saveStatus === 'saved' ? 'bg-green-500/10 text-green-500' :
                    saveStatus === 'saving' ? 'bg-yellow-500/10 text-yellow-500' :
                      saveStatus === 'error' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-500/10 text-gray-400'
                    }`}>
                    {saveStatus === 'saved' ? 'SAVED' : saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'error' ? 'ERROR' : 'UNSAVED'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mb-3" title={typeof fileHandle === 'string' ? fileHandle : fileHandle?.name}>
                  {typeof fileHandle === 'string' ? fileHandle.split(/[/\\]/).pop() : fileHandle?.name}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleSaveAs} className="flex items-center justify-center space-x-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg text-[10px] font-bold transition-all">
                    SAVE AS
                  </button>
                  <button onClick={() => { updateFileHandle(null); setSaveStatus(null); }} className="flex items-center justify-center space-x-1 bg-gray-800 hover:bg-red-900/30 text-gray-300 hover:text-red-400 py-1.5 rounded-lg text-[10px] font-bold transition-all">
                    CLOSE
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside >

        {/* Main */}
        < main className="flex-1 overflow-y-auto bg-[#0a0a0a]" >
          {activeTab !== 'settings' && activeTab !== 'dashboard' && (
            <header className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800 p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {activeTab === 'mileage' ? (
                  <>
                    <button onClick={() => setCurrentYear(y => y - 1)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold min-w-[140px] text-center text-white">
                      {currentYear} Log
                    </h2>
                    <button onClick={() => setCurrentYear(y => y + 1)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                      <ChevronRight size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold min-w-[140px] text-center text-white">
                      {months[currentMonth]} {currentYear}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              <div className="flex space-x-4">
                {activeTab === 'expenses' && (
                  <>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg. Spend (12M)</p>
                      <p className="text-xl font-bold text-gray-400">${averageMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Monthly Spend</p>
                      <p className="text-xl font-bold text-white">${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </>
                )}
                {activeTab === 'business' && (
                  <>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg. Business Spend (12M)</p>
                      <p className="text-xl font-bold text-gray-400">${averageBusinessMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Business Spend (YTD)</p>
                      <p className="text-xl font-bold text-white">${totalBusinessSpendYTD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </>
                )}
                {activeTab === 'assets' && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Net Worth</p>
                    <p className="text-xl font-bold text-white">${netWorthData.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
                {activeTab === 'income' && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Net Income YTD</p>
                    <p className="text-xl font-bold text-white">${totalIncomeYTD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            </header>
          )}

          <div className="p-8 max-w-7xl mx-auto space-y-10">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {dashboardOrder
                  .filter(id => !hiddenDashboardWidgets.includes(id))
                  .map(widgetId => {
                    if (widgetId === 'stats') {
                      return (
                        <div key="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 shadow-xl">
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Net Worth</p>
                            <h3 className="text-4xl font-bold tracking-tight text-white">${netWorthData.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                          </div>

                          <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800">
                            <p className="text-gray-400 text-sm font-medium mb-1">Monthly Spending</p>
                            <h3 className="text-3xl font-bold text-white">${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                          </div>

                          <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800">
                            <p className="text-gray-400 text-sm font-medium mb-1">Estimated Net Income</p>
                            <h3 className="text-3xl font-bold text-white">
                              ${currentMonthIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <div className={`mt-4 flex items-center justify-between text-sm`}>
                              <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Gross: ${incomeStreams.reduce((acc, s) => acc + (parseFloat(s.grossAmount.toString()) || 0), 0).toLocaleString()}</span>
                              <span className={theme.text}>{incomeStreams.length} Streams</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (widgetId === 'savings') {
                      return (
                        <div key="savings" className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-8 shadow-xl">
                          <div className="flex justify-between items-end mb-4">
                            <div>
                              <h4 className="text-gray-400 text-sm font-medium mb-1">
                                {savingsRate >= 0 ? "Monthly Savings Rate" : "Monthly Burn Rate"} {savingsRate >= 0 ? "💰" : "🔥"}
                              </h4>
                              <h3 className={`text-4xl font-bold ${savingsRate >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                {Math.abs(savingsRate).toFixed(1)}%
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                                {savingsRate >= 0 ? "Saved this month" : "Monthly Deficit"}
                              </p>
                              <p className={`text-xl font-mono font-bold ${savingsRate >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                ${Math.abs(savingsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${savingsRate >= 0 ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-rose-500 shadow-[0_0_15px_#f43f5e]"}`}
                              style={{ width: `${Math.min(Math.max(Math.abs(savingsRate), 0), 100)}%` }}
                            />
                          </div>
                          {Math.abs(savingsRate) > 100 && (
                            <p className="text-[10px] text-gray-500 mt-2 italic text-right">
                              * {savingsRate > 100 ? "Savings exceed 100% of net income" : "Spending exceeds 2x net income"}
                            </p>
                          )}
                        </div>
                      );
                    }

                    if (widgetId === 'networth-chart') {
                      return <NetWorthHistoryChart key="networth-chart" />;
                    }

                    if (widgetId === 'expense-chart') {
                      return (
                        <div key="expense-chart" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <ExpenseTrendsChart />
                        </div>
                      );
                    }

                    return null;
                  })}
              </div>
            )}

            {activeTab === 'expenses' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 shadow-xl">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Category Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800">
                            <th className="pb-3 font-bold">Category</th>
                            <th className="pb-3 font-bold text-right">This Month</th>
                            <th className="pb-3 font-bold text-right">vs Last Month</th>
                            <th className="pb-3 font-bold text-right">12M Avg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {categoryStats.map(stat => (
                            <tr key={stat.name} className="group">
                              <td className="py-3 text-sm font-medium text-gray-300">{stat.name}</td>
                              <td className="py-3 text-sm text-right font-bold text-white">${stat.total.toFixed(2)}</td>
                              <td className={`py-3 text-sm text-right font-medium flex items-center justify-end space-x-1 ${stat.diffPct > 0 ? 'text-red-400' : stat.diffPct < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                {stat.diffPct > 0 ? <ArrowUpRight size={14} /> : stat.diffPct < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                                <span>{Math.abs(stat.diffPct).toFixed(0)}%</span>
                              </td>
                              <td className="py-3 text-sm text-right font-mono text-gray-500">${stat.avg12M.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 flex flex-col items-center justify-start relative shadow-xl overflow-hidden min-h-[450px]">
                    <div className="w-full flex justify-between items-start mb-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Spend Mix</h3>
                    </div>

                    <div className="w-48 h-48 flex-shrink-0">
                      <PieChartComp data={categoryStats} />
                    </div>

                    <div className="mt-8 w-full">
                      <div className="flex flex-wrap justify-center gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {categoryStats.map((s, i) => {
                          const color = customColors[s.name] || NEON_PALETTE[i % NEON_PALETTE.length];
                          const percent = totalMonthlySpend > 0 ? (s.total / totalMonthlySpend) * 100 : 0;
                          return (
                            <div key={s.name} className="flex items-center space-x-2 bg-gray-900/50 border border-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-800/80 transition-colors">
                              <div
                                className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                                style={{ backgroundColor: color, color: color }}
                              />
                              <span className="text-[11px] text-gray-300 font-medium whitespace-nowrap">{s.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono ml-1">{percent.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-bold text-white">Daily Ledger</h2>
                      {/* Search Bar */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={14} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search ledger..."
                          className="bg-gray-900/50 border border-gray-800 text-sm rounded-xl pl-9 pr-8 py-2 w-64 focus:w-80 transition-all outline-none text-white focus:border-blue-500/50 focus:bg-gray-900"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <input type="file" ref={fileInputRef} onChange={handleLedgerImport} className="hidden" accept=".csv" />
                      <button onClick={() => setIsImportLedgerModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300"><FileUp size={14} /><span>IMPORT</span></button>
                      <button onClick={() => setIsExportModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300"><Download size={14} /><span>EXPORT</span></button>
                      <button onClick={handleOpenRecurringModal} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300"><Repeat size={14} /><span>RECURRING</span></button>
                      <button onClick={addBlankRow} className={`flex items-center space-x-2 px-4 py-2 ${theme.primary} rounded-xl text-xs font-bold ${theme.primaryHover} text-white shadow-lg ${theme.shadow}`}><Plus size={14} /><span>ADD ROW</span></button>
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="bg-gray-900/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                          <th className="px-4 py-3 w-40">Date</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3 w-32 text-right">Amount</th>
                          <th className="px-4 py-3 w-48">Category</th>
                          <th className="px-4 py-3 w-40">Method</th>
                          <th className="px-4 py-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {displayedTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500 italic">No transactions found.</td>
                          </tr>
                        ) : (
                          displayedTransactions.map(t => (
                            <tr key={t.id} className={`hover:${theme.primary}/5 transition-colors group`}>
                              <td className="p-0 border-r border-gray-800/20">
                                <input type="date" className="w-full h-11 bg-transparent px-4 py-2 outline-none text-sm text-white border-none focus:bg-gray-800/30 [color-scheme:dark]" value={t.date} onChange={(e) => updateTransaction(t.id, 'date', e.target.value)} />
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <input type="text" placeholder="..." className="w-full h-11 bg-transparent px-4 py-2 outline-none text-sm text-white font-medium border-none focus:bg-gray-800/30" value={t.description} onChange={(e) => updateTransaction(t.id, 'description', e.target.value)} />
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <div className="flex items-center h-11 px-4 focus-within:bg-gray-800/30">
                                  <span className="text-gray-600 mr-1 text-xs">$</span>
                                  <input type="number" step="0.01" className={`w-full bg-transparent outline-none text-sm text-right font-mono ${theme.text} font-bold border-none`} value={t.amount} onChange={(e) => updateTransaction(t.id, 'amount', e.target.value)} />
                                </div>
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <select className="w-full h-11 bg-transparent px-4 py-2 outline-none text-xs text-gray-400 border-none cursor-pointer focus:bg-gray-800/30" value={t.category} onChange={(e) => updateTransaction(t.id, 'category', e.target.value)}>
                                  {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                                </select>
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <select className="w-full h-11 bg-transparent px-4 py-2 outline-none text-xs text-gray-500 border-none cursor-pointer focus:bg-gray-800/30" value={t.method} onChange={(e) => updateTransaction(t.id, 'method', e.target.value)}>
                                  {paymentMethods.map(m => <option key={m} value={m} className="bg-gray-900">{m}</option>)}
                                </select>
                              </td>
                              <td className="p-0 text-center">
                                <button onClick={() => setTransactions(transactions.filter(tx => tx.id !== t.id))} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Import Modal */}
                  {isImportLedgerModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileUp size={20} className={theme.text} /> Import Ledger
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">Select year and upload CSV file.</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Import Year</label>
                            <input
                              type="number"
                              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
                              value={importLedgerYear}
                              onChange={(e) => setImportLedgerYear(parseInt(e.target.value) || new Date().getFullYear())}
                            />
                            <p className="text-[10px] text-gray-600 mt-2">Used when CSV dates don't include a year (e.g. MM/DD).</p>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => {
                              if (fileInputRef.current) fileInputRef.current.value = "";
                              fileInputRef.current?.click();
                            }}
                            className={`flex-1 ${theme.primary} ${theme.primaryHover} text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg`}
                          >
                            SELECT FILE & IMPORT
                          </button>
                          <button onClick={() => setIsImportLedgerModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Export Modal */}
                  {isExportModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">Export Ledger</h3>
                          <p className="text-gray-500 text-sm mt-1">Select the data range you wish to export.</p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: 'currentViewMonth', label: `Current Month (${months[currentMonth]})` },
                            { id: 'currentViewYear', label: `Current Year (${currentYear})` },
                            { id: 'last3Months', label: 'Last 3 Months' },
                            { id: 'last6Months', label: 'Last 6 Months' },
                            { id: 'last12Months', label: 'Last 12 Months' },
                            { id: 'allTime', label: 'All Time' },
                          ].map(opt => (
                            <label key={opt.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${exportRange === opt.id ? `${theme.primary}/10 ${theme.border} text-white` : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                              <input
                                type="radio"
                                name="exportRange"
                                value={opt.id}
                                checked={exportRange === opt.id}
                                onChange={(e) => setExportRange(e.target.value)}
                                className="hidden"
                              />
                              <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${exportRange === opt.id ? theme.border : 'border-gray-600'}`}>
                                {exportRange === opt.id && <div className={`w-2 h-2 ${theme.primary} rounded-full`} />}
                              </div>
                              <span className="text-sm font-medium">{opt.label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button onClick={handleExport} className={`flex-1 ${theme.primary} ${theme.primaryHover} text-white font-bold py-3 rounded-xl text-sm transition-colors`}>
                            DOWNLOAD CSV
                          </button>
                          <button onClick={() => setIsExportModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recurring Expenses Modal */}
                  {isRecurringModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30 rounded-t-3xl">
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Repeat size={20} className={theme.text} /> Recurring Expenses
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Select items to add to the current ledger month.</p>
                          </div>
                          <button onClick={() => setIsRecurringModalOpen(false)} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800">
                            <X size={20} />
                          </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                                <th className="pb-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    className="accent-blue-500"
                                    checked={selectedRecurringIds.size === recurringExpenses.length && recurringExpenses.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedRecurringIds(new Set(recurringExpenses.map(r => r.id)));
                                      else setSelectedRecurringIds(new Set());
                                    }}
                                  />
                                </th>
                                <th className="pb-3 pl-2">Description</th>
                                <th className="pb-3 w-32 text-right">Amount</th>
                                <th className="pb-3 w-40 pl-4">Category</th>
                                <th className="pb-3 w-40 pl-4">Method</th>
                                <th className="pb-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                              {recurringExpenses.map(r => (
                                <tr key={r.id} className="group hover:bg-gray-900/30">
                                  <td className="py-3 text-center">
                                    <input
                                      type="checkbox"
                                      className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                                      checked={selectedRecurringIds.has(r.id)}
                                      onChange={() => toggleRecurringSelection(r.id)}
                                    />
                                  </td>
                                  <td className="py-3 pl-2">
                                    <input
                                      type="text"
                                      value={r.description}
                                      onChange={(e) => updateRecurringTemplate(r.id, 'description', e.target.value)}
                                      className="bg-transparent text-sm text-white font-medium outline-none w-full placeholder-gray-600 focus:text-blue-400"
                                      placeholder="Expense Name"
                                    />
                                  </td>
                                  <td className="py-3 text-right">
                                    <input
                                      type="number"
                                      value={r.amount}
                                      onChange={(e) => updateRecurringTemplate(r.id, 'amount', e.target.value)}
                                      className="bg-transparent text-sm text-white font-mono text-right outline-none w-full placeholder-gray-600 focus:text-blue-400"
                                      placeholder="0.00"
                                    />
                                  </td>
                                  <td className="py-3 pl-4">
                                    <select
                                      value={r.category}
                                      onChange={(e) => updateRecurringTemplate(r.id, 'category', e.target.value)}
                                      className="bg-transparent text-xs text-gray-400 outline-none w-full cursor-pointer focus:text-white"
                                    >
                                      {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                                    </select>
                                  </td>
                                  <td className="py-3 pl-4">
                                    <select
                                      value={r.method}
                                      onChange={(e) => updateRecurringTemplate(r.id, 'method', e.target.value)}
                                      className="bg-transparent text-xs text-gray-400 outline-none w-full cursor-pointer focus:text-white"
                                    >
                                      {paymentMethods.map(m => <option key={m} value={m} className="bg-gray-900">{m}</option>)}
                                    </select>
                                  </td>
                                  <td className="py-3 text-center">
                                    <button onClick={() => deleteRecurringTemplate(r.id)} className="text-gray-700 hover:text-red-500 transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            onClick={addNewRecurringTemplate}
                            className="mt-4 flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                          >
                            <Plus size={14} /> <span>ADD NEW TEMPLATE</span>
                          </button>
                        </div>

                        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/30 rounded-b-3xl">
                          <button onClick={() => setIsRecurringModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                            CANCEL
                          </button>
                          <button
                            onClick={handleAddRecurringToLedger}
                            className={`px-8 py-3 ${theme.primary} ${theme.primaryHover} text-white font-bold rounded-xl text-sm transition-colors shadow-lg`}
                            disabled={selectedRecurringIds.size === 0}
                          >
                            ADD {selectedRecurringIds.size} TO LEDGER
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'business' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 shadow-xl">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Business Spend Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800">
                            <th className="pb-3 font-bold">Category</th>
                            <th className="pb-3 font-bold text-right">This Month</th>
                            <th className="pb-3 font-bold text-right">vs Last Month</th>
                            <th className="pb-3 font-bold text-right">12M Avg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {businessCategoryStats.map(stat => (
                            <tr key={stat.name} className="group">
                              <td className="py-3 text-sm font-medium text-gray-300">{stat.name}</td>
                              <td className="py-3 text-sm text-right font-bold text-white">${stat.total.toFixed(2)}</td>
                              <td className={`py-3 text-sm text-right font-medium flex items-center justify-end space-x-1 ${stat.diffPct > 0 ? 'text-red-400' : stat.diffPct < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                {stat.diffPct > 0 ? <ArrowUpRight size={14} /> : stat.diffPct < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                                <span>{Math.abs(stat.diffPct).toFixed(0)}%</span>
                              </td>
                              <td className="py-3 text-sm text-right font-mono text-gray-500">${stat.avg12M.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 flex flex-col items-center justify-start relative shadow-xl overflow-hidden min-h-[450px]">
                    <div className="w-full flex justify-between items-start mb-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Business Mix</h3>
                    </div>

                    <div className="w-48 h-48 flex-shrink-0">
                      <PieChartComp data={businessCategoryStats} />
                    </div>

                    <div className="mt-8 w-full">
                      <div className="flex flex-wrap justify-center gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {businessCategoryStats.map((s, i) => {
                          const color = customColors[s.name] || NEON_PALETTE[i % NEON_PALETTE.length];
                          const percent = totalBusinessMonthlySpend > 0 ? (s.total / totalBusinessMonthlySpend) * 100 : 0;
                          return (
                            <div key={s.name} className="flex items-center space-x-2 bg-gray-900/50 border border-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-800/80 transition-colors">
                              <div
                                className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                                style={{ backgroundColor: color, color: color }}
                              />
                              <span className="text-[11px] text-gray-300 font-medium whitespace-nowrap">{s.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono ml-1">{percent.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-bold text-white">Business Ledger</h2>
                      {/* Search Bar */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={14} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={businessSearchQuery}
                          onChange={(e) => setBusinessSearchQuery(e.target.value)}
                          placeholder="Search business ledger..."
                          className="bg-gray-900/50 border border-gray-800 text-sm rounded-xl pl-9 pr-8 py-2 w-64 focus:w-80 transition-all outline-none text-white focus:border-blue-500/50 focus:bg-gray-900"
                        />
                        {businessSearchQuery && (
                          <button
                            onClick={() => setBusinessSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <input type="file" ref={businessFileInputRef} onChange={handleBusinessLedgerImport} className="hidden" accept=".csv" />
                      <button onClick={() => setIsBusinessImportLedgerModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300"><FileUp size={14} /><span>IMPORT</span></button>
                      <button onClick={() => setIsBusinessExportModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300"><Download size={14} /><span>EXPORT</span></button>
                      <button onClick={handleOpenBusinessRecurringModal} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300"><Repeat size={14} /><span>RECURRING</span></button>
                      <button onClick={addBlankBusinessRow} className={`flex items-center space-x-2 px-4 py-2 ${theme.primary} rounded-xl text-xs font-bold ${theme.primaryHover} text-white shadow-lg ${theme.shadow}`}><Plus size={14} /><span>ADD ROW</span></button>
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="bg-gray-900/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                          <th className="px-4 py-3 w-40">Date</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3 w-32 text-right">Amount</th>
                          <th className="px-4 py-3 w-48">Category</th>
                          <th className="px-4 py-3 w-40">Method</th>
                          <th className="px-4 py-3 w-32 text-center">Receipt</th>
                          <th className="px-4 py-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {displayedBusinessTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500 italic">No business transactions found.</td>
                          </tr>
                        ) : (
                          displayedBusinessTransactions.map(t => (
                            <tr key={t.id} className={`hover:${theme.primary}/5 transition-colors group`}>
                              <td className="p-0 border-r border-gray-800/20">
                                <input type="date" className="w-full h-11 bg-transparent px-4 py-2 outline-none text-sm text-white border-none focus:bg-gray-800/30 [color-scheme:dark]" value={t.date} onChange={(e) => updateBusinessTransaction(t.id, 'date', e.target.value)} />
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <input type="text" placeholder="..." className="w-full h-11 bg-transparent px-4 py-2 outline-none text-sm text-white font-medium border-none focus:bg-gray-800/30" value={t.description} onChange={(e) => updateBusinessTransaction(t.id, 'description', e.target.value)} />
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <div className="flex items-center h-11 px-4 focus-within:bg-gray-800/30">
                                  <span className="text-gray-600 mr-1 text-xs">$</span>
                                  <input type="number" step="0.01" className={`w-full bg-transparent outline-none text-sm text-right font-mono ${theme.text} font-bold border-none`} value={t.amount} onChange={(e) => updateBusinessTransaction(t.id, 'amount', e.target.value)} />
                                </div>
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <select className="w-full h-11 bg-transparent px-4 py-2 outline-none text-xs text-gray-400 border-none cursor-pointer focus:bg-gray-800/30" value={t.category} onChange={(e) => updateBusinessTransaction(t.id, 'category', e.target.value)}>
                                  {businessCategories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                                </select>
                              </td>
                              <td className="p-0 border-r border-gray-800/20">
                                <select className="w-full h-11 bg-transparent px-4 py-2 outline-none text-xs text-gray-500 border-none cursor-pointer focus:bg-gray-800/30" value={t.method} onChange={(e) => updateBusinessTransaction(t.id, 'method', e.target.value)}>
                                  {businessPaymentMethods.map(m => <option key={m} value={m} className="bg-gray-900">{m}</option>)}
                                </select>
                              </td>
                              <td
                                className="p-0 border-r border-gray-800/20 relative group/cell"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file) handleReceiptUpload(file, t.id);
                                }}
                                onPaste={(e) => {
                                  const file = e.clipboardData.files[0];
                                  if (file) handleReceiptUpload(file, t.id);
                                }}
                              >
                                {t.receiptPath ? (
                                  <div className="flex items-center justify-center h-11 w-full px-2" title={t.receiptPath}>
                                    <div className="flex items-center space-x-1 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50 cursor-pointer" onClick={() => {/* Open file if possible */ }}>
                                      <Receipt size={12} className="text-blue-400" />
                                      <span className="text-[10px] text-blue-300 truncate max-w-[80px]">{t.receiptPath.split('/').pop()}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateBusinessTransaction(t.id, 'receiptPath', '');
                                        }}
                                        className="hover:text-red-400 text-blue-900 ml-1"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-11 w-full text-gray-700 text-[10px] italic hover:text-gray-500 cursor-pointer">
                                    <span className="hidden group-hover/cell:inline">Drag / Paste</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-0 text-center">
                                <button onClick={() => setBusinessTransactions(businessTransactions.filter(tx => tx.id !== t.id))} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Business Import Modal */}
                  {isBusinessImportLedgerModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileUp size={20} className={theme.text} /> Import Business Ledger
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">Select year and upload CSV file.</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Import Year</label>
                            <input
                              type="number"
                              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
                              value={businessImportLedgerYear}
                              onChange={(e) => setBusinessImportLedgerYear(parseInt(e.target.value) || new Date().getFullYear())}
                            />
                            <p className="text-[10px] text-gray-600 mt-2">Used when CSV dates don't include a year (e.g. MM/DD).</p>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => {
                              if (businessFileInputRef.current) businessFileInputRef.current.value = "";
                              businessFileInputRef.current?.click();
                            }}
                            className={`flex-1 ${theme.primary} ${theme.primaryHover} text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg`}
                          >
                            SELECT FILE & IMPORT
                          </button>
                          <button onClick={() => setIsBusinessImportLedgerModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business Export Modal */}
                  {isBusinessExportModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">Export Business Ledger</h3>
                          <p className="text-gray-500 text-sm mt-1">Select the data range you wish to export.</p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: 'currentViewMonth', label: `Current Month (${months[currentMonth]})` },
                            { id: 'currentViewYear', label: `Current Year (${currentYear})` },
                            { id: 'last3Months', label: 'Last 3 Months' },
                            { id: 'last6Months', label: 'Last 6 Months' },
                            { id: 'last12Months', label: 'Last 12 Months' },
                            { id: 'allTime', label: 'All Time' },
                          ].map(opt => (
                            <label key={opt.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${businessExportRange === opt.id ? `${theme.primary}/10 ${theme.border} text-white` : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                              <input
                                type="radio"
                                name="exportRange"
                                value={opt.id}
                                checked={businessExportRange === opt.id}
                                onChange={(e) => setBusinessExportRange(e.target.value)}
                                className="hidden"
                              />
                              <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${businessExportRange === opt.id ? theme.border : 'border-gray-600'}`}>
                                {businessExportRange === opt.id && <div className={`w-2 h-2 ${theme.primary} rounded-full`} />}
                              </div>
                              <span className="text-sm font-medium">{opt.label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button onClick={handleBusinessExport} className={`flex-1 ${theme.primary} ${theme.primaryHover} text-white font-bold py-3 rounded-xl text-sm transition-colors`}>
                            DOWNLOAD CSV
                          </button>
                          <button onClick={() => setIsBusinessExportModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business Recurring Expenses Modal */}
                  {isBusinessRecurringModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30 rounded-t-3xl">
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Repeat size={20} className={theme.text} /> Business Recurring Expenses
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Select items to add to the current ledger month.</p>
                          </div>
                          <button onClick={() => setIsBusinessRecurringModalOpen(false)} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800">
                            <X size={20} />
                          </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                                <th className="pb-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    className="accent-blue-500"
                                    checked={selectedBusinessRecurringIds.size === businessRecurringExpenses.length && businessRecurringExpenses.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedBusinessRecurringIds(new Set(businessRecurringExpenses.map(r => r.id)));
                                      else setSelectedBusinessRecurringIds(new Set());
                                    }}
                                  />
                                </th>
                                <th className="pb-3 pl-2">Description</th>
                                <th className="pb-3 w-32 text-right">Amount</th>
                                <th className="pb-3 w-40 pl-4">Category</th>
                                <th className="pb-3 w-40 pl-4">Method</th>
                                <th className="pb-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                              {businessRecurringExpenses.map(r => (
                                <tr key={r.id} className="group hover:bg-gray-900/30">
                                  <td className="py-3 text-center">
                                    <input
                                      type="checkbox"
                                      className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                                      checked={selectedBusinessRecurringIds.has(r.id)}
                                      onChange={() => toggleBusinessRecurringSelection(r.id)}
                                    />
                                  </td>
                                  <td className="py-3 pl-2">
                                    <input
                                      type="text"
                                      value={r.description}
                                      onChange={(e) => updateBusinessRecurringTemplate(r.id, 'description', e.target.value)}
                                      className="bg-transparent text-sm text-white font-medium outline-none w-full placeholder-gray-600 focus:text-blue-400"
                                      placeholder="Expense Name"
                                    />
                                  </td>
                                  <td className="py-3 text-right">
                                    <input
                                      type="number"
                                      value={r.amount}
                                      onChange={(e) => updateBusinessRecurringTemplate(r.id, 'amount', e.target.value)}
                                      className="bg-transparent text-sm text-white font-mono text-right outline-none w-full placeholder-gray-600 focus:text-blue-400"
                                      placeholder="0.00"
                                    />
                                  </td>
                                  <td className="py-3 pl-4">
                                    <select
                                      value={r.category}
                                      onChange={(e) => updateBusinessRecurringTemplate(r.id, 'category', e.target.value)}
                                      className="bg-transparent text-xs text-gray-400 outline-none w-full cursor-pointer focus:text-white"
                                    >
                                      {businessCategories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                                    </select>
                                  </td>
                                  <td className="py-3 pl-4">
                                    <select
                                      value={r.method}
                                      onChange={(e) => updateBusinessRecurringTemplate(r.id, 'method', e.target.value)}
                                      className="bg-transparent text-xs text-gray-400 outline-none w-full cursor-pointer focus:text-white"
                                    >
                                      {businessPaymentMethods.map(m => <option key={m} value={m} className="bg-gray-900">{m}</option>)}
                                    </select>
                                  </td>
                                  <td className="py-3 text-center">
                                    <button onClick={() => deleteBusinessRecurringTemplate(r.id)} className="text-gray-700 hover:text-red-500 transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            onClick={addNewBusinessRecurringTemplate}
                            className="mt-4 flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                          >
                            <Plus size={14} /> <span>ADD NEW TEMPLATE</span>
                          </button>
                        </div>

                        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/30 rounded-b-3xl">
                          <button onClick={() => setIsBusinessRecurringModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                            CANCEL
                          </button>
                          <button
                            onClick={handleAddBusinessRecurringToLedger}
                            className={`px-8 py-3 ${theme.primary} ${theme.primaryHover} text-white font-bold rounded-xl text-sm transition-colors shadow-lg`}
                            disabled={selectedBusinessRecurringIds.size === 0}
                          >
                            ADD {selectedBusinessRecurringIds.size} TO LEDGER
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Asset Watch</h2>
                    <p className="text-gray-500 mt-1">Full control over your balance sheet.</p>
                  </div>
                  <div className="flex space-x-3">
                    <input type="file" ref={assetHistoryFileInputRef} onChange={handleAssetHistoryImport} className="hidden" accept=".csv" />
                    <button onClick={() => assetHistoryFileInputRef.current?.click()} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold hover:bg-gray-800 text-gray-300 shadow-lg">
                      <FileUp size={14} /><span>IMPORT HISTORY</span>
                    </button>
                    <button onClick={() => setIsAddingCategory(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-700 text-gray-300">
                      <FolderPlus size={14} /><span>NEW CATEGORY</span>
                    </button>
                    <button onClick={saveMonthToHistory} className={`flex items-center space-x-2 px-4 py-2 ${theme.primary} rounded-xl text-xs font-bold ${theme.primaryHover} text-white shadow-lg`}>
                      <span>SAVE MONTH TO HISTORY</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="bg-gray-900/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                        <th className="px-6 py-3">Current Net Worth</th>
                        <th className="px-6 py-3">Prev. Month NW</th>
                        <th className="px-6 py-3">Monthly Net Diff.</th>
                        <th className="px-6 py-3">Monthly Yield</th>
                        <th className="px-6 py-3">Yearly Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-5 text-2xl font-bold text-white">${netWorthData.toLocaleString()}</td>
                        <td className="px-6 py-5 text-xl font-medium text-gray-400">${previousNetWorth.toLocaleString()}</td>
                        <td className={`px-6 py-5 text-xl font-bold ${monthlyNetDiff > 0 ? 'text-green-400' : monthlyNetDiff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {monthlyNetDiff > 0 ? '+' : ''}{monthlyNetDiff.toLocaleString()}
                        </td>
                        <td className={`px-6 py-5 text-xl font-bold ${monthlyYield > 0 ? 'text-green-400' : monthlyYield < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {monthlyYield > 0 ? '+' : ''}{monthlyYield.toFixed(2)}%
                        </td>
                        <td className={`px-6 py-5 text-xl font-bold ${yearlyYield > 0 ? 'text-green-400' : yearlyYield < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {yearlyYield > 0 ? '+' : ''}{yearlyYield.toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Performance Chart */}
                <PerformanceChart />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Asset Allocation Pie Chart */}
                  {/* Asset Allocation Pie Chart */}
                  <div className="bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 shadow-xl flex flex-col relative min-h-[300px]">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Asset Allocation</h3>
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                      <div className="w-56 h-56">
                        <PieChartComp data={assetAllocationData} hideEmptyMessage={true} />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-0 px-12 text-center">
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Total Assets</span>
                        <span className={`font-bold text-white transition-all duration-300 ${totalAssetsValue.toLocaleString().length > 12 ? 'text-sm' :
                          totalAssetsValue.toLocaleString().length > 9 ? 'text-base' : 'text-xl'
                          }`}>
                          ${totalAssetsValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown List */}
                  <div className="lg:col-span-2 bg-[#0d0d0d] rounded-3xl border border-gray-800 p-6 shadow-xl">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Allocation Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {assetAllocationData.length === 0 ? (
                        <div className="col-span-2 text-center text-gray-500 italic py-8">No assets to display.</div>
                      ) : (
                        assetAllocationData.map((d, i) => (
                          <div key={`${d.name}-${i}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-colors">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                                style={{
                                  backgroundColor: customColors[d.name] || NEON_PALETTE[i % NEON_PALETTE.length],
                                  color: customColors[d.name] || NEON_PALETTE[i % NEON_PALETTE.length]
                                }}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-300">{d.name}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{d.category}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white font-mono">${d.total.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-500 font-mono font-bold">{totalAssetsValue > 0 ? ((d.total / totalAssetsValue) * 100).toFixed(1) : 0}%</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {isAddingCategory && (
                  <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-2xl">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Category Name</label>
                      <input
                        autoFocus
                        type="text"
                        placeholder="e.g. Real Estate, Crypto, Collectibles..."
                        className={`w-full bg-transparent border-b border-gray-600 px-0 py-2 outline-none text-white text-lg placeholder-gray-700 focus:${theme.border} transition-colors`}
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveNewCategory()}
                      />
                    </div>
                    <div className="flex items-center space-x-4 pt-2 md:pt-0">
                      <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                        <button onClick={() => setNewCategoryType('asset')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${newCategoryType === 'asset' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>ASSET</button>
                        <button onClick={() => setNewCategoryType('liability')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${newCategoryType === 'liability' ? 'bg-red-900/30 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>LIABILITY</button>
                        <button onClick={() => setNewCategoryType('tracking')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${newCategoryType === 'tracking' ? 'bg-yellow-900/30 text-yellow-500 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>TRACKING</button>
                      </div>
                      <button onClick={handleSaveNewCategory} className="px-6 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 shadow-lg">SAVE</button>
                      <button onClick={() => setIsAddingCategory(false)} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800"><Minus size={20} /></button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {assetStructure.map(category => (
                    <div key={category.id} className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                          {category.name}
                          {category.isLiability && <span className="ml-2 px-1.5 py-0.5 bg-red-900/20 text-red-500 text-[8px] rounded">LIABILITY</span>}
                          {category.isTracking && <span className="ml-2 px-1.5 py-0.5 bg-yellow-900/20 text-yellow-500 text-[8px] rounded">TRACKING ONLY</span>}
                        </h4>
                        <div className="flex space-x-2">
                          <button onClick={() => { setAddingAssetTo(category.id); setNewAssetName(""); }} className={`p-1 ${theme.textHover} text-gray-600 transition-colors`} title="Add Item"><PlusCircle size={14} /></button>
                          <button onClick={() => removeAssetCategory(category.id)} className="p-1 hover:text-red-500 text-gray-600 transition-colors" title="Delete Category"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {category.items.map(item => (
                          <div key={item.id} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center justify-between group transition-all hover:border-gray-700">
                            <div className="flex items-center space-x-3 flex-1">
                              <button onClick={() => removeAssetItem(category.id, item.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-opacity"><Trash2 size={14} /></button>
                              <span className="font-semibold text-sm">{item.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 text-xs">$</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={item.value}
                                className={`bg-transparent border-b border-gray-800 w-32 focus:${theme.border} outline-none text-right font-mono text-white text-sm`}
                                onChange={(e) => updateAssetValue(category.id, item.id, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}

                        {addingAssetTo === category.id && (
                          <div className={`bg-gray-800/60 p-4 rounded-2xl border ${theme.border}/50 flex items-center justify-between animate-in fade-in slide-in-from-top-2`}>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Name..."
                              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full mr-4"
                              value={newAssetName}
                              onChange={e => setNewAssetName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveNewAsset(category.id)}
                            />
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleSaveNewAsset(category.id)} className={`${theme.primary} text-white text-[10px] font-bold px-3 py-1.5 rounded-lg ${theme.primaryHover}`}>ADD</button>
                              <button onClick={() => setAddingAssetTo(null)} className="text-gray-500 hover:text-white"><Minus size={14} /></button>
                            </div>
                          </div>
                        )}

                        {category.items.length === 0 && addingAssetTo !== category.id && (
                          <button onClick={() => { setAddingAssetTo(category.id); setNewAssetName(""); }} className="w-full py-8 text-center border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 text-xs italic hover:bg-gray-900/30 transition-colors">
                            + Add New Asset to {category.name}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Performance History</h3>
                  <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-900/80 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                          <th className="px-6 py-4 w-32">Date</th>
                          <th className="px-6 py-4 text-right">Net Worth</th>
                          <th className="px-6 py-4 text-right">Net Difference</th>
                          <th className="px-6 py-4 text-right">Monthly Yield</th>
                          <th className="px-6 py-4">Comments</th>
                          <th className="px-6 py-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {monthlyHistory.map((h, index) => (
                          <React.Fragment key={h.sortKey || h.date}>
                            <tr
                              className={`hover:bg-gray-800/20 group cursor-pointer transition-colors ${expandedHistoryIndex === index ? 'bg-gray-800/10' : ''}`}
                              onClick={() => toggleHistoryExpansion(index)}
                            >
                              <td className="px-6 py-4 text-sm font-bold text-gray-300 flex items-center gap-2">
                                {expandedHistoryIndex === index ? <ChevronUp size={14} className={theme.text} /> : <ChevronDown size={14} className="text-gray-600" />}
                                {h.date}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-white font-mono">
                                ${h.netWorth.toLocaleString()}
                              </td>
                              <td className={`px-6 py-4 text-right text-sm font-mono ${h.netDiff > 0 ? 'text-green-400' : h.netDiff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                {h.netDiff > 0 ? '+' : ''}{h.netDiff.toLocaleString()}
                              </td>
                              <td className={`px-6 py-4 text-right text-sm font-mono ${h.yield > 0 ? 'text-green-400' : h.yield < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                {h.yield > 0 ? '+' : ''}{h.yield.toFixed(2)}%
                              </td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                  value={h.comment}
                                  onChange={(e) => updateHistoryComment(h.sortKey || h.date, e.target.value)}
                                  className="w-full bg-transparent text-sm text-gray-500 italic outline-none resize-y min-h-[40px] border-b border-transparent focus:border-gray-700 transition-colors placeholder-gray-700"
                                  placeholder="Add notes..."
                                />
                              </td>
                              <td className="px-6 py-4 text-center">
                              </td>
                            </tr>
                            {expandedHistoryIndex === index && (
                              <tr className="bg-gray-950/30">
                                <td colSpan={6} className="px-6 py-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                  {h.snapshot ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-6 border-l-2 border-gray-800">
                                      {h.snapshot.map(cat => (
                                        <div key={cat.id} className="space-y-3">
                                          <div className="flex items-center space-x-2">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.name}</h4>
                                            {cat.isLiability && <span className="px-1.5 py-0.5 bg-red-900/20 text-red-500 text-[8px] rounded">LIABILITY</span>}
                                            {cat.isTracking && <span className="px-1.5 py-0.5 bg-yellow-900/20 text-yellow-500 text-[8px] rounded">TRACKING</span>}
                                          </div>
                                          <div className="space-y-2">
                                            {cat.items.map(item => {
                                              const currentVal = parseFloat(item.value.toString()) || 0;
                                              const prevSnapshot = monthlyHistory[index + 1]?.snapshot;
                                              const prevVal = getPreviousItemValue(prevSnapshot, cat.id, item.id);
                                              const diff = currentVal - prevVal;
                                              const diffPct = prevVal !== 0 ? (diff / Math.abs(prevVal)) * 100 : 0;

                                              const isGood = cat.isLiability ? diff < 0 : diff > 0;
                                              const isNeutral = diff === 0;
                                              const colorClass = isNeutral ? 'text-gray-600' : isGood ? 'text-green-500' : 'text-red-500';

                                              return (
                                                <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-900/50">
                                                  <span className="text-gray-300">{item.name}</span>
                                                  <div className="text-right">
                                                    <div className="font-mono text-white">${currentVal.toLocaleString()}</div>
                                                    {!isNeutral && (
                                                      <div className={`text-[10px] font-bold ${colorClass} flex justify-end space-x-1`}>
                                                        <span>{diff > 0 ? '+' : ''}{diff.toLocaleString()}</span>
                                                        <span>({diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}%)</span>
                                                      </div>
                                                    )}
                                                    {isNeutral && <div className="text-[10px] text-gray-700">-</div>}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-600 italic py-4">
                                      Detailed asset data not available for this record.
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'income' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Income Manager</h2>
                    <p className="text-gray-500 mt-1">Track and manage your income streams.</p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setIsAddingIncome(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-700 text-gray-300">
                      <PlusCircle size={14} /><span>NEW STREAM</span>
                    </button>
                    <button onClick={saveIncomeToHistory} className={`flex items-center space-x-2 px-4 py-2 ${theme.primary} rounded-xl text-xs font-bold ${theme.primaryHover} text-white shadow-lg`}>
                      <span>SAVE MONTH TO HISTORY</span>
                    </button>
                  </div>
                </div>

                <IncomePerformanceChart />

                {isAddingIncome && (
                  <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-700 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-2xl">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Stream Name</label>
                      <input
                        autoFocus
                        type="text"
                        placeholder="e.g. Freelance, Dividends..."
                        className={`w-full bg-transparent border-b border-gray-600 px-0 py-2 outline-none text-white text-lg placeholder-gray-700 focus:${theme.border} transition-colors`}
                        value={newIncomeName}
                        onChange={e => setNewIncomeName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddIncomeStream()}
                      />
                    </div>
                    <div className="flex items-center space-x-4 pt-2 md:pt-0">
                      <button onClick={handleAddIncomeStream} className="px-6 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 shadow-lg">SAVE</button>
                      <button onClick={() => setIsAddingIncome(false)} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800"><Minus size={20} /></button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {incomeStreams.map(stream => (
                    <div key={stream.id} className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 group relative hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-300 font-bold text-lg">{stream.name}</p>
                        <button
                          onClick={() => removeIncomeStream(stream.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800/50">
                          <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Gross (Pre-Tax)</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              value={stream.grossAmount}
                              onChange={(e) => setIncomeStreams(prev => prev.map(s => s.id === stream.id ? { ...s, grossAmount: e.target.value } : s))}
                              className="bg-transparent text-lg font-bold w-full outline-none text-gray-300 font-mono"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-emerald-900/10 p-3 rounded-xl border border-emerald-900/30">
                          <label className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1 block">Net (Post-Tax)</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-600 text-sm">$</span>
                            <input
                              type="number"
                              value={stream.netAmount}
                              onChange={(e) => setIncomeStreams(prev => prev.map(s => s.id === stream.id ? { ...s, netAmount: e.target.value } : s))}
                              className="bg-transparent text-xl font-bold w-full outline-none text-emerald-400 font-mono"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Income History</h3>
                  <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-900/80 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                          <th className="px-6 py-4 w-32">Date</th>
                          <th className="px-6 py-4 text-right">Total Net</th>
                          <th className="px-6 py-4 text-right">Total Gross</th>
                          <th className="px-6 py-4">Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {incomeHistory.map((h, index) => (
                          <React.Fragment key={h.sortKey || h.date}>
                            <tr
                              className={`hover:bg-gray-800/20 group cursor-pointer transition-colors ${expandedIncomeHistoryIndex === index ? 'bg-gray-800/10' : ''}`}
                              onClick={() => toggleIncomeHistoryExpansion(index)}
                            >
                              <td className="px-6 py-4 text-sm font-bold text-gray-300 flex items-center gap-2">
                                {expandedIncomeHistoryIndex === index ? <ChevronUp size={14} className={theme.text} /> : <ChevronDown size={14} className="text-gray-600" />}
                                {h.date}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-mono text-emerald-400 font-bold">
                                ${h.totalNet.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-mono text-gray-400 font-bold">
                                ${h.totalGross.toLocaleString()}
                              </td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                  value={h.comment}
                                  onChange={(e) => updateIncomeHistoryComment(h.sortKey || h.date, e.target.value)}
                                  className="w-full bg-transparent text-sm text-gray-500 italic outline-none resize-y min-h-[40px] border-b border-transparent focus:border-gray-700 transition-colors placeholder-gray-700"
                                  placeholder="Add notes..."
                                />
                              </td>
                            </tr>
                            {expandedIncomeHistoryIndex === index && (
                              <tr className="bg-gray-950/30">
                                <td colSpan={4} className="px-6 py-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6 border-l-2 border-gray-800">
                                    {h.streams.map(s => (
                                      <div key={s.id} className="bg-gray-900/30 p-4 rounded-xl border border-gray-800/50 space-y-2">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="text-sm font-bold text-white">{s.name}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-500">Gross:</span>
                                          <span className="font-mono text-gray-300">${parseFloat(s.grossAmount.toString()).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-emerald-700">Net:</span>
                                          <span className="font-mono text-emerald-500">${parseFloat(s.netAmount.toString()).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {incomeHistory.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No income history saved yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mileage' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Driving Log</h2>
                    <p className="text-gray-500 mt-1">Spreadsheet entry for business mileage.</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input type="file" ref={drivingLogFileInputRef} onChange={handleDrivingLogImport} className="hidden" accept=".csv" />
                    <button onClick={() => drivingLogFileInputRef.current?.click()} className="flex items-center space-x-2 px-6 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-xs font-bold hover:bg-gray-800 text-gray-300 transition-colors shadow-lg">
                      <FileUp size={18} /> <span>IMPORT CSV</span>
                    </button>
                    <button onClick={handleExportDrivingLog} className="flex items-center space-x-2 px-6 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-xs font-bold hover:bg-gray-800 text-gray-300 transition-colors shadow-lg">
                      <Download size={18} /> <span>EXPORT CSV</span>
                    </button>
                    <button onClick={handleAddDrivingLog} className={`flex items-center space-x-2 px-6 py-3 ${theme.primary} rounded-2xl text-white font-bold shadow-lg hover:opacity-90 transition-opacity`}>
                      <Plus size={18} /> <span>ADD ENTRY</span>
                    </button>

                    <div className={`bg-gray-900/30 ${theme.text} px-6 py-3 rounded-2xl border ${theme.border}/30 flex items-center gap-4`}>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Tax Deduction (YTD)</p>
                        <p className="text-2xl font-bold">
                          ${(totalYearlyMileage * (yearlyMileageRates[currentYear.toString()] || 0.67)).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-500">Rate:</span>
                        <input
                          type="number"
                          step="0.001"
                          value={yearlyMileageRates[currentYear.toString()] || 0.67}
                          onChange={(e) => setYearlyMileageRates(prev => ({ ...prev, [currentYear.toString()]: parseFloat(e.target.value) || 0.67 }))}
                          className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm font-mono text-white outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-500">/mi</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-900/80 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                        <th className="px-6 py-4 w-40">Date</th>
                        <th className="px-6 py-4 w-32">Miles</th>
                        <th className="px-6 py-4 w-64">Destination</th>
                        <th className="px-6 py-4">Purpose</th>
                        <th className="px-6 py-4 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {displayedDrivingLog.map(log => (
                        <tr key={log.id} className="hover:bg-blue-900/5 group">
                          <td className="p-0"><input type="date" value={log.date} onChange={(e) => setDrivingLog(prev => prev.map(l => l.id === log.id ? { ...l, date: e.target.value } : l))} className="w-full bg-transparent px-6 py-3 border-none outline-none text-sm h-12 text-white [color-scheme:dark]" /></td>
                          <td className="p-0"><input type="number" placeholder="0.0" value={log.miles} onChange={(e) => setDrivingLog(prev => prev.map(l => l.id === log.id ? { ...l, miles: e.target.value } : l))} className={`w-full bg-transparent px-6 py-3 border-none outline-none text-sm h-12 font-mono ${theme.text} font-bold`} /></td>
                          <td className="p-0"><input type="text" placeholder="Location..." value={log.destination} onChange={(e) => setDrivingLog(prev => prev.map(l => l.id === log.id ? { ...l, destination: e.target.value } : l))} className="w-full bg-transparent px-6 py-3 border-none outline-none text-sm h-12 text-white" /></td>
                          <td className="p-0">
                            <input
                              list="driving-purposes-list"
                              type="text"
                              placeholder="Reason..."
                              value={log.purpose}
                              onChange={(e) => setDrivingLog(prev => prev.map(l => l.id === log.id ? { ...l, purpose: e.target.value } : l))}
                              className="w-full bg-transparent px-6 py-3 border-none outline-none text-sm h-12 text-white"
                            />
                          </td>
                          <td className="p-0 text-center"><button onClick={() => setDrivingLog(drivingLog.filter(l => l.id !== log.id))} className="text-gray-700 hover:text-red-500"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                      {displayedDrivingLog.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500 italic">No entries for {currentYear}.</td></tr>
                      )}
                    </tbody>
                  </table>
                  <datalist id="driving-purposes-list">
                    {drivingPurposes.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex h-[calc(100vh-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#0d0d0d] rounded-3xl border border-gray-800 overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-64 border-r border-gray-800 p-4 space-y-1 bg-gray-900/20">
                  <h2 className="text-xl font-bold text-white px-4 py-4 mb-2">Settings</h2>

                  <button
                    onClick={() => setSettingsActiveSection('Data Management')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm flex justify-between items-center mb-4 ${settingsActiveSection === 'Data Management' ? `bg-blue-900/20 text-blue-400 border border-blue-800/50` : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Archive size={16} />
                      Data Management
                    </div>
                    <ChevronRight size={14} />
                  </button>

                  {['Appearance', 'Dashboard', 'Spending Ledger', 'Asset Watch', 'Income Manager', 'Business Center', 'Driving Log'].map(section => (
                    <button
                      key={section}
                      onClick={() => { setSettingsActiveSection(section); setSettingsSubSection(null); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm flex justify-between items-center ${settingsActiveSection === section ? `${theme.primary}/10 ${theme.text}` : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                    >
                      {section}
                      {settingsActiveSection === section && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">

                  {/* --- DATA MANAGEMENT --- */}
                  {settingsActiveSection === 'Data Management' && (
                    <div className="max-w-2xl space-y-8 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Archive size={20} className="text-blue-500" /> Data Exports</h3>
                        <p className="text-gray-500 text-sm mb-6">Create comprehensive backups of your entire financial profile.</p>

                        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-bold mb-1">Export All Data</h4>
                              <p className="text-gray-500 text-sm max-w-sm">Generates a ZIP file containing detailed CSV reports for Spending, Assets, Income, Business, and Mileage.</p>
                            </div>
                            <button
                              onClick={() => setIsExportAllModalOpen(true)}
                              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-900/20"
                            >
                              <Download size={16} />
                              <span>EXPORT ALL</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- APPEARANCE --- */}
                  {settingsActiveSection === 'Appearance' && (
                    <div className="max-w-2xl space-y-10">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Palette size={20} className="text-gray-400" /> Color Theme</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                          {Object.entries(THEMES).map(([key, t]) => (
                            <button
                              key={key}
                              onClick={() => setCurrentTheme(key as any)}
                              className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${currentTheme === key ? `bg-gray-800 border-gray-600` : 'border-transparent hover:bg-gray-800/50'}`}
                            >
                              <div
                                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform group-hover:scale-110`}
                                style={{ backgroundColor: t.hex }}
                              >
                                {currentTheme === key && <Check size={20} className="text-white" />}
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-wider ${currentTheme === key ? 'text-white' : 'text-gray-500'}`}>{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-10">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Eye size={20} className="text-gray-400" /> Sidebar Visibility</h3>
                        <p className="text-gray-500 text-sm mb-6">Hide tabs you don't use to keep the sidebar clean.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {SIDEBAR_TABS.filter(t => t.id !== 'settings').map(tab => (
                            <div key={tab.id} className="flex items-center justify-between bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <tab.icon size={18} className="text-gray-500" />
                                <span className="text-sm font-bold text-gray-300">{tab.label}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setHiddenTabs(prev =>
                                    prev.includes(tab.id)
                                      ? prev.filter(id => id !== tab.id)
                                      : [...prev, tab.id]
                                  );
                                }}
                                className={`w-12 h-6 rounded-full transition-all relative ${!hiddenTabs.includes(tab.id) ? theme.primary : 'bg-gray-800'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!hiddenTabs.includes(tab.id) ? 'right-1' : 'left-1'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-10">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Type size={20} className="text-gray-400" /> Application Font Size</h3>
                        <div className="flex bg-gray-900 p-1 rounded-xl w-max">
                          {[
                            { id: 'sm', label: 'Small' },
                            { id: 'base', label: 'Default' },
                            { id: 'lg', label: 'Large' }
                          ].map(size => (
                            <button
                              key={size.id}
                              onClick={() => setAppFontSize(size.id as any)}
                              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${appFontSize === size.id ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              {size.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* --- DASHBOARD SETTINGS REDIRECT --- */}
                  {settingsActiveSection === 'Dashboard' && (
                    <div className="max-w-2xl space-y-8 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><LayoutDashboard size={20} className="text-blue-500" /> Dashboard Settings</h3>
                        <p className="text-gray-500 mb-8">Customize your command center layout and components.</p>

                        <div className="space-y-4 max-w-xl">
                          {dashboardOrder.map((widgetId, index) => {
                            const widget = DASHBOARD_WIDGETS.find(w => w.id === widgetId);
                            if (!widget) return null;
                            const isHidden = hiddenDashboardWidgets.includes(widgetId);

                            return (
                              <div key={widgetId} className={`flex items-center justify-between bg-gray-900/30 border border-gray-800 rounded-xl p-4 transition-all ${isHidden ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col gap-1">
                                    <button
                                      disabled={index === 0}
                                      onClick={() => moveDashboardWidget(widgetId, 'up')}
                                      className="text-gray-600 hover:text-white disabled:opacity-30 disabled:hover:text-gray-600"
                                    >
                                      <ChevronUp size={14} />
                                    </button>
                                    <button
                                      disabled={index === dashboardOrder.length - 1}
                                      onClick={() => moveDashboardWidget(widgetId, 'down')}
                                      className="text-gray-600 hover:text-white disabled:opacity-30 disabled:hover:text-gray-600"
                                    >
                                      <ChevronDown size={14} />
                                    </button>
                                  </div>
                                  <div>
                                    <span className="text-sm font-bold text-gray-200">{widget.label}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleDashboardWidgetVisibility(widgetId)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isHidden ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20'}`}
                                >
                                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                  {isHidden ? 'HIDDEN' : 'VISIBLE'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SPENDING LEDGER --- */}
                  {settingsActiveSection === 'Spending Ledger' && !settingsSubSection && (
                    <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-white mb-2">Configuration</h3>
                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('categories')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Receipt size={18} /> Expense Categories</h4>
                          <p className="text-sm text-gray-500 mt-1">{categories.length} categories defined</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>

                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('methods')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Wallet size={18} /> Payment Methods</h4>
                          <p className="text-sm text-gray-500 mt-1">{paymentMethods.length} methods defined</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>

                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('colors')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Palette size={18} /> Category Colors</h4>
                          <p className="text-sm text-gray-500 mt-1">Customize pie chart colors</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>
                    </div>
                  )}

                  {/* --- ASSET WATCH --- */}
                  {settingsActiveSection === 'Asset Watch' && !settingsSubSection && (
                    <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-white mb-2">Configuration</h3>
                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('colors')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Palette size={18} /> Category Colors</h4>
                          <p className="text-sm text-gray-500 mt-1">Customize pie chart colors</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>
                    </div>
                  )}

                  {/* --- BUSINESS CENTER SETTINGS --- */}
                  {settingsActiveSection === 'Business Center' && !settingsSubSection && (
                    <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-white mb-2">Configuration</h3>
                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('categories')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Briefcase size={18} /> Business Categories</h4>
                          <p className="text-sm text-gray-500 mt-1">{businessCategories.length} categories defined</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>

                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('methods')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Wallet size={18} /> Payment Methods</h4>
                          <p className="text-sm text-gray-500 mt-1">{businessPaymentMethods.length} methods defined</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>
                    </div>
                  )}

                  {/* --- SUBSECTIONS: EDITORS --- */}
                  {settingsSubSection && (
                    <div className="animate-in slide-in-from-right-8 duration-300 max-w-3xl">
                      <button
                        onClick={() => setSettingsSubSection(null)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-wider"
                      >
                        <ChevronLeft size={16} />
                        <span>Back to {settingsSubSection === 'purposes' ? 'Driving Settings' : 'Settings'}</span>
                      </button>

                      <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-gray-900/50 p-6 border-b border-gray-800 flex justify-between items-center">
                          <h3 className="text-xl font-bold text-white">
                            {settingsSubSection === 'categories' ? (settingsActiveSection === 'Business Center' ? 'Business Categories' : 'Expense Categories') :
                              settingsSubSection === 'methods' ? (settingsActiveSection === 'Business Center' ? 'Business Payment Methods' : 'Payment Methods') :
                                settingsSubSection === 'colors' ? 'Category Colors' :
                                  'Trip Purposes'}
                          </h3>
                          {settingsSubSection !== 'colors' && (
                            <button
                              onClick={() => {
                                setIsAddingSettingsItem(true);
                                setNewSettingsItemName("");
                              }}
                              className={`${theme.primary} ${theme.primaryHover} text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2`}
                            >
                              <Plus size={14} /> ADD NEW
                            </button>
                          )}
                        </div>
                        <div className="divide-y divide-gray-800 max-h-[60vh] overflow-y-auto">
                          {settingsSubSection === 'colors' && (
                            <div className="p-6 space-y-6">
                              {(
                                settingsActiveSection === 'Asset Watch' ? assetAllocationData.map(d => d.name) :
                                  settingsActiveSection === 'Business Center' ? businessCategories :
                                    categories
                              ).map((catName, i) => (
                                <div key={catName} className="flex flex-col gap-3 group bg-gray-900/20 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-all">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]"
                                        style={{
                                          backgroundColor: customColors[catName] || NEON_PALETTE[i % NEON_PALETTE.length],
                                          color: customColors[catName] || NEON_PALETTE[i % NEON_PALETTE.length]
                                        }}
                                      />
                                      <span className="text-sm font-bold text-gray-200">{catName}</span>
                                    </div>
                                    {customColors[catName] && (
                                      <button
                                        onClick={() => {
                                          const newColors = { ...customColors };
                                          delete newColors[catName];
                                          setCustomColors(newColors);
                                        }}
                                        className="text-[10px] font-bold text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                                      >
                                        Reset
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {NEON_PALETTE.map(color => (
                                      <button
                                        key={color}
                                        onClick={() => setCustomColors(prev => ({ ...prev, [catName]: color }))}
                                        className={`w-7 h-7 rounded-lg border-2 transition-all ${(customColors[catName] || NEON_PALETTE[i % NEON_PALETTE.length]) === color
                                          ? 'border-white scale-110 shadow-[0_0_12px_currentColor]'
                                          : 'border-transparent hover:scale-105 hover:border-gray-600'
                                          }`}
                                        style={{ backgroundColor: color, color: color }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {isAddingSettingsItem && (
                            <div className="p-4 bg-gray-900/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                              <input
                                autoFocus
                                type="text"
                                placeholder={
                                  settingsSubSection === 'categories' ? "New category name..." :
                                    settingsSubSection === 'methods' ? "New payment method..." :
                                      "New driving purpose..."
                                }
                                className={`flex-1 bg-gray-950 border ${theme.border} text-white text-sm rounded-lg px-3 py-2 outline-none`}
                                value={newSettingsItemName}
                                onChange={(e) => setNewSettingsItemName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddSettingsItem();
                                  if (e.key === 'Escape') setIsAddingSettingsItem(false);
                                }}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleAddSettingsItem}
                                  className="px-4 py-2 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-gray-200"
                                >
                                  SAVE
                                </button>
                                <button
                                  onClick={() => setIsAddingSettingsItem(false)}
                                  className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800"
                                >
                                  <Minus size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                          {['categories', 'methods', 'purposes'].includes(settingsSubSection) && (
                            settingsSubSection === 'categories' ? (settingsActiveSection === 'Business Center' ? businessCategories : categories) :
                              settingsSubSection === 'methods' ? (settingsActiveSection === 'Business Center' ? businessPaymentMethods : paymentMethods) :
                                drivingPurposes
                          ).map((item) => (
                            <div key={item} className="p-4 flex items-center justify-between hover:bg-gray-900/30 group">
                              {editingItemOriginalName === item ? (
                                <div className="flex-1 flex items-center gap-3 mr-4">
                                  <input
                                    autoFocus
                                    type="text"
                                    className={`bg-gray-900 border ${theme.border} text-white text-sm rounded-lg px-3 py-2 w-full outline-none`}
                                    value={editingItemNewName}
                                    onChange={(e) => setEditingItemNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (settingsSubSection === 'categories') {
                                          if (settingsActiveSection === 'Business Center') handleUpdateBusinessCategory();
                                          else handleUpdateCategory();
                                        }
                                        else if (settingsSubSection === 'methods') {
                                          if (settingsActiveSection === 'Business Center') handleUpdateBusinessPaymentMethod();
                                          else handleUpdatePaymentMethod();
                                        }
                                        else handleUpdateDrivingPurpose();
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={
                                      settingsSubSection === 'categories' ? (settingsActiveSection === 'Business Center' ? handleUpdateBusinessCategory : handleUpdateCategory) :
                                        settingsSubSection === 'methods' ? (settingsActiveSection === 'Business Center' ? handleUpdateBusinessPaymentMethod : handleUpdatePaymentMethod) :
                                          handleUpdateDrivingPurpose
                                    }
                                    className="text-green-500 hover:text-green-400"
                                  >
                                    <Save size={18} />
                                  </button>
                                  <button onClick={() => { setEditingItemOriginalName(null); setEditingItemNewName(""); }} className="text-gray-500 hover:text-white"><X size={18} /></button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-300 font-medium pl-2">{item}</span>
                              )}

                              {editingItemOriginalName !== item && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => { setEditingItemOriginalName(item); setEditingItemNewName(item); }}
                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete "${item}"?`)) {
                                        if (settingsSubSection === 'categories') {
                                          if (settingsActiveSection === 'Business Center') setBusinessCategories(prev => prev.filter(c => c !== item));
                                          else setCategories(prev => prev.filter(c => c !== item));
                                        }
                                        else if (settingsSubSection === 'methods') {
                                          if (settingsActiveSection === 'Business Center') setBusinessPaymentMethods(prev => prev.filter(m => m !== item));
                                          else setPaymentMethods(prev => prev.filter(m => m !== item));
                                        }
                                        else setDrivingPurposes(prev => prev.filter(p => p !== item));
                                      }
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- OTHER SECTIONS PLACEHOLDERS --- */}
                  {['Income Manager'].includes(settingsActiveSection) && (
                    <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 animate-in fade-in zoom-in-95 duration-500">
                      <Settings size={48} className="mb-4 text-gray-600" />
                      <h3 className="text-xl font-bold text-white">Coming Soon</h3>
                      <p className="text-gray-500 mt-2 max-w-xs">Specific settings for {settingsActiveSection} will be available in a future update.</p>
                    </div>
                  )}

                  {settingsActiveSection === 'Driving Log' && !settingsSubSection && (
                    <div className="max-w-xl animate-in slide-in-from-right-4 duration-300 space-y-8">
                      <div
                        className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                        onClick={() => setSettingsSubSection('purposes')}
                      >
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 group-hover:${theme.text} transition-colors`}><Car size={18} /> Trip Purposes</h4>
                          <p className="text-sm text-gray-500 mt-1">{drivingPurposes.length} standard purposes defined</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* History Comment Modal */}
          {commentModal.isOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <SaveIcon size={20} className={theme.text} /> Save to {commentModal.type === 'asset' ? 'Asset' : 'Income'} History
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Add a comment for {commentModal.displayDate} {commentModal.type === 'income' ? 'income' : ''}.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Optional Comment</label>
                  <textarea
                    autoFocus
                    value={pendingComment}
                    onChange={(e) => setPendingComment(e.target.value)}
                    placeholder="e.g. Major bonus, car repair, quarterly dividends..."
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-white text-sm outline-none focus:border-gray-700 min-h-[100px] transition-colors"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleConfirmSave}
                    className={`flex-1 ${theme.primary} ${theme.primaryHover} text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg`}
                  >
                    SAVE ENTRY
                  </button>
                  <button
                    onClick={() => setCommentModal({ ...commentModal, isOpen: false })}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Global Export Modal */}
          {
            isExportAllModalOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Archive size={20} className="text-blue-500" /> Export All Data
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Download a ZIP file containing individual CSV reports for Spending, Assets, Income, Business, and Mileage.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Select Date Range</label>
                    {[
                      { id: 'lastMonth', label: 'Last Month' },
                      { id: 'last3Months', label: 'Last 3 Months' },
                      { id: 'last6Months', label: 'Last 6 Months' },
                      { id: 'ytd', label: 'Year To Date (YTD)' },
                      { id: 'last2Years', label: 'Last 2 Years' },
                      { id: 'allTime', label: 'All Time' },
                    ].map(opt => (
                      <label key={opt.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${exportAllRange === opt.id ? `bg-blue-900/20 border-blue-500 text-white` : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                        <input
                          type="radio"
                          name="exportAllRange"
                          value={opt.id}
                          checked={exportAllRange === opt.id}
                          onChange={(e) => setExportAllRange(e.target.value)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${exportAllRange === opt.id ? 'border-blue-500' : 'border-gray-600'}`}>
                          {exportAllRange === opt.id && <div className={`w-2 h-2 bg-blue-500 rounded-full`} />}
                        </div>
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button onClick={handleExportAll} className={`flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg`}>
                      GENERATE ZIP
                    </button>
                    <button onClick={() => setIsExportAllModalOpen(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-colors">
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        </main >
      </div>

      {/* Toast Notification */}
      {
        toast && toast.show && (
          <div className="fixed bottom-8 right-8 bg-[#0d0d0d] border border-gray-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
            <div className={`w-10 h-10 rounded-full ${theme.primary} flex items-center justify-center`}>
              <Check size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Success</p>
              <p className="text-gray-400 text-xs">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white"><X size={16} /></button>
          </div>
        )
      }
    </>
  );
};

export default App;