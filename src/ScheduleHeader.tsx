import {Button, ButtonGroup, Flex, Heading} from "@chakra-ui/react";
import {useScheduleContext} from "./provider/ScheduleProvider.tsx";

interface ScheduleHeaderProps {
    index: number;
    onRemoveScheduleTable: () => void;
    disabledRemoveButton: boolean;
    showSearchDialog: () => void;
}

const ScheduleHeader = ({index, onRemoveScheduleTable, disabledRemoveButton, showSearchDialog}: ScheduleHeaderProps) => {
    const {  duplicateSchedule } = useScheduleContext();

    return (
        <Flex justifyContent="space-between" alignItems="center">
            <Heading as="h3" fontSize="lg">시간표 {index + 1}</Heading>
            <ButtonGroup size="sm" isAttached>
                <Button colorScheme="green" onClick={showSearchDialog}>시간표 추가</Button>
                <Button colorScheme="green" mx="1px"
                        onClick={duplicateSchedule}>복제</Button>
                <Button colorScheme="green" isDisabled={disabledRemoveButton}
                        onClick={onRemoveScheduleTable}>삭제</Button>
            </ButtonGroup>
        </Flex>
    );
}

export default ScheduleHeader;
