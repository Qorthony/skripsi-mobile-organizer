import React from 'react';
import { View, Text } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@/components/ui/badge';

export default function ScanNfcTicket () {
    
    return (
        <SafeAreaView className='flex-1 bg-slate-100'>
            <View className='flex-1 items-center mt-40'>
                <Text className='text-2xl font-bold'>Memindai Tiket Event</Text>
                <Text className='text-xl font-semibold mb-10'>Nama Event</Text>
                <HStack className='justify-center items-center mt-4'>
                    <View className='w-4 h-4 bg-blue-500 rounded-full animate-bounce mr-2' />
                    <View className='w-4 h-4 bg-blue-500 rounded-full animate-bounce mr-2' style={{ animationDelay: '0.2s' }} />
                    <View className='w-4 h-4 bg-blue-500 rounded-full animate-bounce' style={{ animationDelay: '0.4s' }} />
                </HStack>
                <View className='mt-8 items-center'>
                    <Badge>
                        <BadgeText>Scanning...</BadgeText>
                    </Badge>
                    <Text className=''>Tempelkan tiket untuk checkin</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};
