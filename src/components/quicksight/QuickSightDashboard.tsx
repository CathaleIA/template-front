'use client';
import { useEffect, useRef, useState } from 'react';
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk';

const QuickSightDashboard = () => {
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dashboardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch the embed URL
        const fetchEmbedUrl = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching embed URL...');
                
                const response = await fetch('/api/quicksight/generateEmbedUrl');
                
                if (!response.ok) {
                    console.error('API response not OK:', response.status, response.statusText);
                    const errorText = await response.text();
                    console.error('Error text:', errorText);
                    throw new Error(`API responded with status ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Received embed URL data:', data);
                setEmbedUrl(data.embedUrl);
            } catch (error) {
                console.error('Error fetching embed URL:', error);
                setError(error instanceof Error ? error.message : 'Unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchEmbedUrl();
    }, []);

    useEffect(() => {
        // Embed the dashboard when URL is available
        if (embedUrl && dashboardContainerRef.current) {
            const loadDashboard = async () => {
                try {
                    console.log('Embedding dashboard with URL:', embedUrl);
                    // Create embedding context
                    const { createEmbeddingContext } = QuickSightEmbedding;
                    const embeddingContext = await createEmbeddingContext();
                    
                    // Set up frame options
                    if (!dashboardContainerRef.current) {
                        throw new Error('Dashboard container is not available');
                    }

                    const frameOptions = {
                        url: embedUrl,
                        container: dashboardContainerRef.current,
                        height: '600px',
                        width: '100%',
                        resizeHeightOnSizeChangedEvent: true
                    };
                    
                    // Set up content options
                    const contentOptions = {
                        toolbarOptions: {
                            export: true,
                            undoRedo: true,
                            reset: true,
                        },
                        sheetOptions: {
                            singleSheet: false,
                            emitSizeChangedEventOnSheetChange: true,
                        },
                        attributionOptions: {
                            overlayContent: false,
                        },
                    };
                    
                    // Embed the dashboard
                    const dashboard = await embeddingContext.embedDashboard(frameOptions, contentOptions);
                    
                    console.log('Dashboard loaded successfully');
                    
                    // Optional: Add event listeners
                    console.warn('Error handling for the dashboard is not supported directly. Ensure proper error handling at the embedding context level.');
                    
                } catch (err) {
                    console.error('Error embedding dashboard:', err);
                    setError('Failed to load dashboard: ' + (err instanceof Error ? err.message : String(err)));
                }
            };
            
            loadDashboard();
        }
    }, [embedUrl]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-3">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <p className="mt-2">Check browser console for additional details.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Dashboard de Monitoreo
                </h2>
                <div 
                    ref={dashboardContainerRef} 
                    className="overflow-hidden rounded-lg min-h-[600px]"
                ></div>
            </div>
        </div>
    );
};

export default QuickSightDashboard;