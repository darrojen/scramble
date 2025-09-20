// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { supabase } from '@/lib/supabaseClient';
// // import { Button } from '@/components/ui/button';
// // import { Skeleton } from '@/components/ui/skeleton';
// // import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// // import { useRouter } from 'next/navigation';
// // import { MessageCircle, Users, X } from 'lucide-react';
// // import { formatDistanceToNow } from 'date-fns';
// // import { toast } from 'sonner';
// // import { Badge } from '@/components/ui/badge';

// // interface Notification {
// //   id: string;
// //   user_id: string;
// //   type: 'connection_request' | 'message' | 'system';
// //   from_user_id: string;
// //   message: string;
// //   status: 'pending' | 'read' | 'accepted' | 'rejected';
// //   created_at: string;
// //   from_user?: {
// //     username: string;
// //     avatar_url?: string;
// //   };
// // }

// // export default function Notifications() {
// //   const [notifications, setNotifications] = useState<Notification[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
// //   const router = useRouter();

// //   // Fetch current user
// //   useEffect(() => {
// //     const fetchCurrentUser = async () => {
// //       const { data: { user }, error } = await supabase.auth.getUser();
// //       if (error) {
// //         console.error('Error fetching user:', error);
// //         toast.error('Failed to fetch user.');
// //         return;
// //       }
// //       setCurrentUserId(user?.id || null);
// //     };
// //     fetchCurrentUser();
// //   }, []);

// //   // Fetch notifications
// //   const fetchNotifications = async () => {
// //     if (!currentUserId) return;
// //     setLoading(true);
// //     const { data, error } = await supabase
// //       .from('notifications')
// //       .select(`
// //         *,
// //         from_user:profiles!from_user_id(username, avatar_url)
// //       `)
// //       .eq('user_id', currentUserId)
// //       .order('created_at', { ascending: false });

// //     if (error) {
// //       console.error('Error fetching notifications:', error);
// //       toast.error('Failed to load notifications.');
// //       setNotifications([]);
// //       setLoading(false);
// //       return;
// //     }

// //     // Filter for relevant notifications
// //     const { data: connections } = await supabase
// //       .from('connections')
// //       .select('from_user_id, to_user_id')
// //       .eq('status', 'accepted')
// //       .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

// //     const connectedUserIds = connections
// //       ? connections.map((conn) =>
// //           conn.from_user_id === currentUserId ? conn.to_user_id : conn.from_user_id
// //         )
// //       : [];

// //     const filteredNotifications = data.filter(
// //       (n) =>
// //         n.type === 'connection_request' ||
// //         (n.type === 'message' && !connectedUserIds.includes(n.from_user_id))
// //     );

// //     setNotifications(filteredNotifications || []);
// //     setLoading(false);
// //   };

// //   // Mark notifications as read
// //   useEffect(() => {
// //     if (!currentUserId || loading || notifications.length === 0) return;

// //     const markNotificationsAsRead = async () => {
// //       const pendingNotifications = notifications.filter((n) => n.status === 'pending');
// //       if (pendingNotifications.length === 0) return;

// //       const { error } = await supabase
// //         .from('notifications')
// //         .update({ status: 'read' })
// //         .eq('user_id', currentUserId)
// //         .eq('status', 'pending');

// //       if (error) {
// //         console.error('Error marking notifications as read:', error);
// //         toast.error('Failed to update notifications.');
// //         return;
// //       }

// //       setNotifications((prev) =>
// //         prev.map((n) => (n.status === 'pending' ? { ...n, status: 'read' } : n))
// //       );
// //     };

// //     markNotificationsAsRead();
// //   }, [currentUserId, notifications, loading]);

// //   // Subscribe to real-time notifications
// //   useEffect(() => {
// //     if (!currentUserId) return;

// //     const channel = supabase
// //       .channel('notifications')
// //       .on(
// //         'postgres_changes',
// //         {
// //           event: 'INSERT',
// //           schema: 'public',
// //           table: 'notifications',
// //           filter: `user_id=eq.${currentUserId}`,
// //         },
// //         () => {
// //           fetchNotifications();
// //         }
// //       )
// //       .subscribe();

// //     fetchNotifications();

// //     return () => {
// //       supabase.removeChannel(channel);
// //     };
// //   }, [currentUserId]);

// //   // Handle connection response
// //   const handleConnectionResponse = async (
// //     notificationId: string,
// //     status: 'accepted' | 'rejected'
// //   ) => {
// //     const notification = notifications.find((n) => n.id === notificationId);
// //     if (!notification) return;

// //     // Update connection status
// //     const { error: connectionError } = await supabase
// //       .from('connections')
// //       .update({ status })
// //       .eq('from_user_id', notification.from_user_id)
// //       .eq('to_user_id', currentUserId);

// //     if (connectionError) {
// //       console.error('Error updating connection:', connectionError);
// //       toast.error('Failed to update connection.');
// //       return;
// //     }

// //     // Delete the notification
// //     const { error: deleteError } = await supabase
// //       .from('notifications')
// //       .delete()
// //       .eq('id', notificationId);

// //     if (deleteError) {
// //       console.error('Error deleting notification:', deleteError);
// //       toast.error('Failed to delete notification.');
// //       return;
// //     }

