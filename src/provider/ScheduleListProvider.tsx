import {createContext, PropsWithChildren, useCallback, useContext, useState} from "react";
import {Schedule} from "../types.ts";
import dummyScheduleMap from "../dummyScheduleMap.ts";

interface ScheduleListContextType {
    schedulesMap: Record<string, Schedule[]>;
    duplicateScheduleTable: (tableId: string) => void;
    addScheduleTable: (schedules: Schedule[]) => void;
    removeScheduleTable: (tableId: string) => void;
    updateScheduleTable: (tableId: string, schedules: Schedule[]) => void;
}

export const ScheduleListContext = createContext<ScheduleListContextType | undefined>(undefined);

export const ScheduleListProvider = ({children}: PropsWithChildren) => {
    const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);

    // 스케줄 테이블 추가
    const duplicateScheduleTable = useCallback((tableId: string) => {
        setSchedulesMap(prev => ({
            ...prev,
            [`schedule-${Date.now()}`]: [...prev[tableId]]
        }))
    }, []);

    const addScheduleTable = useCallback((schedules: Schedule[]) => {
        setSchedulesMap(prev => ({
            ...prev,
            [`schedule-${Date.now()}`]: schedules
        }));
    }, []);

    // 스케줄 테이블 삭제
    const removeScheduleTable = useCallback((tableId: string) => {
        setSchedulesMap(prev => {
            delete prev[tableId];
            return {...prev};
        })
    }, []);

    // 특정 스케줄 테이블 업데이트
    const updateScheduleTable = useCallback((tableId: string, schedules: Schedule[]) => {
        setSchedulesMap(prev => ({
            ...prev,
            [tableId]: schedules
        }));
    }, []);

    return (
        <ScheduleListContext.Provider value={{
            schedulesMap,
            addScheduleTable,
            duplicateScheduleTable,
            removeScheduleTable,
            updateScheduleTable,
            // getSchedules,
        }}>
            {children}
        </ScheduleListContext.Provider>
    );
};

export const useScheduleListContext = () => {
    const context = useContext(ScheduleListContext);
    if (context === undefined) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
};
