import { Toast, ToastProps } from '@/components/common/Toast';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastContextType {
    showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<{
        message: string;
        type: ToastProps['type'];
        duration?: number;
    } | null>(null);

    const showToast = useCallback((message: string, type: ToastProps['type'] = 'success', duration?: number) => {
        setToast({ message, type, duration });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onHide={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
