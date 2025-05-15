import { View, Text, SafeAreaView, Image, Pressable, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { EVENTS_DATA, TicketTypes } from '@/constants/events-data';
import dayjs from 'dayjs';
import AbsoluteBottomView from '@/components/AbsoluteBottomView';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { useSession } from '@/hooks/auth/ctx';
import BackendRequest from '@/services/Request';
import { Spinner } from '@/components/ui/spinner';

type selectedTicket = {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export default function DetailEvent() {
    const { id } = useLocalSearchParams();
    const { session } = useSession();
    const [eventDetail, setEventDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'deskripsi'|'tiket'>('deskripsi');
    const [refreshing, setRefreshing] = useState(false);

    const fetchEventDetail = () => {
        setRefreshing(true);
        BackendRequest({
            endpoint: `/organizer/events/${id}`,
            method: 'GET',
            token: session,
            onSuccess: (data) => setEventDetail(data.data),
            onComplete: () => setRefreshing(false),
        });
    };

    useEffect(() => {
        setLoading(true);
        BackendRequest({
            endpoint: `/organizer/events/${id}`,
            method: 'GET',
            token: session,
            onSuccess: (data) => setEventDetail(data.data),
            onComplete: () => setLoading(false),
        });
    }, [id, session]);

    if (loading) return <Spinner />;

    const activeTabClassName = 'border-b-2 border-purple-600';

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='flex-1 bg-white'>
                <Image
                    source={eventDetail?.poster_url ? { uri: eventDetail.poster_url } : require('@/assets/images/dummy_poster.png')}
                    className='w-full h-48 rounded-lg'
                />
                <View className='px-4 py-2'>
                    <Text className='text-xl font-bold'>{eventDetail?.nama}</Text>
                    <Text className='text-sm text-gray-600'>{dayjs(eventDetail?.tanggal_mulai).format('DD MMMM YYYY')}</Text>
                    {
                        eventDetail?.lokasi === 'online' ?
                            <Text className='text-sm text-gray-600'>Online</Text> :
                            <Text className='text-sm text-gray-600'>{eventDetail?.kota}</Text>
                    }
                </View>

                <View className='bg-gray-100 d-flex justify-around flex-row'>
                    <Pressable className={`flex-grow py-3 ${tab === 'deskripsi' ? activeTabClassName : ''}`} onPress={() => setTab('deskripsi')}>
                        <Text className='text-center'>Deskripsi</Text>
                    </Pressable>
                    <Pressable className={`flex-grow py-3 ${tab === 'tiket' ? activeTabClassName : ''}`} onPress={() => setTab('tiket')}>
                        <Text className='text-center'>Tiket</Text>
                    </Pressable>
                </View>
                <View className='flex-1 p-4'>
                    {tab === 'deskripsi' && (
                        <Text>{eventDetail?.deskripsi}</Text>
                    )}
                    {tab === 'tiket' && (
                        <FlatList
                            data={eventDetail?.tickets || []}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <View className='bg-slate-200 rounded-lg p-2 my-2'>
                                    <Text className='font-bold'>{item.nama}</Text>
                                    <Text className='text-sm'>Rp. {item.harga}</Text>
                                    <Text className='text-sm text-gray-600'>{item.keterangan ?? '-'}</Text>
                                    <Text className='text-xs text-gray-500'>Kuota: {item.kuota}</Text>
                                    <Text className='text-xs text-gray-500'>Buka: {dayjs(item.waktu_buka).format('DD MMM YYYY HH:mm')}</Text>
                                    <Text className='text-xs text-gray-500'>Tutup: {dayjs(item.waktu_tutup).format('DD MMM YYYY HH:mm')}</Text>
                                </View>
                            )}
                            refreshing={refreshing}
                            onRefresh={fetchEventDetail}
                        />
                    )}
                </View>

                <AbsoluteBottomView>
                    <HStack className='justify-around'>
                        <Button size='md' variant='outline' onPress={() => router.push(`/events/${id}/attendances`)}>
                            <ButtonText>Daftar Peserta</ButtonText>
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