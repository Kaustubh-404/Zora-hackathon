// // // File: src/App.tsx

// // import React, { useState, useEffect } from 'react';
// // import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// // import { PrivyProvider } from '@privy-io/react-auth';
// // import { WagmiProvider } from '@privy-io/wagmi';
// // import { usePrivy } from '@privy-io/react-auth';
// // import { wagmiConfig } from '@/lib/wagmi';
// // import { SUPPORTED_CHAINS } from '@/constants/chains';
// // import { API_CONFIG } from '@/constants/config';
// // import { useUserStore } from '@/store/userStore';

// // // Components
// // import { LandingPage } from '@/components/auth/LandingPage';
// // import { AuthFlow } from '@/components/auth/AuthFlow';
// // import { OnboardingForm } from '@/components/auth/OnboardingForm';
// // import { AppLayout } from '@/components/layout/AppLayout';
// // import { EnhancedHomePage } from '@/components/pages/EnhancedHomePage';

// // // Services
// // import { farcasterService } from '@/services/farcaster/client';

// // // Utils
// // import { mapNeynarToProfile, getUserAvatar, getUserDisplayName } from '@/utils/userHelpers';

// // // Create a client
// // const queryClient = new QueryClient({
// //   defaultOptions: {
// //     queries: {
// //       retry: 2,
// //       staleTime: 1000 * 60 * 5, // 5 minutes
// //     },
// //   },
// // });

// // type AppState = 'landing' | 'auth' | 'onboarding' | 'app';
// // type AppPage = 'home' | 'markets' | 'create' | 'rewards' | 'profile';

// // function AppContent() {
// //   const { authenticated, user, ready } = usePrivy();
// //   const { 
// //     user: userProfile, 
// //     setUser, 
// //     setFarcasterData, 
// //     setOnboardingComplete,
// //     hasLinkedFarcaster 
// //   } = useUserStore();

// //   const [appState, setAppState] = useState<AppState>('landing');
// //   const [currentPage, setCurrentPage] = useState<AppPage>('home');
// //   const [farcasterInterests, setFarcasterInterests] = useState<string[]>([]);
// //   const [isLoadingInterests, setIsLoadingInterests] = useState(false);

// //   // Determine app state based on authentication and onboarding status
// //   useEffect(() => {
// //     if (!ready) return;

// //     if (!authenticated) {
// //       setAppState('landing');
// //     } else if (authenticated && !userProfile?.hasCompletedOnboarding) {
// //       setAppState('onboarding');
// //     } else {
// //       setAppState('app');
// //     }
// //   }, [authenticated, ready, userProfile?.hasCompletedOnboarding]);

// //   // ✅ Fixed: Safe Farcaster data extraction
// //   useEffect(() => {
// //     if (authenticated && user) {
// //       // ✅ Safe extraction - handle null values properly
// //       const safeFarcasterData = user.farcaster ? {
// //         fid: user.farcaster.fid || null,
// //         username: user.farcaster.username || null,
// //         displayName: user.farcaster.displayName || null,
// //         pfp: user.farcaster.pfp || null,
// //       } : null;
      
// //       setUser({
// //         isAuthenticated: true,
// //         walletAddress: user.wallet?.address,
// //         farcaster: safeFarcasterData, // ✅ This now accepts null properly
// //       });

// //       // Fetch detailed Farcaster data if available
// //       if (safeFarcasterData?.fid) {
// //         fetchFarcasterInterests(safeFarcasterData.fid);
// //       }
// //     }
// //   }, [authenticated, user, setUser]);

// //   const fetchFarcasterInterests = async (fid: number) => {
// //     setIsLoadingInterests(true);
// //     try {
// //       const result = await farcasterService.getUserInterests(fid);
      
// //       // Update user store with detailed Farcaster data using helper
// //       setFarcasterData(mapNeynarToProfile(result.user));

// //       // Set interests for onboarding
// //       setFarcasterInterests(result.interests.topics || []);
// //     } catch (error) {
// //       console.error('Failed to fetch Farcaster interests:', error);
// //     } finally {
// //       setIsLoadingInterests(false);
// //     }
// //   };