// //     if (status === 'accepted') {
// //       const { error: notificationError } = await supabase
// //         .from('notifications')
// //         .insert({
// //           user_id: notification.from_user_id,
// //           type: 'connection_request',
// //           from_user_id: currentUserId,
// //           message: `Your connection request was accepted.`,
// //           status: 'read', // Mark as read to show only once
// //         });
// //       if (notificationError) {
// //         console.error('Error sending notification:', notificationError);
// //         toast.error('Failed to send notification.');
// //       } else {
// //         toast.success('Connection accepted!');
// //       }
// //     } else {
// //       toast.success('Connection rejected.');
// //     }

// //     // Update notifications
// //     setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
// //   };

// //   // Handle dismiss notification
// //   const handleDismiss = async (notificationId: string) => {
// //     const { error } = await supabase
// //       .from('notifications')
// //       .delete()
// //       .eq('id', notificationId);

// //     if (error) {
// //       console.error('Error dismissing notification:', error);
// //       toast.error('Failed to dismiss notification.');
// //       return;
// //     }

// //     setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
// //     toast.success('Notification dismissed.');
// //   };

// //   // Calculate badge counts
// //   const connectionRequestCount = notifications.filter(
// //     (n) => n.type === 'connection_request' && n.status === 'pending'
// //   ).length;
// //   const messageNotificationCount = notifications.filter(
// //     (n) => n.type === 'message' && n.status === 'pending'
// //   ).length;

// //   return (
// //     <div className="p-4 min-h-screen bg-gray-50 dark:bg-[#18181b]">
// //       <div className="max-w-2xl mx-auto">
// //         <div className="flex items-center gap-4 mb-6">
// //           <h2 className="text-xl font-bold text-gray-900 dark:text-white">
// //             Notifications
// //           </h2>
// //           {connectionRequestCount > 0 && (
// //             <Badge className="bg-green-500 text-white text-xs">
// //               {connectionRequestCount} Connection{connectionRequestCount > 1 ? 's' : ''}
// //             </Badge>
// //           )}
// //           {messageNotificationCount > 0 && (
// //             <Badge className="bg-blue-500 text-white text-xs">
// //               {messageNotificationCount} Message{messageNotificationCount > 1 ? 's' : ''}
// //             </Badge>
// //           )}
// //         </div>
// //         {loading ? (
// //           <div className="space-y-4">
// //             {[...Array(5)].map((_, idx) => (
// //               <Skeleton key={idx} className="h-16 w-full rounded-lg" />
// //             ))}
// //           </div>
// //         ) : notifications.length === 0 ? (
// //           <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
// //             No notifications yet.
// //           </p>
// //         ) : (
// //           <div className="space-y-4">
// //             {notifications.map((notification) => (
// //               <div
// //                 key={notification.id}
// //                 className="relative flex items-start gap-4 p-4 bg-white dark:bg-black rounded-lg shadow-sm hover:shadow-md transition"
// //               >
// //                 <Avatar className="h-10 w-10">
// //                   <AvatarImage
// //                     src={notification.from_user?.avatar_url || ''}
// //                     alt={notification.from_user?.username}
// //                   />
// //                   <AvatarFallback>
// //                     {notification.from_user?.username?.[0] || 'U'}
// //                   </AvatarFallback>
// //                 </Avatar>
// //                 <div className="flex-1">
// //                   <div className="flex items-center gap-2">
// //                     {notification.type === 'message' ? (
// //                       <MessageCircle className="h-5 w-5 text-blue-500" />
// //                     ) : (
// //                       <Users className="h-5 w-5 text-green-500" />
// //                     )}
// //                     <p className="text-sm font-medium text-gray-900 dark:text-white">
// //                       {notification.message}
// //                     </p>
// //                     {notification.status === 'pending' && (
// //                       <Badge className="bg-gray-200 text-gray-800 text-xs">
// //                         New
// //                       </Badge>
// //                     )}
// //                   </div>
// //                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
// //                     {formatDistanceToNow(new Date(notification.created_at), {
// //                       addSuffix: true,
// //                     })}
// //                   </p>
// //                   {notification.type === 'connection_request' &&
// //                     notification.status === 'pending' && (
// //                       <div className="flex gap-2 mt-3">
// //                         <Button
// //                           size="sm"
// //                           className="bg-green-500 hover:bg-green-600 text-white"
// //                           onClick={() =>
// //                             handleConnectionResponse(notification.id, 'accepted')
// //                           }
// //                         >
// //                           Accept
// //                         </Button>
// //                         <Button
// //                           size="sm"
// //                           variant="outline"
// //                           className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
// //                           onClick={() =>
// //                             handleConnectionResponse(notification.id, 'rejected')
// //                           }
// //                         >
// //                           Reject
// //                         </Button>
// //                       </div>
// //                     )}
// //                   {notification.type === 'message' && (
// //                     <Button
// //                       size="sm"
// //                       variant="outline"
// //                       onClick={() =>
// //                         router.push(`/main/messages?userId=${notification.from_user_id}`)
// //                       }
// //                       className="mt-3 text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
// //                     >
// //                       View Message
// //                     </Button>
// //                   )}
// //                 </div>
// //                 <Button
// //                   size="icon"
// //                   variant="ghost"
// //                   onClick={() => handleDismiss(notification.id)}
// //                   className="ml-auto text-gray-500 hover:text-red-500"
// //                 >
// //                   <X className="h-4 w-4" />
// //                 </Button>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }


// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { useRouter } from 'next/navigation';
// import { MessageCircle, Users, X, Flame, Bell, Award } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { toast } from 'sonner';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';

// interface Notification {
//   id: string;
//   user_id: string;
//   type: 'connection_request' | 'message' | 'system' | 'streak';
//   from_user_id: string | null;
//   message: string;
//   status: 'pending' | 'read' | 'accepted' | 'rejected';
//   created_at: string;
//   from_user?: {
//     username: string;
//     avatar_url?: string;
//   };
// }

// interface Profile {
//   id: string;
//   username: string;
//   user_type: 'student' | 'sponsor';
//   enable_notifications?: boolean;
// }

// interface Streak {
//   current_streak: number;
//   longest_streak: number;
// }

// export default function Notifications() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<Profile | null>(null);
//   const [streak, setStreak] = useState<Streak | null>(null);
//   const [streakLoading, setStreakLoading] = useState(true);
//   const [enableNotifications, setEnableNotifications] = useState<boolean>(false);
//   const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
//   const router = useRouter();
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Initialize audio for notifications
//   useEffect(() => {
//     audioRef.current = new Audio('https://cdn.pixabay.com/audio/2023/03/25/02-53-43-337_200x200.mp3');
//   }, []);

//   // Request notification permission
//   useEffect(() => {
//     if ('Notification' in window) {
//       Notification.requestPermission().then((permission) => {
//         setNotificationPermission(permission);
//       });
//     }
//   }, []);

//   // Fetch current user and profile
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       const { data: { user }, error } = await supabase.auth.getUser();
//       if (error) {
//         console.error('Error fetching user:', error);
//         toast.error('Failed to fetch user.');
//         return;
//       }
//       setCurrentUserId(user?.id || null);

//       if (user?.id) {
//         const { data: profileData, error: profileError } = await supabase
//           .from('profiles')
//           .select('id, username, user_type, enable_notifications')
//           .eq('id', user.id)
//           .maybeSingle();

//         if (profileError || !profileData) {
//           console.error('Profile fetch error:', profileError);
//           toast.error('Failed to load profile.');
//           return;
//         }

//         setCurrentUser(profileData);
//         setEnableNotifications(profileData.enable_notifications || false);
//       }
//     };
//     fetchCurrentUser();
//   }, []);

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     if (!currentUserId) return;
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('notifications')
//       .select(`
//         *,
//         from_user:profiles!from_user_id(username, avatar_url)
//       `)
//       .eq('user_id', currentUserId)
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error fetching notifications:', error);
//       toast.error('Failed to load notifications.');
//       setNotifications([]);
//       setLoading(false);
//       return;
//     }

//     // Filter for relevant notifications
//     const { data: connections } = await supabase
//       .from('connections')
//       .select('from_user_id, to_user_id')
//       .eq('status', 'accepted')
//       .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

//     const connectedUserIds = connections
//       ? connections.map((conn) =>
//           conn.from_user_id === currentUserId ? conn.to_user_id : conn.from_user_id
//         )
//       : [];

//     const filteredNotifications = data.filter(
//       (n) =>
//         n.type === 'connection_request' ||
//         (n.type === 'message' && !connectedUserIds.includes(n.from_user_id))
//     );

//     setNotifications(filteredNotifications || []);
//     setLoading(false);
//   };

//   // Fetch streak for students
//   useEffect(() => {
//     const fetchStreak = async () => {
//       if (!currentUserId || currentUser?.user_type !== 'student') {
//         setStreak({ current_streak: 0, longest_streak: 0 });
//         setStreakLoading(false);
//         return;
//       }
//       setStreakLoading(true);
//       try {
//         const { data, error } = await supabase
//           .from('streaks')
//           .select('current_streak, longest_streak')
//           .eq('user_id', currentUserId)
//           .maybeSingle();

//         if (error || !data) {
//           console.error('Error fetching streak:', error);
//           setStreak({ current_streak: 0, longest_streak: 0 });
//         } else {
//           setStreak({
//             current_streak: data.current_streak || 0,
//             longest_streak: data.longest_streak || 0,
//           });
//         }
//       } catch (err) {
//         console.error('fetchStreak error:', err);
//         setStreak({ current_streak: 0, longest_streak: 0 });
//       } finally {
//         setStreakLoading(false);
//       }
//     };

//     if (currentUserId && currentUser) {
//       fetchStreak();
//     }
//   }, [currentUserId, currentUser]);

//   // Toggle notifications
//   const toggleNotifications = async () => {
//     if (!currentUserId) return;

//     const newValue = !enableNotifications;
//     setEnableNotifications(newValue);

//     const { error } = await supabase
//       .from('profiles')
//       .update({ enable_notifications: newValue })
//       .eq('id', currentUserId);

//     if (error) {
//       console.error('Error updating notification preference:', error.message, error.details, error.hint, error.code);
//       toast.error('Failed to update notification settings.');
//       setEnableNotifications(!newValue); // Revert on error
//       return;
//     }

//     toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'}.`);
//   };

