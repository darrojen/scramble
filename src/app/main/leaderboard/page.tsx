// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Input } from '@/components/ui/input';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Filter, MoreHorizontal, Search } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// const cartoonAvatars = [
//   'https://avatar.iran.liara.run/public/29',
//   'https://avatar.iran.liara.run/public/31',
//   'https://avatar.iran.liara.run/public/32',
//   'https://avatar.iran.liara.run/public/33',
//   'https://avatar.iran.liara.run/public/34',
//   'https://avatar.iran.liara.run/public/35',
//   'https://avatar.iran.liara.run/public/36',
//   'https://avatar.iran.liara.run/public/37',
//   'https://avatar.iran.liara.run/public/38',
//   'https://avatar.iran.liara.run/public/39',
//   'https://avatar.iran.liara.run/public/42',
//   'https://avatar.iran.liara.run/public/43',
//   'https://avatar.iran.liara.run/public/46',
//   'https://avatar.iran.liara.run/public/62',
//   'https://avatar.iran.liara.run/public/67',
//   'https://avatar.iran.liara.run/public/70',
//   'https://avatar.iran.liara.run/public/76',
//   'https://avatar.iran.liara.run/public/77',
//   'https://avatar.iran.liara.run/public/80',
//   'https://avatar.iran.liara.run/public/88',
//   'https://avatar.iran.liara.run/public/90',
//   'https://avatar.iran.liara.run/public/97',
// ];

// interface LeaderboardEntry {
//   username: string;
//   exam_type: string;
//   total_points: number;
//   rank: number;
//   avatar_url?: string;
// }

// // League system
// function getLeague(points: number): string {
//   if (points >= 2001) return 'Diamond';
// if (points >= 3001) return 'Platinum';
// if (points >= 1001) return 'Gold';
// if (points >= 601) return 'Silver';
// if (points >= 301) return 'Bronze';
// return 'Palladium';
// }

// // Badge colors
// function getLeagueBadgeColor(league: string): string {
//   switch (league) {
//     case 'Diamond':
//       return 'bg-[#e8faff] text-white';
//     case 'Platinum':
//       return 'bg-[#E5E4E2] text-white';
//     case 'Gold':
//       return 'bg-[#DAA425] text-black';
//     case 'Silver':
//       return 'bg-[#C0C0C0] text-black';
//     case 'Bronze':
//       return 'bg-[#CD7F32] text-black';
//     default:
//       return 'bg-[#c1c1bb] text-black';
//   }
// }

// export default function Leaderboard() {
//   const [data, setData] = useState<LeaderboardEntry[]>([]);
//   const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [examFilter, setExamFilter] = useState<string>('all');
//   const [leagueFilter, setLeagueFilter] = useState<string>('all');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchData = async () => {
//     setLoading(true);
//     let query = supabase.from('leaderboard_view').select('*');

//     if (examFilter !== 'all') query = query.eq('exam_type', examFilter);

//     const { data: result, error } = await query;
//     if (error) {
//       console.error(error);
//       setData([]);
//       setFilteredData([]);
//       setLoading(false);
//       return;
//     }

//     const sorted = [...(result || [])].sort((a, b) =>
//       sortOrder === 'asc'
//         ? a.total_points - b.total_points
//         : b.total_points - a.total_points
//     );

//     setData(sorted);
//     setFilteredData(sorted);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, [examFilter, sortOrder]);

//   useEffect(() => {
//     let filtered = data.filter((entry) =>
//       entry.username.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (leagueFilter !== 'all') {
//       filtered = filtered.filter(
//         (entry) => getLeague(entry.total_points) === leagueFilter
//       );
//     }

//     setFilteredData(filtered);
//   }, [searchTerm, leagueFilter, data]);
   


//   const getRankColor = (rank: number) => {
//     if (rank === 1) return 'bg-[#DAA425] text-white';
//     if (rank === 2) return 'bg-[#C0C0C0] text-white';
//     if (rank === 3) return 'bg-amber-700 text-white';
//     return 'bg-gray-100 text-gray-800';
//   };
//   return (
//     <div className="p-6 min-h-scree">
//       <Card className="mb-6">
//         <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
//           <CardTitle>Leaderboard</CardTitle>

