import {
    createContext,
    useContext,
    useState,
    ReactNode,
  } from 'react';
  
  // Define the shape of your context
  type StorageContextType = {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => any;
    removeItem: (key: string) => void;
  };
  
  const StorageContext = createContext<StorageContextType>({
    setItem: () => {},
    getItem: () => undefined,
    removeItem: () => {},
  });
  
  type StorageProviderProps = {
    children: ReactNode;
  };
  
  export const StorageProvider = ({ children }: StorageProviderProps) => {
    const [storage, setStorage] = useState<Record<string, any>>({});
  
    const setItem = (key: string, value: any) => {
      setStorage((prev) => ({ ...prev, [key]: value }));
    };
  
    const getItem = (key: string) => storage[key];
  
    const removeItem = (key: string) => {
      setStorage((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    };
  
    return (
      <StorageContext.Provider value={{ setItem, getItem, removeItem }}>
        {children}
      </StorageContext.Provider>
    );
};
  
export const useStorage = () => useContext(StorageContext);
  
export const useGlobalState = (key:string, defaultValue: any) =>{
    const { setItem, getItem } = useStorage();
    const [stateData, setStateData] = useState(getItem(key) ?? defaultValue);

    return [ stateData, (input:any) => {
      setStateData(input);
      setItem(key, input);
    }]
}

export const useGlobalTrpcState = (key:string, defaultValue: any) =>{
    const [stateData, setStateData] = useGlobalState(key, defaultValue);

    return [ stateData, (trpcData:any) => {
      // return () => {
        if(trpcData !== undefined){
          setStateData(trpcData)
        }
      // }
      // }, [trpcData])
    } ]
}