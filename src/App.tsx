import {ChakraProvider} from "@chakra-ui/react";
import {ScheduleListProvider} from "./provider/ScheduleListProvider.tsx";
import {ScheduleTables} from "./ScheduleTables.tsx";

function App() {

    return (
        <ChakraProvider>
            <ScheduleListProvider>
                <ScheduleTables/>
            </ScheduleListProvider>
        </ChakraProvider>
    );
}

export default App;