// //   const handleAuthComplete = (userData: any) => {
// //     setUser(userData);
// //     if (userData.farcaster?.fid) {
// //       fetchFarcasterInterests(userData.farcaster.fid);
// //     }
// //     setAppState('onboarding');
// //   };

// //   const handleOnboardingComplete = (formData: any) => {
// //     setOnboardingComplete({
// //       displayName: formData.displayName,
// //       email: formData.email,
// //       phone: formData.phone,
// //       bio: formData.bio,
// //       interests: formData.interests,
// //       farcasterInterests: farcasterInterests,
// //       notificationPreferences: formData.notificationPreferences,
// //     });
// //     setAppState('app');
// //   };

// //   const handleOnboardingSkip = () => {
// //     setOnboardingComplete({
// //       displayName: user?.farcaster?.displayName || user?.wallet?.address?.slice(0, 8) || 'User',
// //       interests: farcasterInterests.slice(0, 3) || ['crypto', 'web3'],
// //       farcasterInterests: farcasterInterests,
// //       notificationPreferences: {
// //         email: false,
// //         push: true,
// //         predictions: true,
// //       },
// //     });
// //     setAppState('app');
// //   };

// //   const handleGetStarted = () => {
// //     if (authenticated) {
// //       if (userProfile?.hasCompletedOnboarding) {
// //         setAppState('app');
// //       } else {
// //         setAppState('onboarding');
// //       }
// //     } else {
// //       setAppState('auth');
// //     }
// //   };

// //   const handleNavigate = (page: AppPage) => {
// //     setCurrentPage(page);
// //   };

// //   // Loading state
// //   if (!ready) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600 font-medium">Loading ForesightCast...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Landing Page
// //   if (appState === 'landing') {
// //     return <LandingPage onGetStarted={handleGetStarted} />;
// //   }

// //   // Authentication Flow
// //   if (appState === 'auth') {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
// //         <AuthFlow
// //           onComplete={handleAuthComplete}
// //           onSkip={() => setAppState('landing')}
// //         />
// //       </div>
// //     );
// //   }

// //   // Onboarding Flow
// //   if (appState === 'onboarding') {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
// //         {isLoadingInterests ? (
// //           <div className="text-center">
// //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //             <p className="text-gray-600 font-medium">Analyzing your Farcaster activity...</p>
// //             <p className="text-gray-500 text-sm">This helps us personalize your experience</p>
// //           </div>
// //         ) : (
// //           <OnboardingForm
// //             userData={user}
// //             farcasterInterests={farcasterInterests}
// //             onComplete={handleOnboardingComplete}
// //             onSkip={handleOnboardingSkip}
// //           />
// //         )}
// //       </div>
// //     );
// //   }

// //   // Main App
// //   return (
// //     <AppLayout
// //       currentPage={currentPage}
// //       onNavigate={handleNavigate}
// //       userProfile={userProfile}
// //     >
// //       {currentPage === 'home' && <EnhancedHomePage onNavigate={handleNavigate} />}
      
// //       {currentPage === 'markets' && (
// //         <div className="max-w-4xl mx-auto">
// //           <div className="text-center py-20">
// //             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
// //               <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
// //               </svg>
// //             </div>
// //             <h2 className="text-3xl font-bold text-gray-900 mb-4">Markets Browser</h2>
// //             <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
// //               Browse all prediction markets, filter by category, and discover new opportunities. 
// //               This feature will be available in Day 6 of development.
// //             </p>
// //             <div className="flex justify-center space-x-4">
// //               <button
// //                 onClick={() => setCurrentPage('home')}
// //                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
// //               >
// //                 Back to Home
// //               </button>
// //               <button
// //                 onClick={() => setCurrentPage('create')}
// //                 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
// //               >
// //                 Create Market Instead
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
      
// //       {currentPage === 'create' && (
// //         <div className="max-w-4xl mx-auto">
// //           <div className="text-center py-20">
// //             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
// //               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
// //               </svg>
// //             </div>
// //             <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Prediction Market</h2>
// //             <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
// //               Create your own prediction market and let others bet on outcomes you're interested in. 
// //               This feature will include smart contract deployment and is coming in Day 7.
// //             </p>
// //             <div className="flex justify-center space-x-4">
// //               <button
// //                 onClick={() => setCurrentPage('home')}
// //                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
// //               >
// //                 Back to Home
// //               </button>
// //               <button
// //                 onClick={() => setCurrentPage('markets')}
// //                 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
// //               >
// //                 Browse Markets Instead
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
      
