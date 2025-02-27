import {memo, useCallback, useState} from 'react';
import {Stack} from "@chakra-ui/react";
import DndProvider from "./provider/DndProvider.tsx";
import ScheduleProvider from "./provider/ScheduleProvider.tsx";
import {SearchInfo} from "./ScheduleTables.tsx";
import SearchDialog from "./SearchDialog.tsx";
import ScheduleTable from "./ScheduleTable.tsx";
import ScheduleHeader from "./ScheduleHeader.tsx";

interface ScheduleContainerProps {
    index: number;
    tableId: string;
    disabledRemoveButton: boolean;
}

const ScheduleContainer = memo(({
                                    index,
                                    tableId,
                                    disabledRemoveButton
                                }: ScheduleContainerProps) => {
    const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);

    const handleScheduleTimeClick = useCallback(({tableId, day, time}: SearchInfo) => {
        setSearchInfo({tableId, day, time});
    }, []);

    const handleShowSearchDialog = useCallback(() => {
        setSearchInfo({tableId});
    }, [tableId]);


    return (
        <ScheduleProvider tableId={tableId}>
            <Stack key={tableId} width="600px">
                <ScheduleHeader
                    index={index}
                    disabledRemoveButton={disabledRemoveButton}
                    showSearchDialog={handleShowSearchDialog}
                />
                <DndProvider>
                    <ScheduleTable onScheduleTimeClick={handleScheduleTimeClick}/>
                </DndProvider>
            </Stack>
            {searchInfo && <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)}/>}
        </ScheduleProvider>

    );
});

export default ScheduleContainer;
