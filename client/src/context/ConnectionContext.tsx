import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConnectionData {
  connectionId: string | null; // Database ID
  intentionText: string;
  guestEmail: string;
  vibeDepth: number;
  vibeHeart: number;
  guestConsented: boolean;
  audioBlob: Blob | null;
  audioDuration: number;
  npsScore: number | null;
  feedbackText: string;
  questionsAsked: string[];
}

interface ConnectionContextType {
  data: ConnectionData;
  updateData: (updates: Partial<ConnectionData>) => void;
  reset: () => void;
}

const defaultData: ConnectionData = {
  connectionId: null,
  intentionText: '',
  guestEmail: '',
  vibeDepth: 0,
  vibeHeart: 0,
  guestConsented: false,
  audioBlob: null,
  audioDuration: 0,
  npsScore: null,
  feedbackText: '',
  questionsAsked: [],
};

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ConnectionData>(defaultData);

  const updateData = (updates: Partial<ConnectionData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const reset = () => {
    setData(defaultData);
  };

  return (
    <ConnectionContext.Provider value={{ data, updateData, reset }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