// //       {currentPage === 'rewards' && (
// //         <div className="max-w-4xl mx-auto">
// //           <div className="text-center py-20">
// //             <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
// //               <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
// //               </svg>
// //             </div>
// //             <h2 className="text-3xl font-bold text-gray-900 mb-4">Collect Your Rewards</h2>
// //             <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
// //               View your prediction history, claim winnings, and track your performance over time. 
// //               Reward collection and NFT minting features are coming in Day 9.
// //             </p>
// //             <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto mb-8">
// //               <h3 className="font-semibold text-blue-900 mb-2">Coming Soon:</h3>
// //               <ul className="text-blue-800 text-sm space-y-1">
// //                 <li>• Automatic reward calculation</li>
// //                 <li>• One-click claim functionality</li>
// //                 <li>• NFT minting for successful predictions</li>
// //                 <li>• Performance analytics dashboard</li>
// //               </ul>
// //             </div>
// //             <div className="flex justify-center space-x-4">
// //               <button
// //                 onClick={() => setCurrentPage('home')}
// //                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
// //               >
// //                 Back to Home
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
      
// //       {currentPage === 'profile' && (
// //         <div className="max-w-2xl mx-auto">
// //           <div className="bg-white rounded-xl shadow-sm border p-8">
// //             <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            
// //             {/* User Info Display */}
// //             <div className="space-y-6">
// //               <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
// //                 <img
// //                   src={getUserAvatar(user, userProfile)}
// //                   alt={getUserDisplayName(user, userProfile)}
// //                   className="w-16 h-16 rounded-full"
// //                 />
// //                 <div>
// //                   <h3 className="text-lg font-semibold text-gray-900">
// //                     {getUserDisplayName(user, userProfile)}
// //                   </h3>
// //                   {user?.farcaster?.username && (
// //                     <p className="text-gray-600">@{user.farcaster.username}</p>
// //                   )}
// //                   <p className="text-sm text-gray-500">
// //                     {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
// //                   </p>
// //                 </div>
// //               </div>

// //               {/* Farcaster Connection Status */}
// //               <div className="p-4 bg-blue-50 rounded-lg">
// //                 <h4 className="font-medium text-blue-900 mb-2">Farcaster Connection</h4>
// //                 {hasLinkedFarcaster() ? (
// //                   <div className="flex items-center justify-between">
// //                     <div>
// //                       <p className="text-blue-800">✅ Connected</p>
// //                       <p className="text-blue-700 text-sm">FID: {user?.farcaster?.fid}</p>
// //                     </div>
// //                     <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
// //                       Refresh Data
// //                     </button>
// //                   </div>
// //                 ) : (
// //                   <div>
// //                     <p className="text-blue-800 mb-3">Connect Farcaster for personalized predictions</p>
// //                     <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
// //                       Connect Farcaster
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Interests */}
// //               {userProfile?.interests && (
// //                 <div>
// //                   <h4 className="font-medium text-gray-900 mb-3">Your Interests</h4>
// //                   <div className="flex flex-wrap gap-2">
// //                     {userProfile.interests.map((interest) => (
// //                       <span
// //                         key={interest}
// //                         className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
// //                       >
// //                         #{interest}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Notification Preferences */}
// //               {userProfile?.notificationPreferences && (
// //                 <div>
// //                   <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
// //                   <div className="space-y-2 text-sm">
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600">Email notifications:</span>
// //                       <span className={userProfile.notificationPreferences.email ? 'text-green-600' : 'text-gray-400'}>
// //                         {userProfile.notificationPreferences.email ? 'Enabled' : 'Disabled'}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600">Push notifications:</span>
// //                       <span className={userProfile.notificationPreferences.push ? 'text-green-600' : 'text-gray-400'}>
// //                         {userProfile.notificationPreferences.push ? 'Enabled' : 'Disabled'}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600">Prediction reminders:</span>
// //                       <span className={userProfile.notificationPreferences.predictions ? 'text-green-600' : 'text-gray-400'}>
// //                         {userProfile.notificationPreferences.predictions ? 'Enabled' : 'Disabled'}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Account Stats */}
// //               <div className="grid grid-cols-2 gap-4">
// //                 <div className="text-center p-4 bg-gray-50 rounded-lg">
// //                   <div className="text-2xl font-bold text-gray-900">
// //                     {userProfile?.interests?.length || 0}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Interests</div>
// //                 </div>
// //                 <div className="text-center p-4 bg-gray-50 rounded-lg">
// //                   <div className="text-2xl font-bold text-gray-900">
// //                     {userProfile?.hasCompletedOnboarding ? 'Complete' : 'Pending'}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Profile Status</div>
// //                 </div>
// //               </div>