//   // Mark notifications as read and show browser notification
//   useEffect(() => {
//     if (!currentUserId || loading || notifications.length === 0) return;

//     const markNotificationsAsRead = async () => {
//       const pendingNotifications = notifications.filter((n) => n.status === 'pending');
//       if (pendingNotifications.length === 0) return;

//       // Show browser notifications for pending notifications
//       if (enableNotifications && notificationPermission === 'granted' && document.hidden) {
//         pendingNotifications.forEach((notification) => {
//           new Notification('New Notification', {
//             body: notification.message,
//             icon: notification.from_user?.avatar_url || '/favicon.ico',
//           });
//           if (audioRef.current) {
//             audioRef.current.play().catch((err) => console.error('Audio play error:', err.message));
//           }
//         });
//       }

//       const { error } = await supabase
//         .from('notifications')
//         .update({ status: 'read' })
//         .eq('user_id', currentUserId)
//         .eq('status', 'pending');

//       if (error) {
//         console.error('Error marking notifications as read:', error.message, error.details, error.hint, error.code);
//         toast.error('Failed to update notifications.');
//         return;
//       }

//       setNotifications((prev) =>
//         prev.map((n) => (n.status === 'pending' ? { ...n, status: 'read' } : n))
//       );
//     };

//     markNotificationsAsRead();
//   }, [currentUserId, notifications, loading, enableNotifications, notificationPermission]);

//   // Subscribe to real-time notifications
//   useEffect(() => {
//     if (!currentUserId) return;

//     const channel = supabase
//       .channel('notifications')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'notifications',
//           filter: `user_id=eq.${currentUserId}`,
//         },
//         () => {
//           fetchNotifications();
//         }
//       )
//       .subscribe((status, err) => {
//         if (status === 'SUBSCRIBED') {
//           console.log('Subscribed to notifications channel');
//         } else if (err) {
//           console.error('Subscription error:', err.message);
//         }
//       });

//     fetchNotifications();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [currentUserId]);

//   // Handle connection response
//   const handleConnectionResponse = async (
//     notificationId: string,
//     status: 'accepted' | 'rejected'
//   ) => {
//     const notification = notifications.find((n) => n.id === notificationId);
//     if (!notification || !currentUser) return;

//     // Update connection status
//     const { error: connectionError } = await supabase
//       .from('connections')
//       .update({ status })
//       .eq('from_user_id', notification.from_user_id)
//       .eq('to_user_id', currentUserId);

//     if (connectionError) {
//       console.error('Error updating connection:', connectionError.message, connectionError.details, connectionError.hint, connectionError.code);
//       toast.error('Failed to update connection.');
//       return;
//     }

//     // Delete the notification
//     const { error: deleteError } = await supabase
//       .from('notifications')
//       .delete()
//       .eq('id', notificationId);

//     if (deleteError) {
//       console.error('Error deleting notification:', deleteError.message, deleteError.details, deleteError.hint, deleteError.code);
//       toast.error('Failed to delete notification.');
//       return;
//     }

//     if (status === 'accepted') {
//       const { data: fromUser, error: fromUserError } = await supabase
//         .from('profiles')
//         .select('username')
//         .eq('id', notification.from_user_id)
//         .maybeSingle();

//       if (fromUserError || !fromUser) {
//         console.error('Error fetching from user:', fromUserError?.message, fromUserError?.details, fromUserError?.hint, fromUserError?.code);
//         toast.error('Failed to fetch sender information.');
//         return;
//       }

//       const { error: notificationError } = await supabase
//         .from('notifications')
//         .insert({
//           user_id: notification.from_user_id,
//           type: 'connection_request',
//           from_user_id: currentUserId,
//           message: `Connection request from ${fromUser.username} accepted by ${currentUser.username}.`,
//           status: 'read',
//         });
//       if (notificationError) {
//         console.error('Error sending notification:', notificationError.message, notificationError.details, notificationError.hint, notificationError.code);
//         toast.error('Failed to send notification.');
//       } else {
//         toast.success('Connection accepted!');
//       }
//     } else {
//       toast.success('Connection rejected.');
//     }

//     // Update notifications
//     setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
//   };

//   // Handle dismiss notification
//   const handleDismiss = async (notificationId: string) => {
//     const { error } = await supabase
//       .from('notifications')
//       .delete()
//       .eq('id', notificationId);

//     if (error) {
//       console.error('Error dismissing notification:', error.message, error.details, error.hint, error.code);
//       toast.error('Failed to dismiss notification.');
//       return;
//     }

//     setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
//     toast.success('Notification dismissed.');
//   };

//   // Calculate badge counts
//   const connectionRequestCount = notifications.filter(
//     (n) => n.type === 'connection_request' && n.status === 'pending'
//   ).length;
//   const messageNotificationCount = notifications.filter(
//     (n) => n.type === 'message' && n.status === 'pending'
//   ).length;

