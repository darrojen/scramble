// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { supabase } from '@/lib/supabaseClient';
// // import { motion } from 'framer-motion';
// // import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// // import { Skeleton } from '@/components/ui/skeleton';
// // import Box from '@/components/ui/box';
// // import { useTheme } from 'next-themes';
// // import { Mail, Phone, Building, MapPin, Calendar, User } from 'lucide-react';
// // import { toast } from 'sonner';

// // interface Sponsor {
// //   id: string;
// //   username: string | null;
// //   first_name: string;
// //   last_name: string;
// //   company: string;
// //   email: string;
// //   phone: string | null;
// //   city: string | null;
// //   bio: string | null;
// //   avatar_url: string | null;
// //   joindate: string;
// //   profile_completion: number;
// // }

// // export default function SponsorsPage() {
// //   const { theme } = useTheme();
// //   const [sponsors, setSponsors] = useState<Sponsor[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchSponsors = async () => {
// //       setLoading(true);
// //       try {
// //         const { data, error } = await supabase
// //           .from('sponsors')
// //           .select('id, username, first_name, last_name, company, email, phone, city, bio, avatar_url, joindate, profile_completion')
// //           .order('joindate', { ascending: false });

// //         if (error) {
// //           console.error('Error fetching sponsors:', error);
// //           toast.error('Failed to load sponsors');
// //           return;
// //         }

// //         setSponsors(data || []);
// //       } catch (err) {
// //         console.error('Unexpected error:', err);
// //         toast.error('An unexpected error occurred');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchSponsors();
// //   }, []);

// //   if (loading) {
// //     return (
// //       <motion.div
// //         initial={{ opacity: 0 }}
// //         animate={{ opacity: 1 }}
// //         exit={{ opacity: 0 }}
// //         className={`min-h-screen p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${theme === 'system' ? 'bg-gray-900 text-white' : ''}`}
// //       >
// //         <h1 className="text-2xl sm:text-3xl font-bold mb-6">Our Sponsors</h1>
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
// //           {[...Array(6)].map((_, index) => (
// //             <Box key={index} className="p-4">
// //               <Skeleton className="w-16 h-16 rounded-full mb-4" />
// //               <Skeleton className="h-6 w-3/4 mb-2" />
// //               <Skeleton className="h-4 w-full mb-2" />
// //               <Skeleton className="h-4 w-1/2" />
// //             </Box>
// //           ))}
// //         </div>
// //       </motion.div>
// //     );
// //   }

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className={`min-h-screen p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${theme === 'system' ? 'bg-gray-900 text-white' : ''}`}
// //     >
// //       <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Our Sponsors</h1>
// //       {sponsors.length === 0 ? (
// //         <p className="text-center text-gray-500 dark:text-gray-400">No sponsors found.</p>
// //       ) : (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
// //           {sponsors.map((sponsor) => (
// //             <motion.div
// //               key={sponsor.id}
// //               initial={{ opacity: 0, y: 20 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ duration: 0.3 }}
// //             >
// //               <Box className="p-4 sm:p-6 flex flex-col gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
// //                 <div className="flex items-center gap-4">
// //                   <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border">
// //                     {sponsor.avatar_url ? (
// //                       <AvatarImage src={sponsor.avatar_url} alt={`${sponsor.first_name} ${sponsor.last_name}`} />
// //                     ) : (
// //                       <AvatarFallback className="text-lg font-semibold">
// //                         {sponsor.username?.[0]?.toUpperCase() || sponsor.first_name[0].toUpperCase()}
// //                       </AvatarFallback>
// //                     )}
// //                   </Avatar>
// //                   <div>
// //                     <h2 className="text-lg sm:text-xl font-semibold">
// //                       {sponsor.first_name} {sponsor.last_name}
// //                     </h2>
// //                     {sponsor.username && (
// //                       <p className="text-sm opacity-80">@{sponsor.username}</p>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div className="flex flex-col gap-2 text-sm">
// //                   {sponsor.company && (
// //                     <div className="flex items-center gap-2">
// //                       <Building className="w-4 h-4 opacity-60" />
// //                       <span>{sponsor.company}</span>
// //                     </div>
// //                   )}
// //                   {sponsor.email && (
// //                     <div className="flex items-center gap-2">
// //                       <Mail className="w-4 h-4 opacity-60" />
// //                       <a href={`mailto:${sponsor.email}`} className="hover:underline">
// //                         {sponsor.email}
// //                       </a>
// //                     </div>
// //                   )}
// //                   {sponsor.phone && (
// //                     <div className="flex items-center gap-2">
// //                       <Phone className="w-4 h-4 opacity-60" />
// //                       <span>{sponsor.phone}</span>
// //                     </div>
// //                   )}
// //                   {sponsor.city && (
// //                     <div className="flex items-center gap-2">
// //                       <MapPin className="w-4 h-4 opacity-60" />
// //                       <span>{sponsor.city}</span>
// //                     </div>
// //                   )}
// //                   {sponsor.joindate && (
// //                     <div className="flex items-center gap-2">
// //                       <Calendar className="w-4 h-4 opacity-60" />
// //                       <span>Joined {new Date(sponsor.joindate).toLocaleDateString()}</span>
// //                     </div>
// //                   )}
// //                   {sponsor.bio && (
// //                     <div className="mt-2">
// //                       <p className="text-sm opacity-80">{sponsor.bio}</p>
// //                     </div>
// //                   )}
// //                   <div className="mt-2">
// //                     <span className="text-sm opacity-80">Profile Completion: {sponsor.profile_completion}%</span>
// //                     <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mt-1">
// //                       <div
// //                         className="bg-blue-600 h-2.5 rounded-full"
// //                         style={{ width: `${sponsor.profile_completion}%` }}
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>
// //               </Box>
// //             </motion.div>
// //           ))}
// //         </div>
// //       )}
// //     </motion.div>
// //   );
// // }



// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { motion } from 'framer-motion';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Box from '@/components/ui/box';
// import { Skeleton } from '@/components/ui/skeleton';
// import { useTheme } from 'next-themes';
// import { Mail, Phone, Building, MapPin, Calendar, User, MoreVertical, ArrowLeft } from 'lucide-react';
// import { toast } from 'sonner';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Button } from '@/components/ui/button';

// interface Sponsor {
//   id: string;
//   username: string | null;
//   first_name: string;
//   last_name: string;
//   company: string;
//   email: string;
//   phone: string | null;
//   city: string | null;
//   bio: string | null;
//   avatar_url: string | null;
//   joindate: string;
//   school_name: string | null;
//   class: string | null;
//   is_verified: boolean;
//   created_at: string;
// }

// export default function SponsorsPage() {
//   const { theme } = useTheme();
//   const [sponsors, setSponsors] = useState<Sponsor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

//   useEffect(() => {
//     const fetchSponsors = async () => {
//       setLoading(true);
//       try {
//         const { data, error } = await supabase
//           .from('sponsors')
//           .select('id, username, first_name, last_name, company, email, phone, city, bio, avatar_url, joindate, school_name, class, is_verified, created_at')
//           .order('joindate', { ascending: false });

//         if (error) {
//           console.error('Error fetching sponsors:', error);
//           toast.error('Failed to load sponsors');
//           return;
//         }

//         setSponsors(data || []);
//       } catch (err) {
//         console.error('Unexpected error:', err);
//         toast.error('An unexpected error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSponsors();
//   }, []);

//   const handleConnect = (sponsor: Sponsor) => {
//     // Placeholder for connect action (e.g., send a connection request)
//     toast.success(`Connection request sent to ${sponsor.first_name} ${sponsor.last_name}`);
//   };

//   const handleContact = (sponsor: Sponsor) => {
//     // Placeholder for contact action (e.g., open email client)
//     window.location.href = `mailto:${sponsor.email}`;
//   };

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className={`min-h-screen p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${theme === 'system' ? 'bg-gray-900 text-white' : ''}`}
//       >
//         <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Our Sponsors</h1>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//           {[...Array(6)].map((_, index) => (
//             <Box key={index} className="p-4">
//               <Skeleton className="w-16 h-16 rounded-full mb-4" />
//               <Skeleton className="h-6 w-3/4 mb-2" />
//               <Skeleton className="h-4 w-full mb-2" />
//               <Skeleton className="h-4 w-1/2" />
//             </Box>
//           ))}
//         </div>
//       </motion.div>
//     );
//   }

