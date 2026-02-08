// Jest 글로벌 설정 - Firebase 모듈 Mock

// React Native 모듈 Mock
jest.mock('react-native', () => ({
  Platform: { OS: 'android', select: jest.fn((obj: any) => obj.android) },
  Share: { share: jest.fn(), sharedAction: 'sharedAction' },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
  Alert: { alert: jest.fn() },
  Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
}));

// Firebase Firestore Mock
jest.mock('@react-native-firebase/firestore', () => {
  const mockQuery: any = {
    get: jest.fn(),
    limit: jest.fn((): any => mockQuery),
    orderBy: jest.fn((): any => mockQuery),
    where: jest.fn((): any => mockQuery),
    onSnapshot: jest.fn(),
  };

  const mockCollection: any = jest.fn((): any => ({
    doc: jest.fn((): any => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      collection: jest.fn((): any => mockCollection()),
    })),
    add: jest.fn(),
    where: jest.fn((): any => mockQuery),
    orderBy: jest.fn((): any => mockQuery),
  }));

  const firestoreFn = jest.fn(() => ({
    collection: mockCollection,
    batch: jest.fn(() => ({
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(),
    })),
    runTransaction: jest.fn(),
  }));

  (firestoreFn as any).FieldValue = {
    serverTimestamp: jest.fn(() => 'server_timestamp'),
    increment: jest.fn((n: number) => n),
    arrayUnion: jest.fn((...args: any[]) => args),
    arrayRemove: jest.fn((...args: any[]) => args),
  };

  return {
    __esModule: true,
    default: firestoreFn,
  };
});

// Firebase Auth Mock
jest.mock('@react-native-firebase/auth', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      currentUser: { uid: 'test-user-id', displayName: 'Test User', photoURL: null },
      signInWithCustomToken: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChanged: jest.fn(),
    })),
  };
});

// Firebase Functions Mock
jest.mock('@react-native-firebase/functions', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      httpsCallable: jest.fn(() => jest.fn()),
    })),
  };
});

// Firebase Messaging Mock
jest.mock('@react-native-firebase/messaging', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      requestPermission: jest.fn(),
      getToken: jest.fn(),
      deleteToken: jest.fn(),
      onMessage: jest.fn(),
      onNotificationOpenedApp: jest.fn(),
      getInitialNotification: jest.fn(() => Promise.resolve(null)),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn(),
      setBackgroundMessageHandler: jest.fn(),
      onTokenRefresh: jest.fn(),
    })),
  };
});

// Firebase Storage Mock
jest.mock('@react-native-firebase/storage', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      ref: jest.fn(() => ({
        putFile: jest.fn(),
        getDownloadURL: jest.fn(),
        delete: jest.fn(),
      })),
    })),
  };
});

// Firebase Database Mock
jest.mock('@react-native-firebase/database', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      ref: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        push: jest.fn(),
        child: jest.fn(),
      })),
    })),
  };
});

// expo-notifications Mock
jest.mock('expo-notifications', () => ({
  setNotificationChannelAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
}));

// Kakao Login Mock
jest.mock('@react-native-seoul/kakao-login', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(),
}));

// React Navigation Mock
jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: jest.fn(() => ({
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
  })),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
  })),
}));