//   return (
//     <div className="p-4 min-h-screen bg-gray-50 dark:bg-[#18181b]">
//       <div className="max-w-2xl mx-auto">
//         <div className="flex flex-wrap items-center gap-4 mb-6">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//             Notifications
//           </h2>
//           {currentUser?.user_type === 'student' && (
//             <Badge className="bg-orange-500 text-white text-xs flex items-center">
//               <Flame className="w-4 h-4 mr-1" />
//               {streakLoading ? (
//                 <span className="inline-block w-12 h-4 bg-gray-400 animate-pulse rounded" />
//               ) : (
//                 <>
//                   {streak?.current_streak || 0} day{streak?.current_streak !== 1 ? 's' : ''}
//                   {streak?.current_streak && streak.current_streak > 5 ? ' 🔥' : ''}
//                 </>
//               )}
//             </Badge>
//           )}
//           {connectionRequestCount > 0 && (
//             <Badge className="bg-green-500 text-white text-xs">
//               {connectionRequestCount} Connection{connectionRequestCount > 1 ? 's' : ''}
//             </Badge>
//           )}
//           {messageNotificationCount > 0 && (
//             <Badge className="bg-blue-500 text-white text-xs">
//               {messageNotificationCount} Message{messageNotificationCount > 1 ? 's' : ''}
//             </Badge>
//           )}
//           <div className="flex items-center gap-2">
//             <Switch
//               checked={enableNotifications}
//               onCheckedChange={toggleNotifications}
//               disabled={notificationPermission !== 'granted'}
//             />
//             <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
//             <span className="text-sm text-gray-900 dark:text-white">
//               {enableNotifications ? 'Notifications On' : 'Notifications Off'}
//             </span>
//           </div>
//         </div>
//         {loading ? (
//           <div className="space-y-4">
//             {[...Array(5)].map((_, idx) => (
//               <Skeleton key={idx} className="h-16 w-full rounded-lg" />
//             ))}
//           </div>
//         ) : notifications.length === 0 ? (
//           <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
//             No notifications yet.
//           </p>
//         ) : (
//           <div className="space-y-4">
//             {notifications.map((notification) => (
//               <div
//                 key={notification.id}
//                 className="relative flex items-start gap-4 p-4 bg-white dark:bg-black rounded-lg shadow-sm hover:shadow-md transition"
//               >
//                 <Avatar className="h-10 w-10">
//                   <AvatarImage
//                     src={notification.from_user?.avatar_url || ''}
//                     alt={notification.from_user?.username}
//                   />
//                   <AvatarFallback>
//                     {notification.from_user?.username?.[0] || 'U'}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     {notification.type === 'message' ? (
//                       <MessageCircle className="h-5 w-5 text-blue-500" />
//                     ) : notification.type === 'system' ? (
//                       <Award className="h-5 w-5 text-yellow-500" />
//                     ) : (
//                       <Users className="h-5 w-5 text-green-500" />
//                     )}
//                     <p className="text-sm font-medium text-gray-900 dark:text-white">
//                       {notification.message}
//                     </p>
//                     {notification.status === 'pending' && (
//                       <Badge className="bg-gray-200 text-gray-800 text-xs">
//                         New
//                       </Badge>
//                     )}
//                   </div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     {formatDistanceToNow(new Date(notification.created_at), {
//                       addSuffix: true,
//                     })}
//                   </p>
//                   {notification.type === 'connection_request' &&
//                     notification.status === 'pending' && (
//                       <div className="flex gap-2 mt-3">
//                         <Button
//                           size="sm"
//                           className="bg-green-500 hover:bg-green-600 text-white"
//                           onClick={() =>
//                             handleConnectionResponse(notification.id, 'accepted')
//                           }
//                         >
//                           Accept
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
//                           onClick={() =>
//                             handleConnectionResponse(notification.id, 'rejected')
//                           }
//                         >
//                           Reject
//                         </Button>
//                       </div>
//                     )}
//                   {notification.type === 'message' && (
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() =>
//                         router.push(`/main/messages?userId=${notification.from_user_id}`)
//                       }
//                       className="mt-3 text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
//                     >
//                       View Message
//                     </Button>
//                   )}
//                 </div>
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   onClick={() => handleDismiss(notification.id)}
//                   className="ml-auto text-gray-500 hover:text-red-500"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { useRouter } from 'next/navigation';
// import { MessageCircle, Users, X, Flame, Bell, Award } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { toast } from 'sonner';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';

// interface Notification {
//   id: string;
//   user_id: string;
//   type: 'connection_request' | 'message' | 'system' | 'streak';
//   from_user_id: string | null;
//   message: string;
//   status: 'pending' | 'read' | 'accepted' | 'rejected';
//   created_at: string;
//   from_user?: {
//     username: string;
//     avatar_url?: string;
//   };
// }

// interface Profile {
//   id: string;
//   username: string;
//   user_type: 'student' | 'sponsor';
//   enable_notifications?: boolean;
// }

// interface Streak {
//   current_streak: number;
//   longest_streak: number;
// }

// export default function Notifications() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<Profile | null>(null);
//   const [streak, setStreak] = useState<Streak | null>(null);
//   const [streakLoading, setStreakLoading] = useState(true);
//   const [enableNotifications, setEnableNotifications] = useState<boolean>(false);
//   const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
//   const router = useRouter();
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Initialize audio + unlock on click
//   useEffect(() => {
//     audioRef.current = new Audio('/notification.mp3');
//     audioRef.current.load();

//     const unlockAudio = () => {
//       if (audioRef.current) {
//         audioRef.current.play().then(() => {
//           audioRef.current?.pause();
//           audioRef.current.currentTime = 0;
//         });
//       }
//       window.removeEventListener('click', unlockAudio);
//     };

