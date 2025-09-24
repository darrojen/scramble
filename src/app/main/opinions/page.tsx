'use client';

import { ArrowDown, Heart, MessageCircle, ThumbsDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { getCurrentUser, supabase } from '@/lib/supabaseClient';

import { Button } from '@/components/ui/button';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';
import Textarea from '@/components/ui/textarea';
import { toast } from 'sonner';

// Define interfaces
interface User {
  username: string;
  avatar_url?: string | null;
}
interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
  likes: string[];
  dislikes: string[];
  parent_comment_id?: string | null;
  replies?: Comment[];
}

interface Opinion {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
  likes: { user_id: string }[];
  dislikes: { user_id: string }[];
  comments: Comment[];
}

interface OpinionPayload {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface CommentPayload {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  opinion_id: string;
  parent_comment_id?: string | null;
  likes: string[];
  dislikes: string[];
}

interface LikeDislikePayload {
  opinion_id?: string;
  comment_id?: string;
  user_id: string;
}

interface SupabaseUser {
  username: string;
  avatar_url?: string | null;
}

interface SupabaseComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_comment_id?: string | null;
  likes: string[];
  dislikes: string[];
  user: SupabaseUser;
}

interface SupabaseOpinion {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: SupabaseUser;
  likes: { user_id: string }[];
  dislikes: { user_id: string }[];
  comments: SupabaseComment[];
}

interface CurrentUser {
  id: string;
  username?: string;
  avatar_url?: string | null;
}

interface GroupedOpinions {
  date: string;
  label: string;
  opinions: Opinion[];
}

// Helper function for mutual exclusivity in Supabase
const ensureMutualExclusivity = async (
  table: 'opinion_likes' | 'opinion_dislikes' | 'opinion_comments',
  idField: 'opinion_id' | 'comment_id',
  idValue: string,
  userId: string,
  isLike: boolean
) => {
  const oppositeTable = table === 'opinion_likes' ? 'opinion_dislikes' : 'opinion_likes';
  const [deleteResult, insertResult] = await Promise.all([
    supabase
      .from(oppositeTable)
      .delete()
      .eq(idField, idValue)
      .eq('user_id', userId),
    table !== 'opinion_comments'
      ? supabase
          .from(table)
          .upsert([{ [idField]: idValue, user_id: userId }], { onConflict: `${idField},user_id` })
      : null,
  ]);

  if (deleteResult.error) {
    console.error(`Error removing from ${oppositeTable}:`, deleteResult.error);
    throw new Error(`Failed to remove ${isLike ? 'dislike' : 'like'}.`);
  }
  if (insertResult?.error) {
    console.error(`Error adding to ${table}:`, insertResult.error);
    throw new Error(`Failed to ${isLike ? 'like' : 'dislike'}.`);
  }

  if (table === 'opinion_comments') {
    const { data: comment, error: fetchError } = await supabase
      .from('opinion_comments')
      .select('likes, dislikes')
      .eq('id', idValue)
      .single();
    if (fetchError || !comment) {
      throw new Error('Failed to fetch comment.');
    }
    const updatedLikes = isLike
      ? comment.likes.includes(userId)
        ? comment.likes.filter((id: string) => id !== userId)
        : [...comment.likes, userId]
      : comment.likes.filter((id: string) => id !== userId);
    const updatedDislikes = !isLike
      ? comment.dislikes.includes(userId)
        ? comment.dislikes.filter((id: string) => id !== userId)
        : [...comment.dislikes, userId]
      : comment.dislikes.filter((id: string) => id !== userId);
    const { error } = await supabase
      .from('opinion_comments')
      .update({ likes: updatedLikes, dislikes: updatedDislikes })
      .eq('id', idValue);
    if (error) {
      throw new Error(`Failed to update comment ${isLike ? 'likes' : 'dislikes'}.`);
    }
  }
};

