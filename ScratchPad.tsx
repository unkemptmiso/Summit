import React, { useState } from 'react';
import { Settings, Link, ExternalLink, Unlink } from 'lucide-react';

interface ScratchPadProps {
    url: string | undefined;
    setUrl: (url: string) => void;
    theme: any;
}

export const ScratchPad: React.FC<ScratchPadProps> = ({ url, setUrl, theme }) => {
    const [inputUrl, setInputUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleConnect = () => {
        if (!inputUrl.trim()) return;

        // Basic validation
        if (!inputUrl.includes("docs.google.com/spreadsheets")) {
            setError("Please enter a valid Google Sheets URL");
            return;
        }

        setUrl(inputUrl);
        setError(null);
    };

    const handleDisconnect = () => {
        if (confirm("Disconnect this sheet?")) {
            setUrl("");
            setInputUrl("");
        }
    };

    const webviewRef = React.useRef<any>(null);

    React.useEffect(() => {
        const webview = webviewRef.current;
        if (!webview || !url) return;

        const handleNewWindow = (e: any) => {
            const protocol = new URL(e.url).protocol;
            if (protocol === 'http:' || protocol === 'https:') {
                webview.loadURL(e.url);
            }
        };

        webview.addEventListener('new-window', handleNewWindow);
        return () => {
            if (webview) {
                webview.removeEventListener('new-window', handleNewWindow);
            }
        };
    }, [url]);

    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-[#0d0d0d] border border-gray-800 p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <Link size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Connect Google Sheets</h2>
                    <p className="text-gray-500 mb-8">
                        Paste the link to your Google Sheet to access it directly within Summit. All changes are saved automatically to Google Drive.
                    </p>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                            value={inputUrl}
                            onChange={e => setInputUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleConnect()}
                        />

                        {error && <p className="text-red-400 text-sm font-bold">{error}</p>}

                        <button
                            onClick={handleConnect}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${theme.primary} hover:opacity-90 transition-opacity`}
                        >
                            CONNECT SHEET
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-500">
                        <Link size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Scratch Pad</h2>
                        <p className="text-xs text-gray-500">Connected to Google Sheets</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <ExternalLink size={12} /> OPEN IN BROWSER
                    </a>
                    <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-red-900 hover:text-red-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <Unlink size={12} /> DISCONNECT
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl relative">
                <webview
                    ref={webviewRef}
                    src={url}
                    className="w-full h-full"
                    // @ts-ignore
                    allowpopups
                    partition="persist:google-sheets"
                    useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                />
            </div>
        </div>
    );
};