// //               <div className="flex space-x-4">
// //                 <button
// //                   onClick={() => setCurrentPage('home')}
// //                   className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
// //                 >
// //                   Back to Home
// //                 </button>
// //                 <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
// //                   Edit Profile
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </AppLayout>
// //   );
// // }

// // function App() {
// //   return (
// //     <PrivyProvider
// //       appId={API_CONFIG.privy.appId}
// //       config={{
// //         loginMethods: ['email', 'wallet', 'farcaster'],
// //         embeddedWallets: {
// //           createOnLogin: 'users-without-wallets',
// //           requireUserPasswordOnCreate: false,
// //         },
// //         supportedChains: SUPPORTED_CHAINS,
// //         appearance: {
// //           theme: 'light',
// //           accentColor: '#3b82f6',
// //           logo: '/images/logo.png',
// //         },
// //       }}
// //     >
// //       <QueryClientProvider client={queryClient}>
// //         <WagmiProvider config={wagmiConfig}>
// //           <AppContent />
// //         </WagmiProvider>
// //       </QueryClientProvider>
// //     </PrivyProvider>
// //   );
// // }

// // export default App;





// // File: src/App.tsx

// import React, { useState, useEffect } from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { PrivyProvider } from '@privy-io/react-auth';
// import { WagmiProvider } from '@privy-io/wagmi';
// import { usePrivy } from '@privy-io/react-auth';
// import { wagmiConfig } from '@/lib/wagmi';
// import { SUPPORTED_CHAINS } from '@/constants/chains';
// import { API_CONFIG } from '@/constants/config';
// import { useUserStore } from '@/store/userStore';

// // Components
// import { LandingPage } from '@/components/auth/LandingPage';
// import { AuthFlow } from '@/components/auth/AuthFlow';
// import { OnboardingForm } from '@/components/auth/OnboardingForm';
// import { AppLayout } from '@/components/layout/AppLayout';
// import { EnhancedHomePage } from '@/components/pages/EnhancedHomePage';
// import { MarketsPage } from '@/components/pages/MarketsPage';

// // Services
// import { farcasterService } from '@/services/farcaster/client';

// // Utils
// import { mapNeynarToProfile, getUserAvatar, getUserDisplayName } from '@/utils/userHelpers';

// // Create a client
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 2,
//       staleTime: 1000 * 60 * 5, // 5 minutes
//     },
//   },
// });

// type AppState = 'landing' | 'auth' | 'onboarding' | 'app';
// type AppPage = 'home' | 'markets' | 'create' | 'rewards' | 'profile';

// function AppContent() {
//   const { authenticated, user, ready } = usePrivy();
//   const { 
//     user: userProfile, 
//     setUser, 
//     setFarcasterData, 
//     setOnboardingComplete,
//     hasLinkedFarcaster 
//   } = useUserStore();

//   const [appState, setAppState] = useState<AppState>('landing');
//   const [currentPage, setCurrentPage] = useState<AppPage>('home');
//   const [farcasterInterests, setFarcasterInterests] = useState<string[]>([]);
//   const [isLoadingInterests, setIsLoadingInterests] = useState(false);

//   // Determine app state based on authentication and onboarding status
//   useEffect(() => {
//     if (!ready) return;

//     if (!authenticated) {
//       setAppState('landing');
//     } else if (authenticated && !userProfile?.hasCompletedOnboarding) {
//       setAppState('onboarding');
//     } else {
//       setAppState('app');
//     }
//   }, [authenticated, ready, userProfile?.hasCompletedOnboarding]);

