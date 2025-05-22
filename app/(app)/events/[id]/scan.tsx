import React, { useState, useEffect } from 'react';
import { View, Text, Alert, AppState, Platform } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@/components/ui/badge';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import NfcManager, { NfcTech, Ndef, NfcEvents, TagEvent } from 'react-native-nfc-manager';
import BackendRequest from '@/services/Request';
import { useSession } from '@/hooks/auth/ctx';
import ErrorService from '@/services/ErrorService';
import ScanAnimation from '@/components/ScanAnimation';
import ParticipantInfo from '@/components/ParticipantInfo';
import * as IntentLauncher from 'expo-intent-launcher';

export default function ScanNfcTicket() {
    const { id } = useLocalSearchParams();
    const { session } = useSession();
    const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [eventName, setEventName] = useState<string>('Loading...');
    const [scanStatus, setScanStatus] = useState<'waiting' | 'success' | 'error'>('waiting');
    const [statusMessage, setStatusMessage] = useState<string>('Tempelkan tiket untuk checkin');
    const [lastScannedParticipant, setLastScannedParticipant] = useState<any>(null);
    const [nfcNotEnabled, setNfcNotEnabled] = useState(false);
    const [hceResponse, setHceResponse] = useState<string | null>(null);
    
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
                    console.log('Device supports NFC');
                    
                    // Start NFC manager
                    await NfcManager.start();
                    const enabled = await NfcManager.isEnabled();
                    if (!enabled) {
                        console.log('NFC is not enabled');
                        setNfcNotEnabled(true);
                        return;
                    }
                    console.log('NFC is enabled');
                    
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
                // stop the nfc scanning
                // NfcManager.cancelTechnologyRequest();
            } catch (error) {
                console.error('Error cleaning up NFC:', error);
            }
        };
    }, []);


      // Function to start NFC scanning
    const startNfcScan = async () => {
        console.log('Starting NFC scan..., '+eventName+' is not enabled?' +nfcNotEnabled );
        
        if (nfcNotEnabled) return;
        console.log('Device supports NFC, starting scan...');
        
        
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

            // // register for the NFC tag with NDEF in it
            // await NfcManager.requestTechnology(NfcTech.Ndef);
            // // the resolved tag object will contain `ndefMessage` property
            // const tag = await NfcManager.getTag();
            // console.warn('Tag found', tag);
        } catch (error) {
            console.error('Error starting NFC scan:', error);
            // stop the nfc scanning
            // NfcManager.cancelTechnologyRequest();
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
            console.log('message:', tag.ndefMessage);
            
            if (tag.ndefMessage && tag.ndefMessage.length > 0) {
                
                for (const record of tag.ndefMessage) {
                    // Make sure we handle both string and Uint8Array payloads
                    let payload;
                    if (typeof record.payload === 'string') {
                        payload = record.payload;
                    } else {
                        payload = Ndef.text.decodePayload(Uint8Array.from(record.payload));
                    }
                    
                    console.log('Payload:', payload);
                    
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
        console.log('Tag detected:', tag);
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Cek apakah ada NDEF message
            if (tag.ndefMessage && tag.ndefMessage.length > 0) {
                // Mode NDEF (seperti sebelumnya)
                const kodeTiket = parseKodeTiket(tag);
                if (!kodeTiket) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    setScanStatus('error');
                    setStatusMessage('Tiket tidak valid');
                    setTimeout(startNfcScan, 3000);
                    return;
                }
                await checkInTicket(kodeTiket);
            } else if (tag.techTypes && tag.techTypes.includes('android.nfc.tech.IsoDep')) {
                // Mode HCE/IsoDep
                setScanStatus('waiting');
                setStatusMessage('Membaca kartu HCE...');
                try {
                    await NfcManager.requestTechnology(NfcTech.IsoDep);
                    // Contoh APDU SELECT AID (ganti sesuai kebutuhan HCE kamu)
                    const selectAid = [0x00, 0xA4, 0x04, 0x00, 0x07, 0xF0, 0x12, 0x34, 0x56, 0x78, 0x90, 0x00];
                    const response = await NfcManager.transceive(selectAid);
                    const responseHex = Array.isArray(response)
                        ? response.map((b: number) => b.toString(16).padStart(2, '0')).join(' ')
                        : response;
                    setHceResponse(responseHex);
                    setScanStatus('success');
                    setStatusMessage('HCE Response: ' + responseHex);
                } catch (err) {
                    setScanStatus('error');
                    setStatusMessage('Gagal membaca kartu HCE');
                } finally {
                    NfcManager.cancelTechnologyRequest();
                }
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setScanStatus('error');
                setStatusMessage('Tag tidak dikenali (bukan NDEF/HCE)');
                setTimeout(startNfcScan, 3000);
            }
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error('Error processing tag:', error);
            setScanStatus('error');
            setStatusMessage('Gagal membaca tag');
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
    
    // Add function to open NFC settings
    const openNfcSettings = () => {
        if (Platform.OS === 'android') {
            IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.NFC_SETTINGS);
        } else {
            Alert.alert(
                'Info',
                'Silakan buka Pengaturan > NFC secara manual di perangkat Anda.'
            );
        }
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
    
    // Add UI for NFC not enabled
    if (nfcNotEnabled) {
        return (
            <SafeAreaView className='flex-1 bg-slate-100'>
                <View className='flex-1 items-center justify-center'>
                    <Text className='text-xl font-bold text-yellow-600'>NFC belum aktif</Text>
                    <Text className='text-center mt-2 px-6'>Silakan aktifkan NFC di pengaturan perangkat Anda untuk menggunakan fitur ini.</Text>
                    <Button className='mt-8' onPress={openNfcSettings}>
                        <ButtonText>Buka Pengaturan NFC</ButtonText>
                    </Button>
                    <Button className='mt-2' variant='outline' onPress={() => router.back()}>
                        <ButtonText>Kembali</ButtonText>
                    </Button>
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
                    {hceResponse && (
                        <Text className='mt-2 text-xs text-gray-500 break-all'>HCE Response: {hceResponse}</Text>
                    )}
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