//     window.addEventListener('click', unlockAudio);
//   }, []);

//   // Request browser notification permission
//   useEffect(() => {
//     if ('Notification' in window) {
//       Notification.requestPermission().then((permission) => {
//         setNotificationPermission(permission);
//       });
//     }
//   }, []);

//   // Fetch current user + profile
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       const { data: { user }, error } = await supabase.auth.getUser();
//       if (error) {
//         console.error('Error fetching user:', error);
//         toast.error('Failed to fetch user.');
//         return;
//       }
//       setCurrentUserId(user?.id || null);

//       if (user?.id) {
//         const { data: profileData, error: profileError } = await supabase
//           .from('profiles')
//           .select('id, username, user_type, enable_notifications')
//           .eq('id', user.id)
//           .maybeSingle();

//         if (profileError || !profileData) {
//           console.error('Profile fetch error:', profileError);
//           toast.error('Failed to load profile.');
//           return;
//         }

//         setCurrentUser(profileData);
//         setEnableNotifications(profileData.enable_notifications || false);
//       }
//     };
//     fetchCurrentUser();
//   }, []);

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     if (!currentUserId) return;
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('notifications')
//       .select(`
//         *,
//         from_user:profiles!from_user_id(username, avatar_url)
//       `)
//       .eq('user_id', currentUserId)
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error fetching notifications:', error);
//       toast.error('Failed to load notifications.');
//       setNotifications([]);
//       setLoading(false);
//       return;
//     }

//     setNotifications(data || []);
//     setLoading(false);
//   };

//   // Fetch streaks (students only)
//   useEffect(() => {
//     const fetchStreak = async () => {
//       if (!currentUserId || currentUser?.user_type !== 'student') {
//         setStreak({ current_streak: 0, longest_streak: 0 });
//         setStreakLoading(false);
//         return;
//       }
//       setStreakLoading(true);
//       try {
//         const { data, error } = await supabase
//           .from('streaks')
//           .select('current_streak, longest_streak')
//           .eq('user_id', currentUserId)
//           .maybeSingle();

//         if (error || !data) {
//           console.error('Error fetching streak:', error);
//           setStreak({ current_streak: 0, longest_streak: 0 });
//         } else {
//           setStreak({
//             current_streak: data.current_streak || 0,
//             longest_streak: data.longest_streak || 0,
//           });
//         }
//       } catch (err) {
//         console.error('fetchStreak error:', err);
//         setStreak({ current_streak: 0, longest_streak: 0 });
//       } finally {
//         setStreakLoading(false);
//       }
//     };

//     if (currentUserId && currentUser) {
//       fetchStreak();
//     }
//   }, [currentUserId, currentUser]);

//   // Toggle notification preference
//   const toggleNotifications = async () => {
//     if (!currentUserId) return;
//     const newValue = !enableNotifications;
//     setEnableNotifications(newValue);

//     const { error } = await supabase
//       .from('profiles')
//       .update({ enable_notifications: newValue })
//       .eq('id', currentUserId);

//     if (error) {
//       console.error('Error updating notification preference:', error);
//       toast.error('Failed to update notification settings.');
//       setEnableNotifications(!newValue);
//       return;
//     }

//     toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'}.`);
//   };

//   // Mark notifications as read + play sound + show browser notif
//   useEffect(() => {
//     if (!currentUserId || loading || notifications.length === 0) return;

//     const markAsRead = async () => {
//       const pending = notifications.filter((n) => n.status === 'pending');
//       if (pending.length === 0) return;

//       // Browser + sound
//       if (enableNotifications && notificationPermission === 'granted') {
//         pending.forEach((n) => {
//           const body =
//             n.type === 'message'
//               ? `New message from ${n.from_user?.username || 'Unknown'}`
//               : n.message;

//           new Notification('New Notification', {
//             body,
//             icon: n.from_user?.avatar_url || '/favicon.ico',
//           });

//           if (audioRef.current) {
//             audioRef.current.currentTime = 0;
//             audioRef.current.play().catch((err) => console.error('Audio play error:', err));
//           }
//         });
//       }

//       // Mark as read in DB
//       const { error } = await supabase
//         .from('notifications')
//         .update({ status: 'read' })
//         .eq('user_id', currentUserId)
//         .eq('status', 'pending');

//       if (error) {
//         console.error('Error updating notifications:', error);
//         return;
//       }

//       setNotifications((prev) =>
//         prev.map((n) => (n.status === 'pending' ? { ...n, status: 'read' } : n))
//       );
//     };

//     markAsRead();
//   }, [currentUserId, notifications, loading, enableNotifications, notificationPermission]);

//   // Subscribe to realtime notifications
//   useEffect(() => {
//     if (!currentUserId) return;

//     const channel = supabase
//       .channel('notifications')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'notifications',
//           filter: `user_id=eq.${currentUserId}`,
//         },
//         () => {
//           fetchNotifications();
//           if (audioRef.current) {
//             audioRef.current.currentTime = 0;
//             audioRef.current.play().catch(() => {});
//           }
//         }
//       )
//       .subscribe();

//     fetchNotifications();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [currentUserId]);