export default function Opinions() {
  const [newOpinion, setNewOpinion] = useState<string>('');
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const opinionsContainerRef = useRef<HTMLDivElement>(null);

  // Sync online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track scroll position for auto-scroll and button visibility
  useEffect(() => {
    const container = opinionsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user: CurrentUser | null = await getCurrentUser();
        setCurrentUser(user || null);
        console.log('Current user:', user || 'null');
      } catch (error: unknown) {
        console.error('Error fetching current user:', error);
        toast.error('Failed to load current user.');
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch opinions
  const { data: opinions = [], isLoading: isLoadingOpinions }: UseQueryResult<Opinion[], Error> = useQuery({
    queryKey: ['opinions'],
    queryFn: async (): Promise<Opinion[]> => {
      const { data, error } = await supabase
        .from('opinions')
        .select(
          `
          id, user_id, content, created_at,
          user:profiles!opinions_user_id_fkey(username, avatar_url),
          likes:opinion_likes(user_id),
          dislikes:opinion_dislikes(user_id),
          comments:opinion_comments(
            id, user_id, content, created_at, parent_comment_id, likes, dislikes,
            user:profiles!opinion_comments_user_id_fkey(username, avatar_url)
          )
        `
        )
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching opinions:', error);
        throw new Error('Failed to load opinions.');
      }

      const nestedData = ((data as SupabaseOpinion[]) || []).map(opinion => ({
        ...opinion,
        comments: nestComments(opinion.comments || []),
      }));
      console.log('Fetched opinions:', nestedData);
      return nestedData as Opinion[];
    },
    enabled: isOnline,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Group opinions by date
  const groupedOpinions: GroupedOpinions[] = opinions.reduce(
    (acc: GroupedOpinions[], opinion) => {
      const date = new Date(opinion.created_at);
      let label: string;
      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else {
        label = formatDistanceToNow(date, { addSuffix: true });
      }
      const dateKey = format(date, 'yyyy-MM-dd');
      const existingGroup = acc.find(group => group.date === dateKey);
      if (existingGroup) {
        existingGroup.opinions.push(opinion);
      } else {
        acc.push({ date: dateKey, label, opinions: [opinion] });
      }
      return acc;
    },
    []
  );

  // Helper to nest comments
  const nestComments = (comments: SupabaseComment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const topLevel: Comment[] = [];

    comments.forEach(comment => {
      const typedComment: Comment = { ...comment, replies: [] };
      commentMap.set(comment.id, typedComment);
    });

    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push({ ...comment, replies: [] });
        }
      } else {
        topLevel.push(commentMap.get(comment.id)!);
      }
    });

    return topLevel;
  };

  // Scroll to the most recent opinion or bottom
  const scrollToBottom = () => {
    if (opinionsContainerRef.current) {
      console.log('Scroll button clicked or triggered');
      if (opinions.length > 0) {
        const lastOpinion = opinionsContainerRef.current.querySelector(
          `[data-opinion-id="${opinions[opinions.length - 1].id}"]`
        );
        if (lastOpinion) {
          console.log('Scrolling to last opinion:', opinions[opinions.length - 1].id);
          lastOpinion.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        console.log('Last opinion not found, scrolling to container bottom');
      } else {
        console.log('No opinions available, scrolling to container bottom');
      }
      opinionsContainerRef.current.scrollTop = opinionsContainerRef.current.scrollHeight;
    } else {
      console.log('Container ref not available');
    }
  };

  // Auto-scroll on new content if near bottom
  const autoScrollOnNewContent = () => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  };

  // Trigger auto-scroll on new opinions/comments
  useEffect(() => {
    if (opinions.length > 0) {
      autoScrollOnNewContent();
    }
  }, [opinions]);

  // Handle incoming opinion
  const handleIncomingOpinion = async (payload: { new: OpinionPayload }) => {
    if (!isOnline || payload.new.user_id === currentUser?.id) {
      console.log('Skipping opinion event:', {
        isOnline,
        user_id: payload.new.user_id,
        currentUserId: currentUser?.id,
      });
      return;
    }

    console.log('Received opinion event:', payload);
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', payload.new.user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user for opinion:', userError);
      toast.error('Failed to load user profile.');
      return;
    }

    const newOpinion: Opinion = {
      ...payload.new,
      user: userData,
      likes: [],
      dislikes: [],
      comments: [],
    };

    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return [newOpinion];
      if (old.some(op => op.id === newOpinion.id)) {
        console.log('Opinion already exists in cache:', newOpinion.id);
        return old;
      }
      const updated = [...old, newOpinion];
      console.log('Updated opinions cache with new opinion:', updated);
      setTimeout(autoScrollOnNewContent, 100);
      return updated;
    });
  };

  // Handle incoming opinion like
  const handleIncomingOpinionLike = (payload: { new?: LikeDislikePayload; old?: LikeDislikePayload }) => {
    const userId = payload.new?.user_id || payload.old?.user_id;
    if (!isOnline || userId === currentUser?.id) {
      console.log('Skipping opinion like event:', { isOnline, userId, currentUserId: currentUser?.id });
      return;
    }

    console.log('Received opinion like event:', payload);
    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map(op => {
        if (payload.new && op.id === payload.new.opinion_id) {
          if (op.likes.some(l => l.user_id === payload.new!.user_id)) return op;
          return {
            ...op,
            likes: [...op.likes, { user_id: payload.new!.user_id }],
            dislikes: op.dislikes.filter(d => d.user_id !== payload.new!.user_id),
          };
        }
        if (payload.old && op.id === payload.old.opinion_id) {
          return {
            ...op,
            likes: op.likes.filter(l => l.user_id !== payload.old!.user_id),
          };
        }
        return op;
      });
      console.log('Updated opinions cache with like:', updated);
      return updated;
    });
  };

  // Handle incoming opinion dislike
  const handleIncomingOpinionDislike = (payload: { new?: LikeDislikePayload; old?: LikeDislikePayload }) => {
    const userId = payload.new?.user_id || payload.old?.user_id;
    if (!isOnline || userId === currentUser?.id) {
      console.log('Skipping opinion dislike event:', { isOnline, userId, currentUserId: currentUser?.id });
      return;
    }

    console.log('Received opinion dislike event:', payload);
    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map(op => {
        if (payload.new && op.id === payload.new.opinion_id) {
          if (op.dislikes.some(d => d.user_id === payload.new!.user_id)) return op;
          return {
            ...op,
            dislikes: [...op.dislikes, { user_id: payload.new!.user_id }],
            likes: op.likes.filter(l => l.user_id !== payload.new!.user_id),
          };
        }
        if (payload.old && op.id === payload.old.opinion_id) {
          return {
            ...op,
            dislikes: op.dislikes.filter(d => d.user_id !== payload.old!.user_id),
          };
        }
        return op;
      });
      console.log('Updated opinions cache with dislike:', updated);
      return updated;
    });
  };

  // Handle incoming comment
  const handleIncomingComment = async (payload: { new: CommentPayload }) => {
    if (!isOnline || payload.new.user_id === currentUser?.id) {
      console.log('Skipping comment event:', {
        isOnline,
        user_id: payload.new.user_id,
        currentUserId: currentUser?.id,
      });
      return;
    }

    console.log('Received comment event:', payload);
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', payload.new.user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user for comment:', userError);
      toast.error('Failed to load user profile.');
      return;
    }

    const newComment: Comment = {
      ...payload.new,
      user: userData,
      likes: payload.new.likes || [],
      dislikes: payload.new.dislikes || [],
      parent_comment_id: payload.new.parent_comment_id,
    };

    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map(op => {
        if (op.id !== payload.new.opinion_id) return op;
        const comments = nestComments([...op.comments, newComment]);
        return { ...op, comments };
      });
      console.log('Updated opinions cache with comment:', updated);
      setTimeout(autoScrollOnNewContent, 100);
      return updated;
    });
  };

  // Handle incoming comment like/dislike
  const handleIncomingCommentLikeDislike = (payload: { new?: CommentPayload; old?: CommentPayload }) => {
    const userId = payload.new?.user_id || payload.old?.user_id;
    if (!isOnline || userId === currentUser?.id) {
      console.log('Skipping comment like/dislike event:', { isOnline, userId, currentUserId: currentUser?.id });
      return;
    }

    console.log('Received comment like/dislike event:', payload);
    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map(op => {
        if (op.id !== (payload.new?.opinion_id || payload.old?.opinion_id)) return op;
        const comments = op.comments.map(c => {
          if (c.id !== (payload.new?.id || payload.old?.id)) return c;
          return {
            ...c,
            likes: payload.new ? payload.new.likes : c.likes,
            dislikes: payload.new ? payload.new.dislikes : c.dislikes,
          };
        });
        return { ...op, comments: nestComments(comments) };
      });
      console.log('Updated opinions cache with comment like/dislike:', updated);
      return updated;
    });
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!isOnline || !currentUser?.id) {
      console.log('Subscriptions skipped: isOnline=', isOnline, 'currentUserId=', currentUser?.id);
      return;
    }

    const opinionsChannel = supabase
      .channel('opinions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinions' }, handleIncomingOpinion)
      .subscribe((status: REALTIME_SUBSCRIBE_STATES, err?: Error) => {
        console.log('Opinions channel status:', status, err ? `Error: ${err.message}` : '');
        if (err) {
          toast.error('Failed to subscribe to opinions: ' + err.message);
        }
      });

    const likesChannel = supabase
      .channel('opinion_likes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opinion_likes' }, payload => {
        setTimeout(() => handleIncomingOpinionLike(payload), 100);
      })
      .subscribe((status: REALTIME_SUBSCRIBE_STATES, err?: Error) => {
        console.log('Likes channel status:', status, err ? `Error: ${err.message}` : '');
        if (err) {
          toast.error('Failed to subscribe to likes: ' + err.message);
        }
      });

    const dislikesChannel = supabase
      .channel('opinion_dislikes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opinion_dislikes' }, payload => {
        setTimeout(() => handleIncomingOpinionDislike(payload), 100);
      })
      .subscribe((status: REALTIME_SUBSCRIBE_STATES, err?: Error) => {
        console.log('Dislikes channel status:', status, err ? `Error: ${err.message}` : '');
        if (err) {
          toast.error('Failed to subscribe to dislikes: ' + err.message);
        }
      });

    const commentsChannel = supabase
      .channel('opinion_comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_comments' }, handleIncomingComment)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'opinion_comments' }, payload => {
        setTimeout(() => handleIncomingCommentLikeDislike(payload), 100);
      })
      .subscribe((status: REALTIME_SUBSCRIBE_STATES, err?: Error) => {
        console.log('Comments channel status:', status, err ? `Error: ${err.message}` : '');
        if (err) {
          toast.error('Failed to subscribe to comments: ' + err.message);
        }
      });

    return () => {
      console.log('Removing subscriptions');
      supabase.removeChannel(opinionsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(dislikesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [isOnline, currentUser, queryClient]);

  // Post opinion mutation
  const postOpinionMutation: UseMutationResult<Opinion, Error, { content: string }, { previousOpinions?: Opinion[] }> =
    useMutation({
      mutationFn: async ({ content }: { content: string }): Promise<Opinion> => {
        if (!currentUser?.id || !isOnline) {
          throw new Error('User not authenticated or offline.');
        }
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUser.id)
          .single();
        if (userError || !userData) {
          throw new Error('Failed to fetch user profile.');
        }
        const { data: insertedOpinion, error } = await supabase
          .from('opinions')
          .insert({ user_id: currentUser.id, content })
          .select(
            `
            id, user_id, content, created_at,
            user:profiles!opinions_user_id_fkey(username, avatar_url),
            likes:opinion_likes(user_id),
            dislikes:opinion_dislikes(user_id),
            comments:opinion_comments(id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!opinion_comments_user_id_fkey(username, avatar_url))
          `
          )
          .single();
        if (error || !insertedOpinion) {
          console.error('Error posting opinion:', error);
          throw new Error('Failed to post opinion.');
        }
        return {
          ...insertedOpinion,
          user: userData,
          comments: nestComments(
            (insertedOpinion.comments || []).map(c => ({
              ...c,
              user: c.user?.[0] // 👈 flatten the array to a single object
                ? {
                    username: c.user[0].username,
                    avatar_url: c.user[0].avatar_url,
                  }
                : { username: '', avatar_url: '' }, // fallback
            }))
          ),
        } as Opinion;
        
        // return {
        //   ...insertedOpinion,
        //   user: userData,
        //   comments: nestComments(insertedOpinion.comments || []),
        // } as Opinion;
      },
      onMutate: async ({ content }: { content: string }) => {
        await queryClient.cancelQueries({ queryKey: ['opinions'] });
        const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
        const { data: userData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUser?.id)
          .single();
        if (!userData) {
          throw new Error('Failed to fetch user profile for optimistic update.');
        }
        const tempOpinion: Opinion = {
          id: `temp-${Date.now()}`,
          user_id: currentUser!.id,
          content,
          created_at: new Date().toISOString(),
          user: userData,
          likes: [],
          dislikes: [],
          comments: [],
        };
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = [...(old || []), tempOpinion];
          console.log('Optimistic update for opinion:', updated);
          return updated;
        });
        return { previousOpinions };
      },
      onError: (err: Error, _vars, context) => {
        console.error('Error in postOpinion mutation:', err);
        toast.error(err.message || 'Failed to post opinion.');
        queryClient.setQueryData(['opinions'], context?.previousOpinions);
      },
      onSuccess: (insertedOpinion: Opinion) => {
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old
            ? old.filter(op => !op.id.startsWith('temp-')).concat(insertedOpinion)
            : [insertedOpinion];
          console.log('Updated opinions cache with server opinion:', updated);
          setTimeout(autoScrollOnNewContent, 100);
          return updated;
        });
        toast.success('Opinion posted!');
      },
    });

  // Like/unlike opinion mutation
  const likeOpinionMutation: UseMutationResult<void, Error, { opinionId: string; isLiked: boolean }, { previousOpinions?: Opinion[] }> =
    useMutation({
      mutationFn: async ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) => {
        if (!currentUser?.id || !isOnline) {
          throw new Error('User not authenticated or offline.');
        }
        await ensureMutualExclusivity('opinion_likes', 'opinion_id', opinionId, currentUser.id, !isLiked);
      },
      onMutate: async ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) => {
        await queryClient.cancelQueries({ queryKey: ['opinions'] });
        const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old?.map(op =>
            op.id === opinionId
              ? {
                  ...op,
                  likes: isLiked
                    ? op.likes.filter(l => l.user_id !== currentUser!.id)
                    : [...op.likes, { user_id: currentUser!.id }],
                  dislikes: isLiked ? op.dislikes : op.dislikes.filter(d => d.user_id !== currentUser!.id),
                }
              : op
          );
          console.log('Optimistic update for opinion like:', updated);
          return updated;
        });
        return { previousOpinions };
      },
      onError: (err: Error, { isLiked }, context) => {
        console.error('Error in likeOpinion mutation:', err);
        toast.error(err.message || `Failed to ${isLiked ? 'unlike' : 'like'} opinion.`);
        queryClient.setQueryData(['opinions'], context?.previousOpinions);
      },
      onSuccess: (_: void, { isLiked }: { opinionId: string; isLiked: boolean }) => {
        toast.success(isLiked ? 'Opinion unliked!' : 'Opinion liked!');
      },
    });

  // Dislike/undislike opinion mutation
  const dislikeOpinionMutation: UseMutationResult<void, Error, { opinionId: string; isDisliked: boolean }, { previousOpinions?: Opinion[] }> =
    useMutation({
      mutationFn: async ({ opinionId }: { opinionId: string; isDisliked: boolean }) => {
        if (!currentUser?.id || !isOnline) {
          throw new Error('User not authenticated or offline.');
        }
        await ensureMutualExclusivity('opinion_dislikes', 'opinion_id', opinionId, currentUser.id, false);
      },
      onMutate: async ({ opinionId, isDisliked }: { opinionId: string; isDisliked: boolean }) => {
        await queryClient.cancelQueries({ queryKey: ['opinions'] });
        const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old?.map(op =>
            op.id === opinionId
              ? {
                  ...op,
                  dislikes: isDisliked
                    ? op.dislikes.filter(d => d.user_id !== currentUser!.id)
                    : [...op.dislikes, { user_id: currentUser!.id }],
                  likes: isDisliked ? op.likes : op.likes.filter(l => l.user_id !== currentUser!.id),
                }
              : op
          );
          console.log('Optimistic update for opinion dislike:', updated);
          return updated;
        });
        return { previousOpinions };
      },
      onError: (err: Error, {  isDisliked }, context) => {
        console.error('Error in dislikeOpinion mutation:', err);
        toast.error(err.message || `Failed to ${isDisliked ? 'undislike' : 'dislike'} opinion.`);
        queryClient.setQueryData(['opinions'], context?.previousOpinions);
      },
      onSuccess: (_: void, { isDisliked }: { opinionId: string; isDisliked: boolean }) => {
        toast.success(isDisliked ? 'Opinion undisliked!' : 'Opinion disliked!');
      },
    });

  // Post comment mutation
  const postCommentMutation: UseMutationResult<Comment, Error, { opinionId: string; content: string; parentCommentId?: string }, { previousOpinions?: Opinion[] }> =
    useMutation({
      mutationFn: async ({ opinionId, content, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }): Promise<Comment> => {
        if (!currentUser?.id || !isOnline) {
          throw new Error('User not authenticated or offline.');
        }
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUser.id)
          .single();
        if (userError || !userData) {
          throw new Error('Failed to fetch user profile.');
        }
        const { data: insertedComment, error } = await supabase
          .from('opinion_comments')
          .insert({
            opinion_id: opinionId,
            user_id: currentUser.id,
            content,
            parent_comment_id: parentCommentId,
          })
          .select(
            'id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!opinion_comments_user_id_fkey(username, avatar_url)'
          )
          .single();
        if (error || !insertedComment) {
          console.error('Error posting comment:', error);
          throw new Error('Failed to post comment.');
        }
        return { ...insertedComment, user: userData } as Comment;
      },
      onMutate: async ({ opinionId, content, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }) => {
        await queryClient.cancelQueries({ queryKey: ['opinions'] });
        const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
        const { data: userData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUser?.id)
          .single();
        if (!userData) {
          throw new Error('Failed to fetch user profile for optimistic update.');
        }
        const tempComment: Comment = {
          id: `temp-${Date.now()}`,
          user_id: currentUser!.id,
          content,
          created_at: new Date().toISOString(),
          user: userData,
          likes: [],
          dislikes: [],
          parent_comment_id: parentCommentId,
          replies: [],
        };
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old?.map(op => {
            if (op.id !== opinionId) return op;
            let comments = [...op.comments];
            if (parentCommentId) {
              comments = comments.map(c =>
                c.id === parentCommentId
                  ? { ...c, replies: [...(c.replies || []), tempComment] }
                  : c
              );
            } else {
              comments.push(tempComment);
            }
            return { ...op, comments: nestComments(comments) };
          });
          console.log('Optimistic update for comment:', updated);
          return updated;
        });
        return { previousOpinions };
      },

      
      onError: (err: Error, context) => {
        console.error('Error in postComment mutation:', err);
        toast.error(err.message || 'Failed to post comment.');
        queryClient.setQueryData(['opinions'], context?.previousOpinions);
      },
      onSuccess: (insertedComment: Comment, { opinionId, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }) => {
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old?.map(op => {
            if (op.id !== opinionId) return op;
            let comments = [...op.comments].filter(c => !c.id.startsWith('temp-'));
            if (parentCommentId) {
              comments = comments.map(c =>
                c.id === parentCommentId
                  ? {
                      ...c,
                      replies: [...(c.replies || []).filter(r => !r.id.startsWith('temp-')), insertedComment],
                    }
                  : c
              );
            } else {
              comments.push(insertedComment);
            }
            return { ...op, comments: nestComments(comments) };
          });
          console.log('Updated opinions cache with server comment:', updated);
          setTimeout(autoScrollOnNewContent, 100);
          return updated;
        });
        toast.success('Comment posted!');
      },
    });

  // Like/unlike comment mutation
  const likeCommentMutation: UseMutationResult<void, Error, { commentId: string; isLiked: boolean }, { previousOpinions?: Opinion[] }> =
    useMutation({
      mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
        if (!currentUser?.id || !isOnline) {
          throw new Error('User not authenticated or offline.');
        }
        await ensureMutualExclusivity('opinion_comments', 'comment_id', commentId, currentUser.id, !isLiked);
      },
      onMutate: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
        await queryClient.cancelQueries({ queryKey: ['opinions'] });
        const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old?.map(op => ({
            ...op,
            comments: nestComments(
              op.comments.map(c =>
                c.id === commentId
                  ? {
                      ...c,
                      likes: isLiked ? c.likes.filter(id => id !== currentUser!.id) : [...c.likes, currentUser!.id],
                      dislikes: isLiked ? c.dislikes : c.dislikes.filter(id => id !== currentUser!.id),
                    }
                  : {
                      ...c,
                      replies: (c.replies || []).map(r =>
                        r.id === commentId
                          ? {
                              ...r,
                              likes: isLiked
                                ? r.likes.filter(id => id !== currentUser!.id)
                                : [...r.likes, currentUser!.id],
                              dislikes: isLiked
                                ? r.dislikes
                                : r.dislikes.filter(id => id !== currentUser!.id),
                            }
                          : r
                      ),
                    }
              )
            ),
          }));
          console.log('Optimistic update for comment like:', updated);
          return updated;
        });
        return { previousOpinions };
      },
      onError: (err: Error, {  isLiked }, context) => {
        console.error('Error in likeComment mutation:', err);
        toast.error(err.message || `Failed to ${isLiked ? 'unlike' : 'like'} comment.`);
        queryClient.setQueryData(['opinions'], context?.previousOpinions);
      },
      onSuccess: (_: void, { isLiked }: { commentId: string; isLiked: boolean }) => {
        toast.success(isLiked ? 'Comment unliked!' : 'Comment liked!');
      },
    });

  // Dislike/undislike comment mutation
  const dislikeCommentMutation: UseMutationResult<void, Error, { commentId: string; isDisliked: boolean }, { previousOpinions?: Opinion[] }> =
    useMutation({
      mutationFn: async ({ commentId }: { commentId: string; isDisliked: boolean }) => {
        if (!currentUser?.id || !isOnline) {
          throw new Error('User not authenticated or offline.');
        }
        await ensureMutualExclusivity('opinion_comments', 'comment_id', commentId, currentUser.id, false);
      },
      onMutate: async ({ commentId, isDisliked }: { commentId: string; isDisliked: boolean }) => {
        await queryClient.cancelQueries({ queryKey: ['opinions'] });
        const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
        queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
          const updated = old?.map(op => ({
            ...op,
            comments: nestComments(
              op.comments.map(c =>
                c.id === commentId
                  ? {
                      ...c,
                      dislikes: isDisliked
                        ? c.dislikes.filter(id => id !== currentUser!.id)
                        : [...c.dislikes, currentUser!.id],
                      likes: isDisliked ? c.likes : c.likes.filter(id => id !== currentUser!.id),
                    }
                  : {
                      ...c,
                      replies: (c.replies || []).map(r =>
                        r.id === commentId
                          ? {
                              ...r,
                              dislikes: isDisliked
                                ? r.dislikes.filter(id => id !== currentUser!.id)
                                : [...r.dislikes, currentUser!.id],
                              likes: isDisliked
                                ? r.likes
                                : r.likes.filter(id => id !== currentUser!.id),
                            }
                          : r
                      ),
                    }
              )
            ),
          }));
          console.log('Optimistic update for comment dislike:', updated);
          return updated;
        });
        return { previousOpinions };
      },
      onError: (err: Error, { isDisliked }, context) => {
        console.error('Error in dislikeComment mutation:', err);
        toast.error(err.message || `Failed to ${isDisliked ? 'undislike' : 'dislike'} comment.`);
        queryClient.setQueryData(['opinions'], context?.previousOpinions);
      },
      onSuccess: (_: void, { isDisliked }: { commentId: string; isDisliked: boolean }) => {
        toast.success(isDisliked ? 'Comment undisliked!' : 'Comment disliked!');
      },
    });

  // Handle submitting a new opinion
  const handleSubmitOpinion = () => {
    if (!newOpinion.trim() || !isOnline) {
      toast.error(isOnline ? 'Please enter an opinion.' : 'Cannot post opinion: No internet connection.');
      return;
    }
    postOpinionMutation.mutate({ content: newOpinion });
    setNewOpinion('');
  };

  // Handle Enter key for opinion submission
  const handleOpinionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitOpinion();
    }
  };

  // Handle liking/unliking an opinion
  const handleLikeOpinion = (opinionId: string) => {
    if (!currentUser?.id || !isOnline) {
      toast.error('Cannot like opinion: No internet connection.');
      return;
    }
    const opinion = opinions.find(o => o.id === opinionId);
    const isLiked = opinion?.likes.some(like => like.user_id === currentUser.id);
    likeOpinionMutation.mutate({ opinionId, isLiked: !!isLiked });
  };

  // Handle disliking/undisliking an opinion
  const handleDislikeOpinion = (opinionId: string) => {
    if (!currentUser?.id || !isOnline) {
      toast.error('Cannot dislike opinion: No internet connection.');
      return;
    }
    const opinion = opinions.find(o => o.id === opinionId);
    const isDisliked = opinion?.dislikes.some(dislike => dislike.user_id === currentUser.id);
    dislikeOpinionMutation.mutate({ opinionId, isDisliked: !!isDisliked });
  };

  // Handle submitting a comment
  const handleSubmitComment = (opinionId: string, parentCommentId?: string) => {
    const key = opinionId + (parentCommentId || '');
    const content = commentContent[key]?.trim();
    if (!content || !isOnline) {
      toast.error(isOnline ? 'Please enter a comment.' : 'Cannot post comment: No internet connection.');
      return;
    }
    postCommentMutation.mutate({ opinionId, content, parentCommentId });
    setCommentContent(prev => ({ ...prev, [key]: '' }));
  };

  // Handle Enter key for comment submission
  const handleCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, opinionId: string, parentCommentId?: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(opinionId, parentCommentId);
    }
  };

  // Handle liking/unliking a comment
  const handleLikeComment = (commentId: string) => {
    if (!currentUser?.id || !isOnline) {
      toast.error('Cannot like comment: No internet connection.');
      return;
    }
    const opinion = opinions.find(op => op.comments.some(c => c.id === commentId || (c.replies || []).some(r => r.id === commentId)));
    const comment = opinion?.comments.find(c => c.id === commentId) || opinion?.comments.flatMap(c => c.replies || []).find(r => r.id === commentId);
    const isLiked = comment?.likes.includes(currentUser!.id);
    likeCommentMutation.mutate({ commentId, isLiked: !!isLiked });
  };

  // Handle disliking/undisliking a comment
  const handleDislikeComment = (commentId: string) => {
    if (!currentUser?.id || !isOnline) {
      toast.error('Cannot dislike comment: No internet connection.');
      return;
    }
    const opinion = opinions.find(op => op.comments.some(c => c.id === commentId || (c.replies || []).some(r => r.id === commentId)));
    const comment = opinion?.comments.find(c => c.id === commentId) || opinion?.comments.flatMap(c => c.replies || []).find(r => r.id === commentId);
    const isDisliked = comment?.dislikes.includes(currentUser!.id);
    dislikeCommentMutation.mutate({ commentId, isDisliked: !!isDisliked });
  };

  // Toggle comments visibility
  const toggleComments = (opinionId: string) => {
    setShowComments(prev => ({
      ...prev,
      [opinionId]: !prev[opinionId],
    }));
    if (!showComments[opinionId]) {
      setCommentContent(prev => ({
        ...prev,
        [opinionId]: prev[opinionId] || '',
      }));
    }
  };

  // Render comment with replies
  const renderComment = (comment: Comment, opinionId: string, level: number = 0) => (
    <div key={comment.id} className={`flex items-start gap-3 ${level > 0 ? 'ml-10' : ''} py-2`}>
      <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-gray-700">
        <AvatarImage src={comment.user.avatar_url || ''} alt={comment.user.username} />
        <AvatarFallback className="text-xs font-medium">{comment.user.username?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {comment.user.username}
            {comment.user_id === currentUser?.id && ' (You)'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </p>
        </div>
        <p className="text-sm text-foreground mt-1">{comment.content}</p>
        <div className="flex gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${comment.likes.includes(currentUser?.id || '') ? 'text-red-500' : ''}`}
            disabled={likeCommentMutation.isPending || !isOnline}
          >
            <Heart className="h-4 w-4" fill={comment.likes.includes(currentUser?.id || '') ? 'currentColor' : 'none'} />
            <span className="text-xs">{comment.likes.length || ''}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDislikeComment(comment.id)}
            className={`flex items-center gap-1 text-muted-foreground hover:text-gray-600 transition-colors ${comment.dislikes.includes(currentUser?.id || '') ? 'text-gray-600' : ''}`}
            disabled={dislikeCommentMutation.isPending || !isOnline}
          >
            <ThumbsDown className="h-4 w-4" fill={comment.dislikes.includes(currentUser?.id || '') ? 'currentColor' : 'none'} />
            <span className="text-xs">{comment.dislikes.length || ''}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
            onClick={() => setCommentContent(prev => ({ ...prev, [opinionId + comment.id]: prev[opinionId + comment.id] || '' }))}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{comment.replies ? comment.replies.length : ''}</span>
          </Button>
        </div>
        {commentContent[opinionId + comment.id] !== undefined && (
          <div className="mt-3 flex gap-2">
            <Textarea
              value={commentContent[opinionId + comment.id] || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setCommentContent(prev => ({ ...prev, [opinionId + comment.id]: e.target.value }))
              }
              onKeyDown={(e) => handleCommentKeyDown(e, opinionId, comment.id)}
              placeholder="Reply to this comment..."
              className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 shadow-sm min-h-[60px] max-h-[120px] resize-y"
              disabled={!isOnline}
            />
            <Button
              size="sm"
              onClick={() => handleSubmitComment(opinionId, comment.id)}
              className="rounded-full px-4 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors"
              disabled={postCommentMutation.isPending || !isOnline}
            >
              Reply
            </Button>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, opinionId, level + 1))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col">
      <div className="flex-1 max-h-[100vh] overflow-y-auto pb-28" ref={opinionsContainerRef}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {isLoadingOpinions ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-28 w-full rounded-xl shadow-sm" />
              ))}
            </div>
          ) : opinions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No opinions yet.</p>
          ) : (
            <div className="space-y-6">
              {groupedOpinions.map(group => (
                <div key={group.date} className="space-y-4">
                  <div className="sticky top-0 z-10 py-2">
                    <p className="text-xs text-muted-foreground text-center font-medium">{group.label}</p>
                  </div>
                  {group.opinions.map(opinion => (
                    <Card
                      key={opinion.id}
                      data-opinion-id={opinion.id}
                      className="border-x-0 border-t-0 border-b border-gray-200 dark:border-gray-700 rounded-none shadow-sm transition-shadow hover:shadow-md"
                    >
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 ring-1 ring-gray-200 dark:ring-gray-700">
                            <AvatarImage src={opinion.user.avatar_url || ''} alt={opinion.user.username} />
                            <AvatarFallback className="text-sm font-medium">{opinion.user.username?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold text-foreground">
                                {opinion.user.username}
                                {opinion.user_id === currentUser?.id && ' (You)'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(opinion.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-sm text-foreground mt-2 leading-relaxed">{opinion.content}</p>
                            <div className="flex gap-4 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeOpinion(opinion.id)}
                                className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${
                                  opinion.likes.some(like => like.user_id === currentUser?.id) ? 'text-red-500' : ''
                                }`}
                                disabled={likeOpinionMutation.isPending || !isOnline}
                              >
                                <Heart
                                  className="h-4 w-4"
                                  fill={opinion.likes.some(like => like.user_id === currentUser?.id) ? 'currentColor' : 'none'}
                                />
                                <span className="text-xs">{opinion.likes.length || ''}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDislikeOpinion(opinion.id)}
                                className={`flex items-center gap-1 text-muted-foreground hover:text-gray-600 transition-colors ${
                                  opinion.dislikes.some(dislike => dislike.user_id === currentUser?.id) ? 'text-gray-600' : ''
                                }`}
                                disabled={dislikeOpinionMutation.isPending || !isOnline}
                              >
                                <ThumbsDown
                                  className="h-4 w-4"
                                  fill={opinion.dislikes.some(dislike => dislike.user_id === currentUser?.id) ? 'currentColor' : 'none'}
                                />
                                <span className="text-xs">{opinion.dislikes.length || ''}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                                onClick={() => toggleComments(opinion.id)}
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{opinion.comments.length || ''} {showComments[opinion.id] ? 'Hide' : 'Show'}</span>
                              </Button>
                            </div>
                            {showComments[opinion.id] && (
                              <>
                                {commentContent[opinion.id] !== undefined && (
                                  <div className="mt-4 flex gap-2">
                                    <Textarea
                                      value={commentContent[opinion.id] || ''}
                                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                        setCommentContent(prev => ({ ...prev, [opinion.id]: e.target.value }))
                                      }
                                      onKeyDown={(e) => handleCommentKeyDown(e, opinion.id)}
                                      placeholder="Reply to this opinion..."
                                      className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 shadow-sm min-h-[60px] max-h-[120px] resize-y"
                                      disabled={!isOnline}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleSubmitComment(opinion.id)}
                                      className="rounded-full px-4 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors"
                                      disabled={postCommentMutation.isPending || !isOnline}
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                )}
                                {opinion.comments.length > 0 && (
                                  <div className="mt-4 space-y-4">
                                    {opinion.comments.map(comment => renderComment(comment, opinion.id))}
                                  </div>
                                )}
                                {opinion.comments.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-4 text-muted-foreground hover:text-blue-500 transition-colors"
                                    onClick={() => toggleComments(opinion.id)}
                                  >
                                    Show Less
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showScrollButton && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-24 right-6 z-50 rounded-full shadow-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-muted-foreground hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          onClick={() => {
            console.log('Scroll button clicked');
            scrollToBottom();
          }}
          aria-label="Scroll to most recent"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}

      <div className="fixed bottom-0 left-0 right-0">
        <div
          className="border-t border-gray-200 dark:border-gray-700 py-3 md:pl-64"
          style={{
            background: 'linear-gradient(to right, transparent 16rem, var(--background) 16rem)',
          }}
        >
          <div className="max-w-2xl mx-auto px-3 sm:px-4">
            <div className="flex items-end gap-2 sm:gap-3">
              
              <Textarea
                value={newOpinion}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewOpinion(e.target.value)}
                onKeyDown={handleOpinionKeyDown}
                placeholder="What's your opinion?"
                className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 shadow-sm min-h-[45px] sm:min-h-[60px] max-h-[120px] resize-y transition-shadow hover:shadow-md"
                disabled={!isOnline}
              />
              <Button
                onClick={handleSubmitOpinion}
                className="rounded-full px-4 sm:px-6 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors shrink-0"
                disabled={postOpinionMutation.isPending || !isOnline}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}