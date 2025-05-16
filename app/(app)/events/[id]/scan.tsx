import React, { useState, useEffect } from 'react';
import { View, Text, Alert, AppState, Platform } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import NfcManager, { NfcTech, Ndef, NfcEvents, TagEvent } from 'react-native-nfc-manager';
import BackendRequest from '@/services/Request';
import { useSession } from '@/hooks/auth/ctx';
import ErrorService from '@/services/ErrorService';
import ScanAnimation from '@/components/ScanAnimation';
import ParticipantInfo from '@/components/ParticipantInfo';

export default function ScanNfcTicket() {
    const { id } = useLocalSearchParams();
    const { session } = useSession();
    const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [eventName, setEventName] = useState<string>('Loading...');
    const [scanStatus, setScanStatus] = useState<'waiting' | 'success' | 'error'>('waiting');
    const [statusMessage, setStatusMessage] = useState<string>('Tempelkan tiket untuk checkin');
    const [lastScannedParticipant, setLastScannedParticipant] = useState<any>(null);
    
    // Fetch event details to display the name
    useEffect(() => {
        BackendRequest({
            endpoint: `/organizer/events/${id}`,
            method: 'GET',
            token: session,
            onSuccess: (data) => {
                if (data.data && data.data.nama) {
                    setEventName(data.data.nama);
                }
            },
            onError: (error) => {
                console.error('Error fetching event details:', error);
            }
        });
    }, [id, session]);    
    
    // Initialize NFC
    useEffect(() => {
        const initNfc = async () => {
            try {
                // Check if device supports NFC
                const supported = await NfcManager.isSupported();
                setIsNfcSupported(supported);
                
                if (supported) {
                    // Start NFC manager
                    await NfcManager.start();
                    startNfcScan();
                } else {
                    Alert.alert('NFC Not Supported', 'This device does not support NFC.');
                }
            } catch (error) {
                console.error('Error initializing NFC:', error);
                Alert.alert('Error', 'Could not initialize NFC. Please try again.');
            }
        };
        
        initNfc();
        
        // Monitor app state to restart scanning when app comes back to foreground
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                startNfcScan();
            }
        });
        
        // Cleanup when component unmounts
        return () => {
            subscription.remove();
            // Clean up NFC resources
            try {
                NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
                NfcManager.unregisterTagEvent();
            } catch (error) {
                console.error('Error cleaning up NFC:', error);
            }
        };
    }, []);


      // Function to start NFC scanning
    const startNfcScan = async () => {
        if (!isNfcSupported) return;
        
        try {
            setIsScanning(true);
            setScanStatus('waiting');
            setStatusMessage('Tempelkan tiket untuk checkin');
            
            // Clean up any existing listeners first
            try {
                NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
                await NfcManager.unregisterTagEvent();
            } catch (err) {
                // Ignore errors during cleanup
            }
            
            // Register for tag discovery
            await NfcManager.registerTagEvent();
            
            // Set up event listener for tag discovery
            NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
                if (tag) {
                    processTag(tag);
                }
            });
        } catch (error) {
            console.error('Error starting NFC scan:', error);
            setIsScanning(false);
            setScanStatus('error');
            setStatusMessage('Error memulai pemindaian. Coba lagi.');
        }
    };    
    
    // Parse ticket code from NFC tag    
    const parseKodeTiket = (tag: TagEvent): string | null => {
        try {
            let kodeTiket = null;
            
            // First, try to read NDEF message
            if (tag.ndefMessage && tag.ndefMessage.length > 0) {
                for (const record of tag.ndefMessage) {
                    // Make sure we handle both string and Uint8Array payloads
                    let payload;
                    if (typeof record.payload === 'string') {
                        payload = record.payload;
                    } else {
                        payload = Ndef.text.decodePayload(Uint8Array.from(record.payload));
                    }
                    
                    // Check if payload contains ticket code (format: "TICKET:123456")
                    if (payload && typeof payload === 'string' && payload.startsWith('TICKET:')) {
                        kodeTiket = payload.substring(7); // Extract code after "TICKET:"
                        break;
                    }
                }
            }
            
            // If we couldn't find NDEF record with ticket code, use tag ID as fallback
            if (!kodeTiket && tag.id) {
                kodeTiket = tag.id;
            }
            
            return kodeTiket;
        } catch (error) {
            console.error('Error parsing ticket code from tag:', error);
            return null;
        }
    };
    
    // Process the scanned tag
    const processTag = async (tag: TagEvent) => {
        try {
            // Trigger light haptic feedback when tag is detected
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            // Extract ticket code from tag
            const kodeTiket = parseKodeTiket(tag);
            
            if (!kodeTiket) {
                // Trigger error haptic feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setScanStatus('error');
                setStatusMessage('Tiket tidak valid');
                setTimeout(startNfcScan, 3000);
                return;
            }
            
            // Call check-in API
            await checkInTicket(kodeTiket);
        } catch (error) {
            // Trigger error haptic feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error('Error processing tag:', error);
            setScanStatus('error');
            setStatusMessage('Gagal membaca tiket');
            setTimeout(startNfcScan, 3000);
        }
    };    
    
    // Call the API to check in the ticket
    const checkInTicket = async (kodeTiket: string) => {
        BackendRequest({
            endpoint: `/organizer/events/${id}/checkin`,
            method: 'POST',
            body: { kode_tiket: kodeTiket },
            token: session,
            onStart: () => {
                setStatusMessage('Memproses tiket...');
                setLastScannedParticipant(null);
            },onSuccess: (data) => {
                // Trigger success haptic feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                
                setScanStatus('success');
                setLastScannedParticipant(data.data?.participant || null);
                setStatusMessage(`Check-in berhasil: ${data.data?.participant?.user?.name || 'Peserta'}`);
                
                // Don't automatically reset after success, let the user scan the next ticket manually
                // This gives them time to see the participant information
            },onError: (error) => {
                setScanStatus('error');
                setLastScannedParticipant(null);
                console.error('Check-in error:', error);
                
                // Parse the error message using our error service
                const errorMessage = ErrorService.parseTicketError(error);
                setStatusMessage(errorMessage);
                
                // Reset after error message
                setTimeout(() => {
                    startNfcScan();
                }, 4000);
            }
        });
    };
    
    // Restart scanning
    const handleRescan = () => {
        startNfcScan();
    };
    
    if (!isNfcSupported) {
        return (
            <SafeAreaView className='flex-1 bg-slate-100'>
                <View className='flex-1 items-center justify-center'>
                    <Text className='text-xl font-bold text-red-500'>NFC tidak didukung</Text>
                    <Text className='text-center mt-2 px-6'>Perangkat ini tidak mendukung NFC yang diperlukan untuk pemindaian tiket.</Text>
                </View>
            </SafeAreaView>
        );
    }
      return (
        <SafeAreaView className='flex-1 bg-slate-100'>
            <View className='flex-1 items-center pt-10'>
                <Text className='text-2xl font-bold'>Memindai Tiket Event</Text>
                <Text className='text-xl font-semibold mb-6'>{eventName}</Text>
                
                <View className='items-center justify-center my-6'>
                    <ScanAnimation status={scanStatus} size={200} />
                </View>
                  <View className='mt-4 items-center'>
                    <Badge action={scanStatus === 'success' ? 'success' : scanStatus === 'error' ? 'error' : 'muted'}>
                        <BadgeText>{scanStatus === 'success' ? 'Berhasil' : scanStatus === 'error' ? 'Gagal' : 'Scanning...'}</BadgeText>
                    </Badge>
                    <Text className={`mt-2 text-center px-6 text-${scanStatus === 'success' ? 'green' : scanStatus === 'error' ? 'red' : 'gray'}-600 font-medium text-lg`}>
                        {statusMessage}
                    </Text>
                </View>
                
                {/* Show participant info when scan is successful */}
                {scanStatus === 'success' && lastScannedParticipant && (
                    <View className='w-full px-4 mt-4'>
                        <ParticipantInfo participant={lastScannedParticipant} visible={true} />
                    </View>
                )}
                
                {scanStatus === 'error' && (
                    <Button className='mt-8' onPress={handleRescan}>
                        <ButtonText>Pindai Ulang</ButtonText>
                    </Button>
                )}
                
                {scanStatus === 'success' && (
                    <Button className='mt-8' variant='outline' onPress={() => startNfcScan()}>
                        <ButtonText>Scan Tiket Berikutnya</ButtonText>
                    </Button>
                )}
            </View>
        </SafeAreaView>
    );
};