//   // Handle dismiss
//   const handleDismiss = async (notificationId: string) => {
//     const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
//     if (error) {
//       toast.error('Failed to dismiss notification.');
//       return;
//     }
//     setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
//   };

//   // Counts
//   const connectionRequestCount = notifications.filter((n) => n.type === 'connection_request' && n.status === 'pending').length;
//   const messageNotificationCount = notifications.filter((n) => n.type === 'message' && n.status === 'pending').length;

//   return (
//     <div className="p-4 min-h-screen bg-gray-50 dark:bg-[#18181b]">
//       <div className="max-w-2xl mx-auto">
//         <div className="flex flex-wrap items-center gap-4 mb-6">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>

//           {currentUser?.user_type === 'student' && (
//             <Badge className="bg-orange-500 text-white text-xs flex items-center">
//               <Flame className="w-4 h-4 mr-1" />
//               {streakLoading ? (
//                 <span className="inline-block w-12 h-4 bg-gray-400 animate-pulse rounded" />
//               ) : (
//                 <>
//                   {streak?.current_streak || 0} day{streak?.current_streak !== 1 ? 's' : ''}
//                   {streak?.current_streak && streak.current_streak > 5 ? ' 🔥' : ''}
//                 </>
//               )}
//             </Badge>
//           )}

//           {connectionRequestCount > 0 && (
//             <Badge className="bg-green-500 text-white text-xs">
//               {connectionRequestCount} Connection{connectionRequestCount > 1 ? 's' : ''}
//             </Badge>
//           )}

//           {messageNotificationCount > 0 && (
//             <Badge className="bg-blue-500 text-white text-xs">
//               {messageNotificationCount} Message{messageNotificationCount > 1 ? 's' : ''}
//             </Badge>
//           )}

//           <div className="flex items-center gap-2">
//             <Switch
//               checked={enableNotifications}
//               onCheckedChange={toggleNotifications}
//               disabled={notificationPermission !== 'granted'}
//             />
//             <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
//             <span className="text-sm text-gray-900 dark:text-white">
//               {enableNotifications ? 'Notifications On' : 'Notifications Off'}
//             </span>
//           </div>
//         </div>

//         {loading ? (
//           <div className="space-y-4">
//             {[...Array(5)].map((_, idx) => (
//               <Skeleton key={idx} className="h-16 w-full rounded-lg" />
//             ))}
//           </div>
//         ) : notifications.length === 0 ? (
//           <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No notifications yet.</p>
//         ) : (
//           <div className="space-y-4">
//             {notifications.map((notification) => (
//               <div
//                 key={notification.id}
//                 className="relative flex items-start gap-4 p-4 bg-white dark:bg-black rounded-lg shadow-sm hover:shadow-md transition"
//               >
//                 <Avatar className="h-10 w-10">
//                   <AvatarImage src={notification.from_user?.avatar_url || ''} alt={notification.from_user?.username} />
//                   <AvatarFallback>{notification.from_user?.username?.[0] || 'U'}</AvatarFallback>
//                 </Avatar>

//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     {notification.type === 'message' ? (
//                       <MessageCircle className="h-5 w-5 text-blue-500" />
//                     ) : notification.type === 'system' ? (
//                       <Award className="h-5 w-5 text-yellow-500" />
//                     ) : (
//                       <Users className="h-5 w-5 text-green-500" />
//                     )}

//                     <p className="text-sm font-medium text-gray-900 dark:text-white">
//                       {notification.type === 'message'
//                         ? `New message from ${notification.from_user?.username || 'Unknown'}`
//                         : notification.message}
//                     </p>

//                     {notification.status === 'pending' && (
//                       <Badge className="bg-gray-200 text-gray-800 text-xs">New</Badge>
//                     )}
//                   </div>

//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
//                   </p>

//                   {notification.type === 'message' && (
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => router.push(`/main/messages?userId=${notification.from_user_id}`)}
//                       className="mt-3 text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
//                     >
//                       View Message
//                     </Button>
//                   )}
//                 </div>