//   if (selectedSponsor) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className={`min-h-screen p-4 sm:p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
//       >
//         <Button
//           onClick={() => setSelectedSponsor(null)}
//           className="mb-6 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full p-2"
//         >
//           <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//         </Button>
//         <Card className="mb-6 p-4 sm:p-6">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
//                   {selectedSponsor.avatar_url ? (
//                     <AvatarImage src={selectedSponsor.avatar_url} alt={`${selectedSponsor.first_name} ${selectedSponsor.last_name}`} />
//                   ) : (
//                     <AvatarFallback>
//                       {selectedSponsor.username?.[0]?.toUpperCase() || selectedSponsor.first_name[0].toUpperCase()}
//                     </AvatarFallback>
//                   )}
//                 </Avatar>
//                 <div>
//                   <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
//                     {selectedSponsor.first_name} {selectedSponsor.last_name}
//                   </CardTitle>
//                   {selectedSponsor.username && (
//                     <p className="text-sm sm:text-base opacity-70">@{selectedSponsor.username}</p>
//                   )}
//                 </div>
//               </div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="p-2">
//                     <MoreVertical className="w-5 h-5" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="bg-white dark:bg-gray-800">
//                   <DropdownMenuItem onClick={() => handleConnect(selectedSponsor)}>
//                     Connect
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => handleContact(selectedSponsor)}>
//                     Contact
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col gap-3 text-sm sm:text-base">
//               {selectedSponsor.company && (
//                 <div className="flex items-center gap-2">
//                   <Building className="w-4 h-4 opacity-60" />
//                   <span>{selectedSponsor.company}</span>
//                 </div>
//               )}
//               {selectedSponsor.email && (
//                 <div className="flex items-center gap-2">
//                   <Mail className="w-4 h-4 opacity-60" />
//                   <a href={`mailto:${selectedSponsor.email}`} className="hover:underline">
//                     {selectedSponsor.email}
//                   </a>
//                 </div>
//               )}
//               {selectedSponsor.phone && (
//                 <div className="flex items-center gap-2">
//                   <Phone className="w-4 h-4 opacity-60" />
//                   <span>{selectedSponsor.phone}</span>
//                 </div>
//               )}
//               {selectedSponsor.city && (
//                 <div className="flex items-center gap-2">
//                   <MapPin className="w-4 h-4 opacity-60" />
//                   <span>{selectedSponsor.city}</span>
//                 </div>
//               )}
//               {selectedSponsor.joindate && (
//                 <div className="flex items-center gap-2">
//                   <Calendar className="w-4 h-4 opacity-60" />
//                   <span>Joined {new Date(selectedSponsor.joindate).toLocaleDateString()}</span>
//                 </div>
//               )}
//               {selectedSponsor.bio && (
//                 <div className="mt-2">
//                   <p className="text-sm opacity-80">{selectedSponsor.bio}</p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className={`min-h-screen p-4 sm:p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${theme === 'system' ? 'bg-gray-900 text-white' : ''}`}
//     >
//       <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Our Sponsors</h1>
//       {sponsors.length === 0 ? (
//         <p className="text-center text-gray-500 dark:text-gray-400">No sponsors found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
//           {sponsors.map((sponsor) => (
//             <motion.div
//               key={sponsor.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//               onClick={() => setSelectedSponsor(sponsor)}
//               className="cursor-pointer"
//             >
//               <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border">
//                       {sponsor.avatar_url ? (
//                         <AvatarImage src={sponsor.avatar_url} alt={`${sponsor.first_name} ${sponsor.last_name}`} />
//                       ) : (
//                         <AvatarFallback>
//                           {sponsor.username?.[0]?.toUpperCase() || sponsor.first_name[0].toUpperCase()}
//                         </AvatarFallback>
//                       )}
//                     </Avatar>
//                     <div>
//                       <h2 className="text-lg sm:text-xl font-semibold">
//                         {sponsor.first_name} {sponsor.last_name}
//                       </h2>
//                       {sponsor.username && (
//                         <p className="text-sm opacity-80">@{sponsor.username}</p>
//                       )}
//                     </div>
//                   </div>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" className="p-2">
//                         <MoreVertical className="w-5 h-5" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent className="bg-white dark:bg-gray-800">
//                       <DropdownMenuItem onClick={() => handleConnect(sponsor)}>
//                         Connect
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => handleContact(sponsor)}>
//                         Contact
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//                 <div className="mt-3 text-sm">
//                   {sponsor.company && (
//                     <div className="flex items-center gap-2">
//                       <Building className="w-4 h-4 opacity-60" />
//                       <span>{sponsor.company}</span>
//                     </div>
//                   )}
//                   {sponsor.city && (
//                     <div className="flex items-center gap-2 mt-2">
//                       <MapPin className="w-4 h-4 opacity-60" />
//                       <span>{sponsor.city}</span>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// }



