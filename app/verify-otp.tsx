import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import { router } from 'expo-router'
import { Card } from '@/components/ui/card'
import { useSession } from '@/hooks/auth/ctx'
import BackendRequest from '@/services/Request'
import { Spinner } from '@/components/ui/spinner'

export default function VerifyOTP() {
    const { signIn, user } = useSession();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const email = user?.email || '';

    const handleVerify = () => {
        if (!otp || otp.trim() === '') {
            console.error('OTP is required');
            return;
        }
        if (!email) {
            console.error('Email is missing');
            return;
        }
        setLoading(true);
        BackendRequest({
            endpoint: '/login/verifyOtp',
            method: 'POST',
            body: {
                email: email,
                otp_code: otp,
            },
            onStart: () => {
                console.log('Verify OTP request started');
            },
            onSuccess: (data) => {
                console.log('OTP verification successful', data);
                signIn(data.token || null);
                router.replace('/');
            },
            onError: (error) => {
                console.error('OTP verification failed', error);
            },
            onComplete: () => {
                setLoading(false);
                console.log('Verify OTP request completed');
            },
        });
    };

    const handleResendOtp = () => {
        if (!email) {
            console.error('Email is missing');
            return;
        }
        setResendLoading(true);
        BackendRequest({
            endpoint: '/login/resendOtp',
            method: 'POST',
            body: {
                email: email,
            },
            onStart: () => {
                console.log('Resend OTP request started');
            },
            onSuccess: (data) => {
                console.log('Resend OTP successful', data);
            },
            onError: (error) => {
                console.error('Resend OTP failed', error);
            },
            onComplete: () => {
                setResendLoading(false);
                console.log('Resend OTP request completed');
            },
        });
    };

  return (
    <SafeAreaView className='flex-1 bg-slate-100'>
        <View className='mx-4 my-8'>
            <Text className='text-2xl font-bold'>
            Verify OTP
            </Text>
            <Text className='text-lg mb-4'>
                Silahkan masukkan OTP yang telah dikirimkan ke email Anda
            </Text>
            <Card>
                <View className='mb-4'>
                    <Text className='text-lg'>
                        OTP
                    </Text>
                    <Input
                        variant='underlined'
                        size='lg'
                    >
                        <InputField placeholder='123456' onChangeText={setOtp} value={otp} />
                    </Input>
                </View>
                <Button onPress={handleVerify} disabled={loading}>
                    {loading ? <Spinner /> : <ButtonText>Verify</ButtonText>}
                </Button>
                <Button variant='link' className='mt-4' onPress={handleResendOtp} disabled={resendLoading}>
                    {resendLoading ? <Spinner /> : <ButtonText>Resend OTP</ButtonText>}
                </Button>
            </Card>
        </View>
    </SafeAreaView>
  )
}