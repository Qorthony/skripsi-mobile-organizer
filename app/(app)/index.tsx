import FullWidthEventCard from '@/components/FullWidthEventCard';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/auth/ctx';
import BackendRequest from '@/services/Request';
import { Spinner } from '@/components/ui/spinner';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { signOut, session } = useSession();
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
        <View className='py-4'>
          <Text
            onPress={signOut}
            className='font-bold text-xl text-red-500 ms-auto me-0'
          >
            Logout
          </Text>
          <Text className='font-bold text-xl'>
            Events Saya
          </Text>
        </View>
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