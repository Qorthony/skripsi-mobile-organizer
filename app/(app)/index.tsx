import FullWidthEventCard from '@/components/FullWidthEventCard';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/auth/ctx';
import BackendRequest from '@/services/Request';
import { Spinner } from '@/components/ui/spinner';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { signOut, session, user } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = () => {
    BackendRequest({
      endpoint: '/organizer/events',
      method: 'GET',
      token: session,
      onSuccess: (data) => setEvents(data.data || []),
      onError: () => setEvents([]),
      onComplete: () => {
        setLoading(false);
        setRefreshing(false);
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [session]);

  return (
    <View className='flex-1 bg-white'>
      <SafeAreaView className='px-2 mb-16'>
        <View className='py-4 flex-row items-center justify-between'>
          <View className='flex-row items-center'>
            <View className='w-10 h-10 rounded-full bg-slate-300 justify-center items-center mr-2 overflow-hidden'>
              {/* Logo organizer, fallback inisial jika tidak ada logo */}
              {user?.organizer?.logo ? (
                <Image source={{ uri: user.organizer.logo }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <Text className='text-lg font-bold text-slate-700'>
                  {user?.organizer?.nama ? user.organizer.nama.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </Text>
              )}
            </View>
            <Text className='font-bold text-lg'>{user?.organizer?.nama || user?.name || 'Organizer'}</Text>
          </View>
          <Text
            onPress={signOut}
            className='font-bold text-xl text-red-500 ms-auto me-0'
          >
            Logout
          </Text>
        </View>
        <Text className='font-bold text-xl'>
          Events Saya
        </Text>
        {loading ? (
          <Spinner />
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 100 }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={events}
            renderItem={({ item }) => {
              // Mapping data API ke props FullWidthEventCard
              const cardProps = {
                id: item.id,
                name: item.nama,
                description: item.deskripsi,
                date: item.tanggal_mulai,
                image: item.poster_url,
                location: item.lokasi,
                city: item.kota,
                tickets: item.tickets, // jika ada
              };
              return (
                <Pressable onPress={() => router.push(`/events/${item.id}`)}>
                  <FullWidthEventCard {...cardProps} />
                </Pressable>
              );
            }}
            keyExtractor={(item: any) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchEvents();
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}