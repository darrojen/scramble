'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, MoreHorizontal, Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

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
  student_id: string;
  username: string;
  exam_type: string;
  total_points: number;
  rank: number;
  avatar_url?: string;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 27;
  const router = useRouter();
  const { theme } = useTheme();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const query = supabase.from('leaderboard_view').select('*');

    const { data: result, error } = await query;
    if (error) {
      console.error('Error fetching leaderboard:', error);
      setData([]);
      setFilteredData([]);
      setLoading(false);
      return;
    }

    // Fetch avatar_url for each student_id
    const withAvatars = await Promise.all(
      (result || []).map(async (entry: LeaderboardEntry, idx: number) => {
        let avatarUrl: string | null = null;

        if (entry.student_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', entry.student_id)
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
  }, [sortOrder]);

  useEffect(() => {
    let filtered = data.filter((entry) =>
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (leagueFilter !== 'all') {
      filtered = filtered.filter((entry) => {
        const points = entry.total_points;
        if (points >= 27300) return leagueFilter === 'Platinum';
        if (points >= 13300) return leagueFilter === 'Diamond';
        if (points >= 5300) return leagueFilter === 'Gold';
        if (points >= 1300) return leagueFilter === 'Silver';
        if (points >= 900) return leagueFilter === 'Bronze';
        return leagueFilter === 'Palladium';
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, leagueFilter, data]);

  // Handle connection request
  const handleConnect = async (toUserId: string) => {
    if (!currentUserId) {
      toast('You must be logged in to send a connection request.');
      return;
    }
    if (toUserId === currentUserId) {
      toast('You cannot connect with yourself.');
      return;
    }

    const { data: existingConnection } = await supabase
      .from('connections')
      .select('*')
      .eq('from_user_id', currentUserId)
      .eq('to_user_id', toUserId)
      .single();

    if (existingConnection) {
      toast('Connection request already sent or accepted.');
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
      toast('Failed to send connection request.');
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
      toast('Failed to send notification.');
    } else {
      toast(`Connection request sent to ${fromUser?.username || 'user'}.`);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-[#DAA425] text-white';
    if (rank === 2) return 'bg-[#C0C0C0] text-white';
    if (rank === 3) return 'bg-amber-700 text-white';
    return 'bg-gray-100 text-gray-800';
  };

  const getLeagueBadgeColor = (league: string): string => {
    switch (league) {
      case 'Diamond':
        return 'bg-[#b9f2ff] text-[#1a3c34]';
      case 'Platinum':
        return 'bg-[#E5E4E2] text-[#1a1a1a]';
      case 'Gold':
        return 'bg-[#DAA425] text-[#1a1a1a]';
      case 'Silver':
        return 'bg-[#C0C0C0] text-[#1a1a1a]';
      case 'Bronze':
        return 'bg-[#CD7F32] text-[#1a1a1a]';
      default:
        return 'bg-[#c1c1bb] text-[#1a1a1a]';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="p-6 min-h-screen">
      <Card className="mb-6 rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400ções">
                <Search size={16} />
              </span>
              <Input
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg"
              />
            </div>
            <Select
              defaultValue="all"
              onValueChange={(val) => setLeagueFilter(val)}
            >
              <SelectTrigger className="w-32 rounded-lg">
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
            <Select
              defaultValue="desc"
              onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-36 flex items-center gap-2 rounded-lg">
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
                <Skeleton key={idx} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
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
                  {paginatedData.map((entry, idx) => {
                    const rank = startIndex + idx + 1;
                    const league = entry.total_points >= 27300 ? 'Platinum' :
                                  entry.total_points >= 13300 ? 'Diamond' :
                                  entry.total_points >= 5300 ? 'Gold' :
                                  entry.total_points >= 1300 ? 'Silver' :
                                  entry.total_points >= 900 ? 'Bronze' : 'Palladium';
                    const isCurrentUser = entry.student_id === currentUserId;

                    return (
                      <TableRow
                        key={entry.student_id}
                        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          isCurrentUser ? (theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100') : ''
                        }`}
                        onClick={() => router.push(`/main/users/${entry.student_id}`)}
                      >
                        <TableCell>
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(rank)}`}
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
                        <TableCell>{entry.total_points} <span className='text-[12px]'>{'𝙐𝙥'}</span></TableCell>
                        <TableCell>
                          <Badge className={getLeagueBadgeColor(league)}>
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
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/main/users/${entry.student_id}`);
                                }}
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/main/messages?userId=${entry.student_id}`);
                                }}
                              >
                                Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnect(entry.student_id);
                                }}
                              >
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
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        onClick={() => setCurrentPage(idx + 1)}
                        isActive={currentPage === idx + 1}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