'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Mail, Phone, Building, MapPin, Calendar, MoreHorizontal, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Sponsor {
  id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  joindate: string;
}

export default function SponsorsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  // Fetch sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sponsors')
          .select('id, username, first_name, last_name, company, email, phone, city, bio, avatar_url, joindate')
          .order('joindate', { ascending: sortOrder === 'asc' });

        if (error) {
          console.error('Error fetching sponsors:', error);
          toast.error('Failed to load sponsors');
          return;
        }

        setSponsors(data || []);
        setFilteredSponsors(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, [sortOrder]);

  // Filter sponsors based on search term
  useEffect(() => {
    const filtered = sponsors.filter((sponsor) =>
      (sponsor.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sponsor.first_name + ' ' + sponsor.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sponsor.company || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSponsors(filtered);
  }, [searchTerm, sponsors]);

  // Handle connection request
  const handleConnect = async (toUserId: string, toUsername: string) => {
    if (!currentUserId) {
      toast.error('You must be logged in to send a connection request');
      return;
    }
    if (toUserId === currentUserId) {
      toast.error('You cannot connect with yourself');
      return;
    }

    try {
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .eq('from_user_id', currentUserId)
        .eq('to_user_id', toUserId)
        .single();

      if (existingConnection) {
        toast.error('Connection request already sent or accepted');
        return;
      }

      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          from_user_id: currentUserId,
          to_user_id: toUserId,
          status: 'pending',
        });

      if (connectionError) {
        console.error('Error creating connection:', connectionError);
        toast.error('Failed to send connection request');
        return;
      }

      const { data: fromUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', currentUserId)
        .single();

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: toUserId,
          type: 'connection_request',
          from_user_id: currentUserId,
          message: `${fromUser?.username || 'User'} sent you a connection request.`,
          status: 'pending',
        });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        toast.error('Failed to send notification');
        return;
      }

      toast.success(`Connection request sent to ${toUsername}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  // Handle contact action
  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${theme === 'dark' ? 'bg-[#16161a] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Card className="mb-6 rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-lg sm:text-xl font-semibold">Our Sponsors</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <Input
                placeholder="Search by username or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg"
              />
            </div>
            <Select
              defaultValue="desc"
              onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-36 flex items-center gap-2 rounded-lg">
                <SelectValue placeholder={sortOrder === 'asc' ? 'Ascending' : 'Descending'} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredSponsors.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No sponsors found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredSponsors.map((sponsor) => (
                <Card
                  key={sponsor.id}
                  className={`p-4 sm:p-6 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    currentUserId === sponsor.id ? (theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100') : ''
                  }`}
                  onClick={() => router.push(`/main/users/${sponsor.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border">
                        {sponsor.avatar_url ? (
                          <AvatarImage src={sponsor.avatar_url} alt={`${sponsor.first_name} ${sponsor.last_name}`} />
                        ) : (
                          <AvatarFallback>
                            {sponsor.username?.[0]?.toUpperCase() || sponsor.first_name[0].toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold">
                          {sponsor.first_name} {sponsor.last_name}
                        </h2>
                        {sponsor.username && (
                          <p className="text-sm opacity-80">@{sponsor.username}</p>
                        )}
                        {sponsor.company && (
                          <p className="text-sm opacity-80">{sponsor.company}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white dark:bg-gray-800" align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/main/users/${sponsor.id}`);
                          }}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/main/messages?userId=${sponsor.id}`);
                              }}
                        >
                          Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(sponsor.id, sponsor.username || `${sponsor.first_name} ${sponsor.last_name}`);
                          }}
                        >
                          Connect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}