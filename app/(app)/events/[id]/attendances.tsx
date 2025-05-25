import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, InputField, InputIcon } from '@/components/ui/input'
import { Icon, SearchIcon } from '@/components/ui/icon'
import { FlatList } from 'react-native'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { Badge, BadgeText } from '@/components/ui/badge'
import { HStack } from '@/components/ui/hstack'
import { useSession } from '@/hooks/auth/ctx'
import BackendRequest from '@/services/Request'
import { useLocalSearchParams } from 'expo-router'

export default function Attendances() {
    const badgeColor: { [key: string]: 'muted' | 'success' | 'error' | 'warning' | 'info' } = {
        'inactive': 'warning',
        'checkin': 'success',
        'active': 'info'
    };
    const { session } = useSession();
    const { id } = useLocalSearchParams();
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [event, setEvent] = useState<any>(null);
    const [stats, setStats] = useState({
        total_peserta: 0,
        total_checkin: 0,
    });

    const fetchParticipants = (searchValue = '') => {
        setRefreshing(true);
        BackendRequest({
            endpoint: `/organizer/events/${id}/participants${searchValue ? `?search=${encodeURIComponent(searchValue)}` : ''}`,
            method: 'GET',
            token: session,
            onSuccess: (data) => {
                setParticipants(data.data?.participants || []);
                setEvent(data.data?.event || null);
                setStats({
                    total_peserta: data.data?.stats?.total_peserta || 0,
                    total_checkin: data.data?.stats?.total_checkin || 0,
                });
            },
            onError: () => {
                setParticipants([]);
                setEvent(null);
            },
            onComplete: () => setRefreshing(false),
        });
    };

    useEffect(() => {
        setLoading(true);
        BackendRequest({
            endpoint: `/organizer/events/${id}/participants`,
            method: 'GET',
            token: session,
            onSuccess: (data) => {
                setParticipants(data.data?.participants || []);
                setEvent(data.data?.event || null);
            },
            onError: () => {
                setParticipants([]);
                setEvent(null);
            },
            onComplete: () => setLoading(false),
        });
    }, [id, session]);

    // Trigger search on input change (debounced)
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (search.trim() !== '') {
                fetchParticipants(search.trim());
            } else {
                fetchParticipants('');
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='mx-4'>
                <Text className='mb-2 text-xl font-semibold'>{event?.nama || 'Nama Event'}</Text>
                <View className='flex-row items-baseline justify-start gap-2 mb-3'>
                    <Text className='text-sm text-gray-500'>Total Peserta: <Text className='text-sky-600 font-bold'>{stats.total_peserta}</Text></Text>
                    <Text className='text-sm text-gray-500'>Total Check-in: <Text className='text-sky-600 font-bold'>{stats.total_checkin}</Text></Text>
                </View>
                <Text className='font-semibold mb-2'>Cari peserta berdasarkan nama atau email.</Text>
                <Input variant='rounded' size='md'>
                    <InputField placeholder='Cari nama/email peserta' value={search} onChangeText={setSearch}/>
                    {/* <InputIcon as={SearchIcon} size='md' className='me-2' /> */}
                </Input>
            </View>
            <Divider className='mt-4' />
            <FlatList
                className='bg-slate-100'
                data={participants}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                refreshing={refreshing}
                onRefresh={() => fetchParticipants(search.trim())}
                ListEmptyComponent={loading ? (
                    <Text className='text-center mt-8'>Memuat data peserta...</Text>
                ) : (
                    <Text className='text-center mt-8'>Tidak ada peserta.</Text>
                )}
                renderItem={({ item }) => (
                    <Card className='my-2 mx-2'>
                        <HStack className='justify-between items-center'>
                            <View>
                                <Text className='text-lg font-medium'>{item.user?.name}</Text>
                                <Text className='text-sm text-gray-500'>{item.user?.email || item.email_penerima}</Text>
                            </View>
                            <Badge action={badgeColor[item.status] || 'muted'}>
                                <BadgeText>{item.status}</BadgeText>
                            </Badge>
                        </HStack>
                    </Card>
                )}
            />
        </SafeAreaView>
    )
}