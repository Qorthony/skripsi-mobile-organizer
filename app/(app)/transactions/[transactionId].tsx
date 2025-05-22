import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BackendRequest from '@/services/Request';
import { useSession } from '@/hooks/auth/ctx';
import { Card } from '@/components/ui/card';
import { rupiahFormat } from '@/helpers/currency';
import { dateIdFormat } from '@/helpers/date';

type TransactionItem = {
    nama: string;
    harga_satuan: number;
    jumlah:number;
    // Tambahkan properti lain sesuai kebutuhan, misal: jumlah, tipe_tiket, dll.
};

type Transaction = {
    transaction_items: TransactionItem[];
    metode_pembayaran: string;
    id: string;
    user: {
        name: string;
        email: string;
    };
    total_harga: number;
    status: string;
    created_at: string;
    waktu_pembayaran?: string; // tambahkan properti ini
};

export default function TransactionDetail() {
  const { transactionId } = useLocalSearchParams();
  const {session} = useSession();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BackendRequest({
        endpoint: `/transactions/${transactionId}`,
        method: 'GET',
        token: session,
        onSuccess: (data) => {
        setTransaction(data.data);
        setLoading(false);
        },
        onError: () => setLoading(false),
    });
  }, [transactionId]);

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-base text-slate-400">Memuat detail transaksi...</Text>
    </View>
  );
  if (!transaction) return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-base text-slate-400">Data tidak ditemukan</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-slate-50">
        <Card className='mb-5'>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">ID</Text>
                <Text className="text-slate-400">{transaction.id}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">Status</Text>
                <Text className={`font-bold ${transaction.status === 'success' ? 'text-green-600' : transaction.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{transaction.status.toUpperCase()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">Total</Text>
                <Text className="text-sky-600 font-bold">Rp{transaction.total_harga?.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">Tanggal</Text>
                <Text className="text-slate-400">{new Date(transaction.created_at).toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">Pemesan</Text>
                <Text className="text-slate-400">{transaction.user?.email}</Text>
            </View>
        </Card>
        
        <Card className='mb-5'>
            <Text className="text-slate-500 text-xs mb-1">Detail Pembayaran</Text>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">Metode Pembayaran</Text>
                <Text className="text-slate-400">{transaction.metode_pembayaran}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-slate-700 text-sm">Waktu Pembayaran</Text>
                <Text className="text-slate-400">{transaction.waktu_pembayaran? dateIdFormat(transaction.waktu_pembayaran, true):"-" }</Text>
            </View>
        </Card>

        <Card>
            <Text className="text-slate-500 text-xs mb-1">Detail Item</Text>
            {/* Tampilkan detail tiket */}
            {
                transaction.transaction_items.map((item, key)=>
                    <View key={key} className='mb-3'>
                        <Text className="text-slate-700 font-semibold text-base">{item.nama}</Text>
                        <Text className="text-slate-400 text-sm">{rupiahFormat(item.harga_satuan) }</Text>
                        <Text className="text-slate-400 text-sm">Jumlah : {item.jumlah}</Text>
                    </View>
                )
            }
        </Card>
    </ScrollView>
  );
}