//   // ✅ Fixed: Safe Farcaster data extraction
//   useEffect(() => {
//     if (authenticated && user) {
//       // ✅ Safe extraction - handle null values properly
//       const safeFarcasterData = user.farcaster ? {
//         fid: user.farcaster.fid || null,
//         username: user.farcaster.username || null,
//         displayName: user.farcaster.displayName || null,
//         pfp: user.farcaster.pfp || null,
//       } : null;
      
//       setUser({
//         isAuthenticated: true,
//         walletAddress: user.wallet?.address,
//         farcaster: safeFarcasterData, // ✅ This now accepts null properly
//       });

//       // Fetch detailed Farcaster data if available
//       if (safeFarcasterData?.fid) {
//         fetchFarcasterInterests(safeFarcasterData.fid);
//       }
//     }
//   }, [authenticated, user, setUser]);

//   const fetchFarcasterInterests = async (fid: number) => {
//     setIsLoadingInterests(true);
//     try {
//       const result = await farcasterService.getUserInterests(fid);
      
//       // Update user store with detailed Farcaster data using helper
//       setFarcasterData(mapNeynarToProfile(result.user));

//       // Set interests for onboarding
//       setFarcasterInterests(result.interests.topics || []);
//     } catch (error) {
//       console.error('Failed to fetch Farcaster interests:', error);
//     } finally {
//       setIsLoadingInterests(false);
//     }
//   };

//   const handleAuthComplete = (userData: any) => {
//     setUser(userData);
//     if (userData.farcaster?.fid) {
//       fetchFarcasterInterests(userData.farcaster.fid);
//     }
//     setAppState('onboarding');
//   };

//   const handleOnboardingComplete = (formData: any) => {
//     setOnboardingComplete({
//       displayName: formData.displayName,
//       email: formData.email,
//       phone: formData.phone,
//       bio: formData.bio,
//       interests: formData.interests,
//       farcasterInterests: farcasterInterests,
//       notificationPreferences: formData.notificationPreferences,
//     });
//     setAppState('app');
//   };

//   const handleOnboardingSkip = () => {
//     setOnboardingComplete({
//       displayName: user?.farcaster?.displayName || user?.wallet?.address?.slice(0, 8) || 'User',
//       interests: farcasterInterests.slice(0, 3) || ['crypto', 'web3'],
//       farcasterInterests: farcasterInterests,
//       notificationPreferences: {
//         email: false,
//         push: true,
//         predictions: true,
//       },
//     });
//     setAppState('app');
//   };

//   const handleGetStarted = () => {
//     if (authenticated) {
//       if (userProfile?.hasCompletedOnboarding) {
//         setAppState('app');
//       } else {
//         setAppState('onboarding');
//       }
//     } else {
//       setAppState('auth');
//     }
//   };

//   const handleNavigate = (page: AppPage) => {
//     setCurrentPage(page);
//   };

//   // Loading state
//   if (!ready) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading ForesightCast...</p>
//         </div>
//       </div>
//     );
//   }

//   // Landing Page
//   if (appState === 'landing') {
//     return <LandingPage onGetStarted={handleGetStarted} />;
//   }

//   // Authentication Flow
//   if (appState === 'auth') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <AuthFlow
//           onComplete={handleAuthComplete}
//           onSkip={() => setAppState('landing')}
//         />
//       </div>
//     );
//   }

//   // Onboarding Flow
//   if (appState === 'onboarding') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         {isLoadingInterests ? (
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600 font-medium">Analyzing your Farcaster activity...</p>
//             <p className="text-gray-500 text-sm">This helps us personalize your experience</p>
//           </div>
//         ) : (
//           <OnboardingForm
//             userData={user}
//             farcasterInterests={farcasterInterests}
//             onComplete={handleOnboardingComplete}
//             onSkip={handleOnboardingSkip}
//           />
//         )}
//       </div>
//     );
//   }

//   // Main App
//   return (
//     <AppLayout
//       currentPage={currentPage}
//       onNavigate={handleNavigate}
//       userProfile={userProfile}
//     >
//       {currentPage === 'home' && <EnhancedHomePage onNavigate={handleNavigate} />}
      
