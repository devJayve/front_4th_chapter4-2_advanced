import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useState} from "react";
import {useScheduleListContext} from "./ScheduleListProvider.tsx";
import {Schedule} from "../types.ts";

interface ScheduleContextType {
    tableId: string;
    schedules: Schedule[];
    addSchedules: (schedules: Schedule[]) => void;
    removeSchedule: (index: number) => void;
    updateSchedule: (index: number, schedule: Schedule) => void;
    duplicateSchedule: () => void;
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export default function ScheduleProvider({tableId, children}: PropsWithChildren<{ tableId: string }>) {
    const {updateScheduleTable, schedulesMap} = useScheduleListContext();
    const [schedules, setSchedules] = useState(() => schedulesMap[tableId] || []);

    useEffect(() => {
        setSchedules(schedulesMap[tableId] || []);
    }, [schedulesMap, tableId]);

    const updateSchedule = useCallback((index: number, schedule: Schedule) => {
        const newSchedules = [...schedules];
        newSchedules[index] = schedule;
        setSchedules(newSchedules);
    }, [schedules]);

    const removeSchedule = useCallback((index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    }, [schedules]);

    const addSchedules = useCallback((newSchedules: Schedule[]) => {
        setSchedules([...schedules, ...newSchedules]);
    }, [schedules]);

    const duplicateSchedule = useCallback(() => {
        const newTableId = `schedule-${Date.now()}`;
        updateScheduleTable(newTableId, schedules);
    }, [schedules, updateScheduleTable]);

    return (
        <ScheduleContext.Provider value={{
            tableId,
            schedules,
            addSchedules,
            removeSchedule,
            updateSchedule,
            duplicateSchedule,
        }}>
            {children}
        </ScheduleContext.Provider>
    );
}

export const useScheduleContext = () => {
    const context = useContext(ScheduleContext);
    if (context === undefined) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
};
