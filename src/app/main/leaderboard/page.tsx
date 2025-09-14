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
  username: string | null;
  exam_type: string;
  total_points: number;
  avatar_url?: string | null;
  rank?: number;
  firstName: string;
}

// League system
function getLeague(points: number): string {
  if (points >=20300) return 'Diamond';
  if (points >= 7300) return 'Platinum';
  if (points >= 3300) return 'Gold';
  if (points >= 2300) return 'Silver';
  if (points >= 900) return 'Bronze';
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

// rank color for top 3
function getRankColor(rank: number) {
  if (rank === 1) return 'bg-[#DAA425] text-white';
  if (rank === 2) return 'bg-[#C0C0C0] text-white';
  if (rank === 3) return 'bg-amber-700 text-white';
  return 'bg-gray-100 text-gray-800';
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [displayData, setDisplayData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [examFilter, setExamFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('leaderboard_view').select('*');
      if (examFilter !== 'all') query = query.eq('exam_type', examFilter);

      const { data: result, error } = await query;
      if (error) {
        console.error(error);
        setData([]);
      } else {
        const normalized = (result || []).map((r: any) => ({
          ...r,
          username: r.username ?? null,
          total_points:
            typeof r.total_points === 'string'
              ? Number(r.total_points)
              : r.total_points,
          avatar_url: r.avatar_url ?? null,
        }));
        setData(normalized);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examFilter]);

  useEffect(() => {
    let processed = data.filter((entry) =>
      (entry.username ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (leagueFilter !== 'all') {
      processed = processed.filter(
        (entry) => getLeague(entry.total_points) === leagueFilter
      );
    }

    processed.sort((a, b) => {
      if (a.total_points === b.total_points) {
        return (a.username ?? '')
          .toLowerCase()
          .localeCompare((b.username ?? '').toLowerCase());
      }
      return sortOrder === 'asc'
        ? a.total_points - b.total_points
        : b.total_points - a.total_points;
    });

    const ranked = processed.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    setDisplayData(ranked);
  }, [data, searchTerm, leagueFilter, sortOrder]);

  return (
    <div className="p-6 min-h-screen">
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle>Leaderboard</CardTitle>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
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

            <Select defaultValue="all" onValueChange={(val) => setExamFilter(val)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="WAEC">WAEC</SelectItem>
                <SelectItem value="NECO">NECO</SelectItem>
                <SelectItem value="JAMB">JAMB</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all" onValueChange={(val) => setLeagueFilter(val)}>
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
              {[...Array(6)].map((_, idx) => (
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
                {displayData.map((entry, idx) => {
                  const league = getLeague(entry.total_points);
                  const avatar =
                    entry.avatar_url || cartoonAvatars[idx % cartoonAvatars.length];
                  const username = entry.username ?? 'Unknown user';

                  return (
                    <TableRow key={`${username}-${entry.total_points}`}>
                      <TableCell>
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(
                            entry.rank ?? idx + 1
                          )}`}
                        >
                          {entry.rank}
                        </div>
                      </TableCell>

                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avatar} alt={username} />
                          <AvatarFallback>{username[0]}</AvatarFallback>
                        </Avatar>
                        {username ?? entry.firstName}
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
                            <Button
                              className="cursor-pointer"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => alert(`Viewing ${username}`)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => alert(`Contacting ${username}`)}
                            >
                              Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => alert(`Connecting with ${username}`)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
