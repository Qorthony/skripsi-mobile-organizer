// Konversi dari app.json ke app.config.js dengan dukungan variant
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

export default () => {
  let name = 'skripsi-organizer';
  let slug = 'skripsi-organizer';
  let androidPackage = 'com.qorthony.skripsiorganizer';
  let iosBundle = 'com.qorthony.skripsiorganizer';
  let scheme = 'skripsiorganizer';

  if (IS_DEV) {
    name = 'skripsi-organizer Dev';
    androidPackage = 'com.qorthony.skripsiorganizer.dev';
    iosBundle = 'com.qorthony.skripsiorganizer.dev';
    scheme = 'skripsiorganizer';
  } else if (IS_STAGING) {
    name = 'skripsi-organizer (Preview)';
    androidPackage = 'com.qorthony.skripsiorganizer.preview';
    iosBundle = 'com.qorthony.skripsiorganizer.preview';
    scheme = 'skripsiorganizer';
  }

  return {
    name,
    slug,
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: iosBundle,
      infoPlist: {
        NFCReaderUsageDescription: 'Aplikasi ini menggunakan NFC untuk membaca dan memindai tiket event',
        'com.apple.developer.nfc.readersession.formats': ['NDEF'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: androidPackage,
      permissions: ['android.permission.NFC'],
      intentFilters: [
        // Android App Links (HTTPS)
        {
          action: 'VIEW',
          autoVerify: true,
          data: {
            scheme:'https',
            host: 'skripsi.qorthony.my.id',
            pathPrefix: '/link',
          },
          category: ['BROWSABLE', 'DEFAULT'],
        },
        // Standard Deep Links (Custom Scheme)
        {
          action: 'VIEW',
          data: {
            scheme: scheme,
          },
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-secure-store',
      'expo-font',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '93729634-5cc7-4b03-9030-41c84c7e84cb',
      },
    },
    owner: 'qorthony',
  };
};
