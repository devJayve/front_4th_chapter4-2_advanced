import { DndContext, Modifier, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {PropsWithChildren, useCallback} from "react";

import {useScheduleContext} from "./ScheduleProvider.tsx";
import {CellSize, DAY_LABELS} from "../constants.ts";


// 드래그되는 항목이 그리드에 맞춰 스냅되도록 하는 modifier 생성
function createSnapModifier(): Modifier {
    return ({ transform, containerNodeRect, draggingNodeRect }) => {
        const containerTop = containerNodeRect?.top ?? 0;
        const containerLeft = containerNodeRect?.left ?? 0;
        const containerBottom = containerNodeRect?.bottom ?? 0;
        const containerRight = containerNodeRect?.right ?? 0;

        const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

        const minX = containerLeft - left + 120 + 1;
        const minY = containerTop - top + 40 + 1;
        const maxX = containerRight - right;
        const maxY = containerBottom - bottom;


        return ({
            ...transform,
            x: Math.min(Math.max(Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH, minX), maxX),
            y: Math.min(Math.max(Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT, minY), maxY),
        })
    };
}

const modifiers = [createSnapModifier()]

export default function DndProvider({ children }: PropsWithChildren) {
    const { schedules, updateSchedule } = useScheduleContext();


    // 드래그 동작 감지
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // 드래그가 끝났을 때 호출
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = useCallback((event: any) => {
        const { active, delta } = event;
        const { x, y } = delta;
        const [index] = active.id;
        const schedule = schedules[index];
        const nowDayIndex = DAY_LABELS.indexOf(schedule.day as typeof DAY_LABELS[number])
        const moveDayIndex = Math.floor(x / 80);
        const moveTimeIndex = Math.floor(y / 30);

        const newSchedule = {
            ...schedule,
            day: DAY_LABELS[nowDayIndex + moveDayIndex],
            range: schedule.range.map(time => time + moveTimeIndex)
        }

        updateSchedule(index, newSchedule);
    }, [schedules, updateSchedule]);

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
            {children}
        </DndContext>
    );
}
