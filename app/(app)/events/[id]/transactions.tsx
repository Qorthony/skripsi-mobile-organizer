import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import BackendRequest from '@/services/Request';
import { useSession } from '@/hooks/auth/ctx';
import { Card } from '@/components/ui/card';

type Transaction = {
    id: string;
    user: {
        name: string;
        email: string;
    };
    total_harga: number;
    status: string;
    created_at: string;
};

export default function EventTransactions() {
  const { id } = useLocalSearchParams();
    const { session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BackendRequest({
      endpoint: `/organizer/events/${id}/transactions`,
      method: 'GET',
      token:session,
      onSuccess: (data) => {
        setTransactions(data.data.transactions || []);
        setEventName(data.data.event?.nama || '');
        setLoading(false);
      },
      onError: () => setLoading(false),
      onComplete: () => setLoading(false),
    });
  }, [id]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 16, color: '#888' }}>Memuat data transaksi...</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-5 py-4 bg-white border-b border-slate-200">
        <Text className="font-bold text-2xl text-slate-800">Transaksi Event</Text>
        <Text className="text-base text-slate-500 mt-1">{eventName}</Text>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">Belum ada transaksi.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/transactions/${item.id}`)}
            activeOpacity={0.85}
            className="mb-4"
          >
            <Card className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <Text className="text-slate-600 mb-1 text-[15px]">
                {item.user?.name} <Text className="text-slate-400 text-xs">({item.user?.email})</Text>
                </Text>
                <Text className={`text-xs font-bold ${item.status === 'success' ? 'text-green-600' : item.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{item.status.toUpperCase()}</Text>
                <Text className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</Text>
                <View className="flex-row items-center mt-2">
                <Text className="text-sky-600 font-bold text-base">Rp{item.total_harga?.toLocaleString()}</Text>
                </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
