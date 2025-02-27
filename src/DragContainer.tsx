import {PropsWithChildren, useCallback, useMemo} from "react";
import {useDndContext} from "@dnd-kit/core";
import {Box} from "@chakra-ui/react";

export default function DragContainer({tableId, children}: PropsWithChildren & {tableId: string}) {
    const dndContext = useDndContext();

    const getActiveTableId = useCallback(() => {
        const activeId = dndContext.active?.id;
        if (activeId) {
            return String(activeId).split(":")[0];
        }
        return null;
    }, [dndContext.active?.id]);

    const activeTableId = useMemo(() => getActiveTableId(), [getActiveTableId]);
    return (
        <Box
            position="relative"
            outline={activeTableId === tableId ? "5px dashed" : undefined}
            outlineColor="blue.300"
        >
            {children}
        </Box>
    );
}
