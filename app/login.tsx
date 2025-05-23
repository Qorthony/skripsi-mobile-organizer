import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from '@/hooks/auth/ctx';
import BackendRequest from '@/services/Request';
import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SignIn() {
    const { session, setUser } = useSession();
    if (session) {
        return <Redirect href="/" />;
    }

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    const login = () => {
        if (!email || email.trim() === '') {
            console.error('Email is required');
            return;
        }
        setLoading(true);
        BackendRequest({
            endpoint: `/login`, // Hapus /api di depan endpoint
            method: 'POST',
            body: {
                email: email,
                as: 'organizer', // tetap kirim as di body sesuai dokumentasi
            },
            onStart: () => {
                console.log('Request started');
            },
            onSuccess: (data) => {
                console.log('Request succeeded', data);
                setUser(data.user);
                router.replace('/verify-otp');
            },
            onError: (error) => {
                console.error('Request failed', error);
                ToastAndroid.show(
                    error?.message || 'Login failed',
                    ToastAndroid.SHORT
                );
            },
            onComplete: () => {
                setLoading(false);
                console.log('Request completed');
            },
        })
    }


  return (
    <SafeAreaView className='flex-1 bg-slate-100'>
        <View className='mx-4 my-8'>
          {/* <Text
            onPress={() => {
              signIn();
              // Navigate after signing in. You may want to tweak this to ensure sign-in is
              // successful before navigating.
              router.replace('/');
            }}>
            Sign In
          </Text> */}
            <Text className='text-2xl font-bold'>
            Selamat Datang
            </Text>
            <Text className='text-lg mb-4'>
                Silahkan login untuk melanjutkan
            </Text>
            <Card>
                <View className='mb-4'>
                    <Text className='text-lg'>
                        Email
                    </Text>
                    <Input
                        variant='underlined'
                        size='lg'
                    >
                        <InputField 
                            placeholder='example@email.com'
                            onChangeText={setEmail}
                            value={email} 
                        />
                    </Input>
                </View>

                <Button onPress={login} disabled={loading}>
                    {loading ? <Spinner /> : <ButtonText>Login</ButtonText>}
                </Button>
            </Card>
        </View>
    </SafeAreaView>
  );
}