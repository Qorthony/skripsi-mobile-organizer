import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import BackendRequest from '@/services/Request';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from '@/hooks/auth/ctx';

export default function GateKeeperAccess() {
  const { signIn, user, setUser } = useSession();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('GateKeeperAccess mounted with id:', id);
  
  useEffect(() => {
    
    if (!id) return;
    setLoading(true);
    setError('');
    BackendRequest({
      endpoint: '/gate-keeper/access',
      method: 'POST',
      body: { kode_akses: id },
      onSuccess: (data) => {
        setLoading(false);
        console.log('Access granted successfully');
        signIn(data.token || null);
        setUser(data.gate_keeper);
        router.replace('/');
        
        // TODO: handle success (misal: redirect, show info, dsb)
      },
      onError: (err) => {
        setLoading(false);
        console.log('GateKeeperAccess request failed:', err);
        
        setError('Akses gagal. Kode akses tidak valid atau sudah digunakan.');
      },
      onComplete: () => {
        console.log('GateKeeperAccess request completed');
      }
    });
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Spinner />
        <Text className="mt-4 text-slate-500">Memproses akses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-center mb-6">{error}</Text>
        <Button onPress={() => router.replace('/login')}>
          <ButtonText>Kembali ke Login</ButtonText>
        </Button>
      </View>
    );
  }

  // TODO: tampilkan konten jika akses berhasil
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-green-600 font-bold text-lg">Akses berhasil!</Text>
    </View>
  );
}
