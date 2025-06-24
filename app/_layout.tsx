import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SessionProvider } from '@/hooks/auth/ctx';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';

export default function Root() {
    const colorScheme = useColorScheme();
    useEffect(() => {
        // Handle initial URL (saat app dibuka dari link)
        const getInitialURL = async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                handleDeepLink(initialUrl);
            }
        };

        // Handle URL changes (saat app sudah terbuka)
        const handleUrlChange = ({ url }: { url: string }) => {
            handleDeepLink(url);
        };

        getInitialURL();
        
        const subscription = Linking.addEventListener('url', handleUrlChange);

        return () => subscription?.remove();
    }, []);

    const handleDeepLink = (url: string) => {
        console.log('Deep link received:', url);
        
        try {
            // Parse URL
            const urlObj = new URL(url);
            
            // Handle custom scheme deep links (skripsi://, skripsidev://, skripsiprev://)
            if (urlObj.protocol === 'skripsiorganizer:') {
                
                const host = urlObj.hostname;
                const path = urlObj.pathname;

                console.log('Parsed host:',  path.split('/'));
                
                // Navigate berdasarkan path
                if (host === 'gatekeeper') {
                    const id = path.split('/')[1];
                    if (id) {
                        router.push(`/gate-keeper-access/${id}`);
                    }
                } else {
                    // Default route
                    router.push('/(app)/');
                }
            }
            
            // Handle HTTPS links (Android App Links)
            else if (urlObj.protocol === 'https:' && 
                     urlObj.hostname === 'skripsi.qorthony.my.id' &&
                     urlObj.pathname.startsWith('/link/')) {
                
                const path = urlObj.pathname.replace('/link', '');
                
                if (path.startsWith('/gatekeepers/')) {
                    const id = path.split('/')[2];
                    if (id) {
                        router.push(`/gate-keeper-access/${id}`);
                    }
                } else {
                    // Default route
                    router.push('/(app)/');
                }
            }        
        } catch (error) {
            console.error('Error parsing deep link:', error);
            // gunakan alert untuk debugging dari native
            Alert.alert(
                'Error',
                'Terjadi kesalahan saat memproses link. Pastikan link valid.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
            // Fallback ke route default jika ada error
            router.push('/(app)/');
        }
    };
    // Set up the auth context and render our layout inside of it.
    return (
        <SessionProvider>
            <GluestackUIProvider mode="light">
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Slot />
                    <StatusBar style="auto" />
                </ThemeProvider>
            </GluestackUIProvider>
        </SessionProvider>
    );
}