//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   onClick={() => handleDismiss(notification.id)}
//                   className="ml-auto text-gray-500 hover:text-red-500"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { MessageCircle, Users, X, Flame, Bell, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Notification {
  id: string;
  user_id: string;
  type: 'connection_request' | 'message' | 'system' | 'streak';
  from_user_id: string | null;
  message: string;
  status: 'pending' | 'read' | 'accepted' | 'rejected';
  created_at: string;
  from_user?: {
    username: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  username: string;
  user_type: 'student' | 'sponsor';
  enable_notifications?: boolean;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio + unlock on click
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.load();

    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        });
      }
      window.removeEventListener('click', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Fetch current user + profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user.');
        return;
      }
      setCurrentUserId(user?.id || null);

      if (user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, user_type, enable_notifications')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError || !profileData) {
          console.error('Profile fetch error:', profileError);
          toast.error('Failed to load profile.');
          return;
        }

        setCurrentUser(profileData);
        setEnableNotifications(profileData.enable_notifications || false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        from_user:profiles!from_user_id(username, avatar_url)
      `,
      )
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications.');
      setNotifications([]);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  };

  // Fetch streaks (students only)
  useEffect(() => {
    const fetchStreak = async () => {
      if (!currentUserId || currentUser?.user_type !== 'student') {
        setStreak({ current_streak: 0, longest_streak: 0 });
        setStreakLoading(false);
        return;
      }
      setStreakLoading(true);
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (error || !data) {
          console.error('Error fetching streak:', error);
          setStreak({ current_streak: 0, longest_streak: 0 });
        } else {
          setStreak({
            current_streak: data.current_streak || 0,
            longest_streak: data.longest_streak || 0,
          });
        }
      } catch (err) {
        console.error('fetchStreak error:', err);
        setStreak({ current_streak: 0, longest_streak: 0 });
      } finally {
        setStreakLoading(false);
      }
    };

    if (currentUserId && currentUser) {
      fetchStreak();
    }
  }, [currentUserId, currentUser]);

  // Toggle notification preference
  const toggleNotifications = async () => {
    if (!currentUserId) return;
    const newValue = !enableNotifications;
    setEnableNotifications(newValue);

    const { error } = await supabase
      .from('profiles')
      .update({ enable_notifications: newValue })
      .eq('id', currentUserId);

    if (error) {
      console.error('Error updating notification preference:', error);
      toast.error('Failed to update notification settings.');
      setEnableNotifications(!newValue);
      return;
    }

    toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'}.`);
  };

  // Mark notifications as read + play sound + show browser notif
  useEffect(() => {
    if (!currentUserId || loading || notifications.length === 0) return;

    const markAsRead = async () => {
      const pending = notifications.filter((n) => n.status === 'pending');
      if (pending.length === 0) return;

      // Browser + sound
      if (enableNotifications && notificationPermission === 'granted') {
        pending.forEach((n) => {
          const body =
            n.type === 'message'
              ? `New message from ${n.from_user?.username || 'Unknown'}`
              : n.message;

          new Notification('New Notification', {
            body,
            icon: n.from_user?.avatar_url || '/favicon.ico',
          });

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((err) => console.error('Audio play error:', err));
          }
        });
      }

      // Mark as read in DB
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', currentUserId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error updating notifications:', error);
        return;
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.status === 'pending' ? { ...n, status: 'read' } : n,
        ),
      );
    };

    markAsRead();
  }, [
    currentUserId,
    notifications,
    loading,
    enableNotifications,
    notificationPermission,
  ]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          fetchNotifications();
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        },
      )
      .subscribe();

    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Handle dismiss
  const handleDismiss = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    if (error) {
      toast.error('Failed to dismiss notification.');
      return;
    }
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId),
    );
  };

  // Counts
  const connectionRequestCount = notifications.filter(
    (n) => n.type === 'connection_request' && n.status === 'pending',
  ).length;
  const messageNotificationCount = notifications.filter(
    (n) => n.type === 'message' && n.status === 'pending',
  ).length;

  return (
    <div className="p-4 min-h-screen bg-gray-50 dark:bg-[#18181b]">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h2>

          {currentUser?.user_type === 'student' && (
            <Badge className="bg-orange-500 text-white text-xs flex items-center">
              <Flame className="w-4 h-4 mr-1" />
              {streakLoading ? (
                <span className="inline-block w-12 h-4 bg-gray-400 animate-pulse rounded" />
              ) : (
                <>
                  {streak?.current_streak || 0} day
                  {streak?.current_streak !== 1 ? 's' : ''}
                  {streak?.current_streak &&
                  streak.current_streak > 5
                    ? ' 🔥'
                    : ''}
                </>
              )}
            </Badge>
          )}

          {connectionRequestCount > 0 && (
            <Badge className="bg-green-500 text-white text-xs">
              {connectionRequestCount} Connection
              {connectionRequestCount > 1 ? 's' : ''}
            </Badge>
          )}

          {messageNotificationCount > 0 && (
            <Badge className="bg-blue-500 text-white text-xs">
              {messageNotificationCount} Message
              {messageNotificationCount > 1 ? 's' : ''}
            </Badge>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={enableNotifications}
              onCheckedChange={toggleNotifications}
              disabled={notificationPermission !== 'granted'}
            />
            <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
            <span className="text-sm text-gray-900 dark:text-white">
              {enableNotifications
                ? 'Notifications On'
                : 'Notifications Off'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No notifications yet.
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="relative flex items-start gap-4 p-4 bg-white dark:bg-black rounded-lg shadow-sm hover:shadow-md transition"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={notification.from_user?.avatar_url || ''}
                    alt={notification.from_user?.username}
                  />
                  <AvatarFallback>
                    {notification.from_user?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {notification.type === 'message' ? (
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                    ) : notification.type === 'system' ? (
                      <Award className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Users className="h-5 w-5 text-green-500" />
                    )}

                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.type === 'message'
                        ? `New message from ${
                            notification.from_user?.username || 'Unknown'
                          }`
                        : notification.message}
                    </p>

                    {notification.status === 'pending' && (
                      <Badge className="bg-gray-200 text-gray-800 text-xs">
                        New
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(
                      new Date(notification.created_at),
                      { addSuffix: true },
                    )}
                  </p>

                  {notification.type === 'message' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/main/messages?userId=${notification.from_user_id}`,
                        )
                      }
                      className="mt-3 text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                    >
                      View Message
                    </Button>
                  )}
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDismiss(notification.id)}
                  className="ml-auto text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