//           <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
//             {/* Search */}
//             <div className="relative flex-1 sm:flex-none">
//               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                 <Search size={16} />
//               </span>
//               <Input
//                 placeholder="Search by username..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 w-full"
//               />
//             </div>

//             {/* Exam filter */}
//             <Select
//               defaultValue="all"
//               onValueChange={(val) => setExamFilter(val)}
//             >
//               <SelectTrigger className="w-32">
//                 <SelectValue placeholder="Exam Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 <SelectItem value="WAEC">WAEC</SelectItem>
//                 <SelectItem value="NECO">NECO</SelectItem>
//                 <SelectItem value="JAMB">JAMB</SelectItem>
//                 <SelectItem value="normal">Normal</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* League filter */}
//             <Select
//               defaultValue="all"
//               onValueChange={(val) => setLeagueFilter(val)}
//             >
//               <SelectTrigger className="w-32">
//                 <SelectValue placeholder="League" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Leagues</SelectItem>
//                 <SelectItem value="Diamond">Diamond</SelectItem>
//                 <SelectItem value="Platinum">Platinum</SelectItem>
//                 <SelectItem value="Gold">Gold</SelectItem>
//                 <SelectItem value="Silver">Silver</SelectItem>
//                 <SelectItem value="Bronze">Bronze</SelectItem>
//                 <SelectItem value="palladium">palladium</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Sort order */}
//             <Select
//               defaultValue="desc"
//               onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}
//             >
//               <SelectTrigger className="w-36 flex items-center gap-2">
//                 <Filter size={16} />
//                 <SelectValue
//                   placeholder={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="asc">Ascending</SelectItem>
//                 <SelectItem value="desc">Descending</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {loading ? (
//             <div className="space-y-2">
//               {[...Array(5)].map((_, idx) => (
//                 <Skeleton key={idx} className="h-10 w-full rounded-md" />
//               ))}
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Rank</TableHead>
//                   <TableHead>Username</TableHead>
//                   <TableHead>Points</TableHead>
//                   <TableHead>League</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//             <TableBody>
//   {filteredData.map((entry, idx) => {
//     const rank = idx + 1;
//     const league = getLeague(entry.total_points);
//     const avatar =
//       entry.avatar_url || cartoonAvatars[idx % cartoonAvatars.length];

//     // Replace rank with medal only for top 3
//     return (
//       <TableRow key={entry.username}>
//         <TableCell><div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(entry.rank || idx + 1)}`}>
//                         {entry.rank || idx + 1}
//                        </div></TableCell>
//         <TableCell className="flex items-center gap-2">
//           <Avatar className="h-8 w-8">
//             <AvatarImage src={avatar} alt={entry.username} />
//             <AvatarFallback>{entry.username[0]}</AvatarFallback>
//           </Avatar>
//           {entry.username}
//         </TableCell> <TableCell>{entry.total_points}</TableCell>
//         <TableCell>
//           <Badge className={`${getLeagueBadgeColor(league)}`}>
//             {league}
//           </Badge>
//         </TableCell>
//         <TableCell className="text-right">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon">
//                 <MoreHorizontal />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => alert(`Viewing ${entry.username}`)}>
//                 View
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => alert(`Contacting ${entry.username}`)}>
//                 Contact
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => alert(`Connecting with ${entry.username}`)}>
//                 Connect
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </TableCell>
//       </TableRow>
//     );
//   })}
// </TableBody>

//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }







'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, MoreHorizontal, Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const cartoonAvatars = [
  'https://avatar.iran.liara.run/public/29',
  'https://avatar.iran.liara.run/public/31',
  'https://avatar.iran.liara.run/public/32',
  'https://avatar.iran.liara.run/public/33',
  'https://avatar.iran.liara.run/public/34',
  'https://avatar.iran.liara.run/public/35',
  'https://avatar.iran.liara.run/public/36',
  'https://avatar.iran.liara.run/public/37',
  'https://avatar.iran.liara.run/public/38',
  'https://avatar.iran.liara.run/public/39',
  'https://avatar.iran.liara.run/public/42',
  'https://avatar.iran.liara.run/public/43',
  'https://avatar.iran.liara.run/public/46',
  'https://avatar.iran.liara.run/public/62',
  'https://avatar.iran.liara.run/public/67',
  'https://avatar.iran.liara.run/public/70',
  'https://avatar.iran.liara.run/public/76',
  'https://avatar.iran.liara.run/public/77',
  'https://avatar.iran.liara.run/public/80',
  'https://avatar.iran.liara.run/public/88',
  'https://avatar.iran.liara.run/public/90',
  'https://avatar.iran.liara.run/public/97',
];

