import { CustomDialog, DialogAction } from '@/components/common/CustomDialog';
import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface DialogOptions {
    title: string;
    message: string;
    actions: DialogAction[];
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

interface DialogContextType {
    showDialog: (options: DialogOptions) => void;
    hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
    const [dialog, setDialog] = useState<DialogOptions | null>(null);

    const showDialog = useCallback((options: DialogOptions) => {
        setDialog(options);
    }, []);

    const hideDialog = useCallback(() => {
        setDialog(null);
    }, []);

    return (
        <DialogContext.Provider value={{ showDialog, hideDialog }}>
            {children}
            <CustomDialog
                visible={!!dialog}
                title={dialog?.title || ''}
                message={dialog?.message || ''}
                actions={dialog?.actions || []}
                onClose={hideDialog}
                icon={dialog?.icon}
                iconColor={dialog?.iconColor}
            />
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};
