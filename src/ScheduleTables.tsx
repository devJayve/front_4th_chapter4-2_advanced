import {Flex} from "@chakra-ui/react";
import {useMemo} from "react";
import {useScheduleListContext} from "./provider/ScheduleListProvider.tsx";
import ScheduleContainer from "./ScheduleContainer.tsx";


export interface SearchInfo {
    tableId: string;
    day?: string;
    time?: number;
}

export const ScheduleTables = () => {
    const { schedulesMap } = useScheduleListContext();

    const disabledRemoveButton = useMemo(() => Object.keys(schedulesMap).length === 1, [schedulesMap]);

    return (
        <Flex w="full" gap={6} p={6} flexWrap="wrap">
            {Object.entries(schedulesMap).map(([tableId], index) => (
                <ScheduleContainer
                    key={`schedule-table-${index}`}
                    tableId={tableId}
                    index={index}
                    disabledRemoveButton={disabledRemoveButton}
                />
            ))}
        </Flex>
    );
}
