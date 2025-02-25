import { View, Text, SafeAreaView, Image, Pressable, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { EVENTS_DATA, TicketTypes } from '@/constants/events-data';
import dayjs from 'dayjs';
import AbsoluteBottomView from '@/components/AbsoluteBottomView';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';

type selectedTicket = {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export default function DetailEvent() {
    const { id } = useLocalSearchParams();
    const EVENTS_DETAIL = EVENTS_DATA.find(event => event.id === Number(id));

    const [activeTab, setActiveTab] = useState('deskripsi');
    const activeTabClassName = 'border-b-2 border-purple-600';

    const [selected, setSelected] = useState<selectedTicket[]>([]);

    useEffect(() => {
        console.log(id);
    }, [id]);



    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='flex-1 bg-white'>
                <Image
                    source={EVENTS_DETAIL?.image}
                    className='w-full h-48 rounded-lg'
                />
                <View className='px-4 py-2'>
                    <Text className='text-xl font-bold'>{EVENTS_DETAIL?.name}</Text>
                    <Text className='text-sm text-gray-600'>{dayjs(EVENTS_DETAIL?.date).format('DD MMMM YYYY')}</Text>
                    {
                        EVENTS_DETAIL?.location === 'online' ?
                            <Text className='text-sm text-gray-600'>{EVENTS_DETAIL?.location}</Text> :
                            <Text className='text-sm text-gray-600'>{EVENTS_DETAIL?.city}</Text>
                    }
                </View>

                <View className='bg-gray-100 d-flex justify-around flex-row'>
                    <Pressable
                        className={`flex-grow py-3 ${activeTab === 'deskripsi' ? activeTabClassName : ''}`}
                        onPress={() => setActiveTab('deskripsi')}
                    >
                        <Text className='text-center'>Deskripsi</Text>
                    </Pressable>
                    <Pressable
                        className={`flex-grow py-3 ${activeTab === 'tiket' ? activeTabClassName : ''}`}
                        onPress={() => setActiveTab('tiket')}
                    >
                        <Text className='text-center'>Tiket</Text>
                    </Pressable>
                </View>
                <View className='flex-1 p-4'>
                    {
                        activeTab === 'deskripsi' ?
                            <Text>{EVENTS_DETAIL?.description}</Text> :
                            <FlatList
                                className='mb-16'
                                showsVerticalScrollIndicator={false}
                                data={EVENTS_DETAIL?.tickets}
                                renderItem={({ item }) => (
                                    <TicketCard
                                        selected={selected}
                                        setSelected={setSelected} 
                                        {...item} 
                                    />
                                )}
                                keyExtractor={item => item.id.toString()}
                            />
                    }
                </View>

                <AbsoluteBottomView>
                    <HStack className='justify-around'>
                        <Button size='md' variant='outline' onPress={() => router.push(`/events/${id}/attendances`)}>
                            <ButtonText>Daftar Kehadiran</ButtonText>
                        </Button>
                        <Button size='md' onPress={() => router.push(`/events/${id}/scan`)}>
                            <ButtonText>Pindai Tiket</ButtonText>
                        </Button>
                    </HStack>
                </AbsoluteBottomView>
            </View>
        </SafeAreaView>
    )
}

interface TicketCardProps {
    id: number;
    type: string;
    price: number;
    description: string;
    selected: selectedTicket[];
    setSelected: (value: any) => void;
}

function TicketCard({
    id, 
    type, 
    price, 
    description,
    selected,
    setSelected
}: TicketCardProps) {
    
    return (
        <View className='bg-slate-200 rounded-lg p-2 my-2'>
            <View>
                <Text className='font-bold'>{type}</Text>
                <Text className='text-sm'>Rp. {price}</Text>
                <Text className='text-sm text-gray-600'>{description}</Text>
            </View>
        </View>
    )
}