interface LeaderboardEntry {
  student_id: string; // ✅ corrected
  username: string;
  exam_type: string;
  total_points: number;
  rank: number;
  avatar_url?: string;
}

// League system
function getLeague(points: number): string {
  if (points >= 3001) return 'Platinum';
  if (points >= 2001) return 'Diamond';
  if (points >= 1001) return 'Gold';
  if (points >= 601) return 'Silver';
  if (points >= 301) return 'Bronze';
  return 'Palladium';
}

// Badge colors
function getLeagueBadgeColor(league: string): string {
  switch (league) {
    case 'Diamond':
      return 'bg-[#e8faff] text-white';
    case 'Platinum':
      return 'bg-[#E5E4E2] text-white';
    case 'Gold':
      return 'bg-[#DAA425] text-black';
    case 'Silver':
      return 'bg-[#C0C0C0] text-black';
    case 'Bronze':
      return 'bg-[#CD7F32] text-black';
    default:
      return 'bg-[#c1c1bb] text-black';
  }
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [examFilter, setExamFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('leaderboard_view').select('*');

    if (examFilter !== 'all') query = query.eq('exam_type', examFilter);

    const { data: result, error } = await query;
    if (error) {
      console.error(error);
      setData([]);
      setFilteredData([]);
      setLoading(false);
      return;
    }

    // fetch avatar_url for each student_id
    const withAvatars = await Promise.all(
      (result || []).map(async (entry: LeaderboardEntry, idx: number) => {
        let avatarUrl: string | null = null;

        if (entry.student_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', entry.student_id) // ✅ use student_id
            .single();

          avatarUrl = profile?.avatar_url || null;
        }

        return {
          ...entry,
          avatar_url: avatarUrl || cartoonAvatars[idx % cartoonAvatars.length],
        };
      })
    );

    const sorted = [...withAvatars].sort((a, b) =>
      sortOrder === 'asc'
        ? a.total_points - b.total_points
        : b.total_points - a.total_points
    );

    setData(sorted);
    setFilteredData(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [examFilter, sortOrder]);

  useEffect(() => {
    let filtered = data.filter((entry) =>
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (leagueFilter !== 'all') {
      filtered = filtered.filter(
        (entry) => getLeague(entry.total_points) === leagueFilter
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, leagueFilter, data]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-[#DAA425] text-white';
    if (rank === 2) return 'bg-[#C0C0C0] text-white';
    if (rank === 3) return 'bg-amber-700 text-white';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 min-h-scree">
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle>Leaderboard</CardTitle>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <Input
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Exam filter */}
            <Select
              defaultValue="all"
              onValueChange={(val) => setExamFilter(val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="WAEC">WAEC</SelectItem>
                <SelectItem value="NECO">NECO</SelectItem>
                <SelectItem value="JAMB">JAMB</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            {/* League filter */}
            <Select
              defaultValue="all"
              onValueChange={(val) => setLeagueFilter(val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="League" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Palladium">Palladium</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort order */}
            <Select
              defaultValue="desc"
              onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-36 flex items-center gap-2">
                <Filter size={16} />
                <SelectValue
                  placeholder={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((entry, idx) => {
                  const rank = idx + 1;
                  const league = getLeague(entry.total_points);

                  return (
                    <TableRow key={entry.student_id}>
                      <TableCell>
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(
                            entry.rank || rank
                          )}`}
                        >
                          {entry.rank || rank}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={entry.avatar_url || ''}
                            alt={entry.username}
                          />
                          <AvatarFallback>
                            {entry.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        {entry.username}
                      </TableCell>
                      <TableCell>{entry.total_points}</TableCell>
                      <TableCell>
                        <Badge className={`${getLeagueBadgeColor(league)}`}>
                          {league}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Connect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