//       {currentPage === 'markets' && <MarketsPage onNavigate={handleNavigate} />}
      
//       {currentPage === 'create' && (
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center py-20">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Prediction Market</h2>
//             <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
//               Create your own prediction market and let others bet on outcomes you're interested in. 
//               This feature will include smart contract deployment and is coming in Day 7.
//             </p>
//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={() => setCurrentPage('home')}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//               >
//                 Back to Home
//               </button>
//               <button
//                 onClick={() => setCurrentPage('markets')}
//                 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
//               >
//                 Browse Markets Instead
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {currentPage === 'rewards' && (
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center py-20">
//             <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">Collect Your Rewards</h2>
//             <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
//               View your prediction history, claim winnings, and track your performance over time. 
//               Reward collection and NFT minting features are coming in Day 9.
//             </p>
//             <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto mb-8">
//               <h3 className="font-semibold text-blue-900 mb-2">Coming Soon:</h3>
//               <ul className="text-blue-800 text-sm space-y-1">
//                 <li>• Automatic reward calculation</li>
//                 <li>• One-click claim functionality</li>
//                 <li>• NFT minting for successful predictions</li>
//                 <li>• Performance analytics dashboard</li>
//               </ul>
//             </div>
//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={() => setCurrentPage('home')}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//               >
//                 Back to Home
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {currentPage === 'profile' && (
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-white rounded-xl shadow-sm border p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            
//             {/* User Info Display */}
//             <div className="space-y-6">
//               <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
//                 <img
//                   src={getUserAvatar(user, userProfile)}
//                   alt={getUserDisplayName(user, userProfile)}
//                   className="w-16 h-16 rounded-full"
//                 />
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {getUserDisplayName(user, userProfile)}
//                   </h3>
//                   {user?.farcaster?.username && (
//                     <p className="text-gray-600">@{user.farcaster.username}</p>
//                   )}
//                   <p className="text-sm text-gray-500">
//                     {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
//                   </p>
//                 </div>
//               </div>

//               {/* Farcaster Connection Status */}
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <h4 className="font-medium text-blue-900 mb-2">Farcaster Connection</h4>
//                 {hasLinkedFarcaster() ? (
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-blue-800">✅ Connected</p>
//                       <p className="text-blue-700 text-sm">FID: {user?.farcaster?.fid}</p>
//                     </div>
//                     <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                       Refresh Data
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="text-blue-800 mb-3">Connect Farcaster for personalized predictions</p>
//                     <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//                       Connect Farcaster
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Interests */}
//               {userProfile?.interests && (
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Your Interests</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {userProfile.interests.map((interest) => (
//                       <span
//                         key={interest}
//                         className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
//                       >
//                         #{interest}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Notification Preferences */}
//               {userProfile?.notificationPreferences && (
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Email notifications:</span>
//                       <span className={userProfile.notificationPreferences.email ? 'text-green-600' : 'text-gray-400'}>
//                         {userProfile.notificationPreferences.email ? 'Enabled' : 'Disabled'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Push notifications:</span>
//                       <span className={userProfile.notificationPreferences.push ? 'text-green-600' : 'text-gray-400'}>
//                         {userProfile.notificationPreferences.push ? 'Enabled' : 'Disabled'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Prediction reminders:</span>
//                       <span className={userProfile.notificationPreferences.predictions ? 'text-green-600' : 'text-gray-400'}>
//                         {userProfile.notificationPreferences.predictions ? 'Enabled' : 'Disabled'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Account Stats */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-4 bg-gray-50 rounded-lg">
//                   <div className="text-2xl font-bold text-gray-900">
//                     {userProfile?.interests?.length || 0}
//                   </div>
//                   <div className="text-sm text-gray-600">Interests</div>
//                 </div>
//                 <div className="text-center p-4 bg-gray-50 rounded-lg">
//                   <div className="text-2xl font-bold text-gray-900">
//                     {userProfile?.hasCompletedOnboarding ? 'Complete' : 'Pending'}
//                   </div>
//                   <div className="text-sm text-gray-600">Profile Status</div>
//                 </div>
//               </div>

//               <div className="flex space-x-4">
//                 <button
//                   onClick={() => setCurrentPage('home')}
//                   className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
//                 >
//                   Back to Home
//                 </button>
//                 <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
//                   Edit Profile
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </AppLayout>
//   );
// }

// function App() {
//   return (
//     <PrivyProvider
//       appId={API_CONFIG.privy.appId}
//       config={{
//         loginMethods: ['email', 'wallet', 'farcaster'],
//         embeddedWallets: {
//           createOnLogin: 'users-without-wallets',
//           requireUserPasswordOnCreate: false,
//         },
//         supportedChains: SUPPORTED_CHAINS,
//         appearance: {
//           theme: 'light',
//           accentColor: '#3b82f6',
//           logo: '/images/logo.png',
//         },
//       }}
//     >
//       <QueryClientProvider client={queryClient}>
//         <WagmiProvider config={wagmiConfig}>
//           <AppContent />
//         </WagmiProvider>
//       </QueryClientProvider>
//     </PrivyProvider>
//   );
// }

// export default App;








// File: src/App.tsx

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { wagmiConfig } from '@/lib/wagmi';
import { SUPPORTED_CHAINS } from '@/constants/chains';
import { API_CONFIG } from '@/constants/config';
import { useUserStore } from '@/store/userStore';

// Components
import { LandingPage } from '@/components/auth/LandingPage';
import { AuthFlow } from '@/components/auth/AuthFlow';
import { OnboardingForm } from '@/components/auth/OnboardingForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { EnhancedHomePage } from '@/components/pages/EnhancedHomePage';
import { MarketsPage } from '@/components/pages/MarketsPage';
import { CreateMarketPage } from '@/components/pages/CreateMarketPage';

// Services
import { farcasterService } from '@/services/farcaster/client';

// Utils
import { mapNeynarToProfile, getUserAvatar, getUserDisplayName } from '@/utils/userHelpers';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

type AppState = 'landing' | 'auth' | 'onboarding' | 'app';
type AppPage = 'home' | 'markets' | 'create' | 'rewards' | 'profile';

function AppContent() {
  const { authenticated, user, ready } = usePrivy();
  const { 
    user: userProfile, 
    setUser, 
    setFarcasterData, 
    setOnboardingComplete,
    hasLinkedFarcaster 
  } = useUserStore();

  const [appState, setAppState] = useState<AppState>('landing');
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [farcasterInterests, setFarcasterInterests] = useState<string[]>([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);

  // Determine app state based on authentication and onboarding status
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      setAppState('landing');
    } else if (authenticated && !userProfile?.hasCompletedOnboarding) {
      setAppState('onboarding');
    } else {
      setAppState('app');
    }
  }, [authenticated, ready, userProfile?.hasCompletedOnboarding]);

  // ✅ Fixed: Safe Farcaster data extraction
  useEffect(() => {
    if (authenticated && user) {
      // ✅ Safe extraction - handle null values properly
      const safeFarcasterData = user.farcaster ? {
        fid: user.farcaster.fid || null,
        username: user.farcaster.username || null,
        displayName: user.farcaster.displayName || null,
        pfp: user.farcaster.pfp || null,
      } : null;
      
      setUser({
        isAuthenticated: true,
        walletAddress: user.wallet?.address,
        farcaster: safeFarcasterData, // ✅ This now accepts null properly
      });

      // Fetch detailed Farcaster data if available
      if (safeFarcasterData?.fid) {
        fetchFarcasterInterests(safeFarcasterData.fid);
      }
    }
  }, [authenticated, user, setUser]);

  const fetchFarcasterInterests = async (fid: number) => {
    setIsLoadingInterests(true);
    try {
      const result = await farcasterService.getUserInterests(fid);
      
      // Update user store with detailed Farcaster data using helper
      setFarcasterData(mapNeynarToProfile(result.user));

      // Set interests for onboarding
      setFarcasterInterests(result.interests.topics || []);
    } catch (error) {
      console.error('Failed to fetch Farcaster interests:', error);
    } finally {
      setIsLoadingInterests(false);
    }
  };

  const handleAuthComplete = (userData: any) => {
    setUser(userData);
    if (userData.farcaster?.fid) {
      fetchFarcasterInterests(userData.farcaster.fid);
    }
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (formData: any) => {
    setOnboardingComplete({
      displayName: formData.displayName,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      interests: formData.interests,
      farcasterInterests: farcasterInterests,
      notificationPreferences: formData.notificationPreferences,
    });
    setAppState('app');
  };

  const handleOnboardingSkip = () => {
    setOnboardingComplete({
      displayName: user?.farcaster?.displayName || user?.wallet?.address?.slice(0, 8) || 'User',
      interests: farcasterInterests.slice(0, 3) || ['crypto', 'web3'],
      farcasterInterests: farcasterInterests,
      notificationPreferences: {
        email: false,
        push: true,
        predictions: true,
      },
    });
    setAppState('app');
  };

  const handleGetStarted = () => {
    if (authenticated) {
      if (userProfile?.hasCompletedOnboarding) {
        setAppState('app');
      } else {
        setAppState('onboarding');
      }
    } else {
      setAppState('auth');
    }
  };

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
  };

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ForesightCast...</p>
        </div>
      </div>
    );
  }

  // Landing Page
  if (appState === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Authentication Flow
  if (appState === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AuthFlow
          onComplete={handleAuthComplete}
          onSkip={() => setAppState('landing')}
        />
      </div>
    );
  }

  // Onboarding Flow
  if (appState === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {isLoadingInterests ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing your Farcaster activity...</p>
            <p className="text-gray-500 text-sm">This helps us personalize your experience</p>
          </div>
        ) : (
          <OnboardingForm
            userData={user}
            farcasterInterests={farcasterInterests}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </div>
    );
  }

  // Main App
  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      userProfile={userProfile}
    >
      {currentPage === 'home' && <EnhancedHomePage onNavigate={handleNavigate} />}
      
      {currentPage === 'markets' && <MarketsPage onNavigate={handleNavigate} />}
      
      {currentPage === 'create' && <CreateMarketPage onNavigate={handleNavigate} />}
      
      {currentPage === 'rewards' && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Collect Your Rewards</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              View your prediction history, claim winnings, and track your performance over time. 
              Reward collection and NFT minting features are coming in Day 9.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Coming Soon:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Automatic reward calculation</li>
                <li>• One-click claim functionality</li>
                <li>• NFT minting for successful predictions</li>
                <li>• Performance analytics dashboard</li>
              </ul>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
      
      {currentPage === 'profile' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            
            {/* User Info Display */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={getUserAvatar(user, userProfile)}
                  alt={getUserDisplayName(user, userProfile)}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getUserDisplayName(user, userProfile)}
                  </h3>
                  {user?.farcaster?.username && (
                    <p className="text-gray-600">@{user.farcaster.username}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Farcaster Connection Status */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Farcaster Connection</h4>
                {hasLinkedFarcaster() ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-800">✅ Connected</p>
                      <p className="text-blue-700 text-sm">FID: {user?.farcaster?.fid}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-blue-800 mb-3">Connect Farcaster for personalized predictions</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Connect Farcaster
                    </button>
                  </div>
                )}
              </div>

              {/* Interests */}
              {userProfile?.interests && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Your Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification Preferences */}
              {userProfile?.notificationPreferences && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email notifications:</span>
                      <span className={userProfile.notificationPreferences.email ? 'text-green-600' : 'text-gray-400'}>
                        {userProfile.notificationPreferences.email ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Push notifications:</span>
                      <span className={userProfile.notificationPreferences.push ? 'text-green-600' : 'text-gray-400'}>
                        {userProfile.notificationPreferences.push ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prediction reminders:</span>
                      <span className={userProfile.notificationPreferences.predictions ? 'text-green-600' : 'text-gray-400'}>
                        {userProfile.notificationPreferences.predictions ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {userProfile?.interests?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Interests</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {userProfile?.hasCompletedOnboarding ? 'Complete' : 'Pending'}
                  </div>
                  <div className="text-sm text-gray-600">Profile Status</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Back to Home
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <PrivyProvider
      appId={API_CONFIG.privy.appId}
      config={{
        loginMethods: ['email', 'wallet', 'farcaster'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: SUPPORTED_CHAINS,
        appearance: {
          theme: 'light',
          accentColor: '#3b82f6',
          logo: '/images/logo.png',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <AppContent />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;