import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from "@chakra-ui/react";
import {Lecture} from "./types.ts";
import {parseSchedule} from "./utils.ts";
import axios from "axios";
import {createCacheFetcher} from "./cache.ts";
import LectureRow from "./LectureRow.tsx";
import {useScheduleContext} from "./provider/ScheduleProvider.tsx";
import SearchOption from "./SearchOptionManager.tsx";
import SearchOptionManager from "./SearchOptionManager.tsx";


interface Props {
    searchInfo: {
        tableId: string;
        day?: string;
        time?: number;
    } | null;
    onClose: () => void;
}

export interface SearchOption {
    query?: string,
    grades: number[],
    days: string[],
    times: number[],
    majors: string[],
    credits?: number,
}

const PAGE_SIZE = 100;

const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');

const cachedFetchMajors = createCacheFetcher(fetchMajors);
const cachedFetchLiberalArts = createCacheFetcher(fetchLiberalArts);

const fetchAllLectures = async () => {
    const promises = [
        cachedFetchMajors().then(result => {
            console.log('API Call 1', performance.now());
            return result;
        }),
        cachedFetchLiberalArts().then(result => {
            console.log('API Call 2', performance.now());
            return result;
        }),
        cachedFetchMajors().then(result => {
            console.log('API Call 3', performance.now());
            return result;
        }),
        cachedFetchLiberalArts().then(result => {
            console.log('API Call 4', performance.now());
            return result;
        }),
        cachedFetchMajors().then(result => {
            console.log('API Call 5', performance.now());
            return result;
        }),
        cachedFetchLiberalArts().then(result => {
            console.log('API Call 6', performance.now());
            return result;
        }),
    ];

    return await Promise.all(promises);
}

const SearchDialog = React.memo(({searchInfo, onClose}: Props) => {
    const {addSchedules} = useScheduleContext();

    const loaderWrapperRef = useRef<HTMLDivElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [page, setPage] = useState(1);
    const [searchOptions, setSearchOptions] = useState<SearchOption>({
        query: '',
        grades: [],
        days: [],
        times: [],
        majors: [],
    });

    const getFilteredLectures = useCallback(() => {
        const {query = '', credits, grades, days, times, majors} = searchOptions;
        return lectures
            .filter(lecture =>
                lecture.title.toLowerCase().includes(query.toLowerCase()) ||
                lecture.id.toLowerCase().includes(query.toLowerCase())
            )
            .filter(lecture => grades.length === 0 || grades.includes(lecture.grade))
            .filter(lecture => majors.length === 0 || majors.includes(lecture.major))
            .filter(lecture => !credits || lecture.credits.startsWith(String(credits)))
            .filter(lecture => {
                if (days.length === 0) {
                    return true;
                }
                const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
                return schedules.some(s => days.includes(s.day));
            })
            .filter(lecture => {
                if (times.length === 0) {
                    return true;
                }
                const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
                return schedules.some(s => s.range.some(time => times.includes(time)));
            });
    }, [lectures, searchOptions]);

    const filteredLectures = useMemo(() => getFilteredLectures(), [getFilteredLectures]);
    const lastPage = useMemo(() => Math.ceil(filteredLectures.length / PAGE_SIZE), [filteredLectures]);
    const visibleLectures = useMemo(() => filteredLectures.slice(0, page * PAGE_SIZE), [filteredLectures, page])
    const allMajors = useMemo(() => [...new Set(lectures.map(lecture => lecture.major))], [lectures])

    const changeSearchOption = useCallback((field: keyof SearchOption, value: SearchOption[typeof field]) => {
        setPage(1);
        setSearchOptions(({...searchOptions, [field]: value}));
        loaderWrapperRef.current?.scrollTo(0, 0);
    }, [searchOptions]);

    const addNewSchedule = useCallback((lecture: Lecture) => {
        if (!searchInfo) return;

        const schedules = parseSchedule(lecture.schedule).map(schedule => ({
            ...schedule,
            lecture
        }));

        addSchedules(schedules);

        onClose();
    }, [addSchedules, onClose, searchInfo]);

    useEffect(() => {
        const start = performance.now();
        console.log('API 호출 시작: ', start)
        fetchAllLectures().then(results => {
            const end = performance.now();
            console.log('모든 API 호출 완료 ', end)
            console.log('API 호출에 걸린 시간(ms): ', end - start)
            setLectures(results.flatMap(result => result.data));
        })
    }, []);

    useEffect(() => {
        const $loader = loaderRef.current;
        const $loaderWrapper = loaderWrapperRef.current;

        if (!$loader || !$loaderWrapper) {
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setPage(prevPage => {
                        const newPage = Math.min(lastPage, prevPage + 1);
                        console.log('New Page:', newPage);
                        return newPage;
                    });
                }
            },
            {threshold: 0, root: $loaderWrapper}
        );

        observer.observe($loader);

        return () => observer.unobserve($loader);
    }, [lastPage, loaderRef.current, loaderWrapperRef.current]);

    useEffect(() => {
        setSearchOptions(prev => ({
            ...prev,
            days: searchInfo?.day ? [searchInfo.day] : [],
            times: searchInfo?.time ? [searchInfo.time] : [],
        }))
        setPage(1);
    }, [searchInfo]);

    return (
        <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
            <ModalOverlay/>
            <ModalContent maxW="90vw" w="1000px">
                <ModalHeader>수업 검색</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <SearchOptionManager allMajors={allMajors} searchOptions={searchOptions}
                                             changeSearchOption={changeSearchOption}/>
                        <Text align="right">
                            검색결과: {filteredLectures.length}개
                        </Text>
                        <Box>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th width="100px">과목코드</Th>
                                        <Th width="50px">학년</Th>
                                        <Th width="200px">과목명</Th>
                                        <Th width="50px">학점</Th>
                                        <Th width="150px">전공</Th>
                                        <Th width="150px">시간</Th>
                                        <Th width="80px"></Th>
                                    </Tr>
                                </Thead>
                            </Table>

                            <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
                                <Table size="sm" variant="striped">
                                    <Tbody>
                                        {visibleLectures.map((lecture, index) => (
                                            <LectureRow key={`${lecture.id}-${index}`} lecture={lecture}
                                                        onAddSchedule={addNewSchedule}/>
                                        ))}
                                    </Tbody>
                                </Table>
                                <Box ref={loaderRef} h="20px"/>
                            </Box>
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});


export default SearchDialog;
