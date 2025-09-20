// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { supabase, getCurrentUser } from '@/lib/supabaseClient';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import Textarea from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { toast } from 'sonner';
// import { formatDistanceToNow } from 'date-fns';
// import { Heart, MessageCircle, ThumbsDown } from 'lucide-react';
// import Box from '@/components/ui/box';

// // Define interfaces
// interface User {
//   username: string;
//   avatar_url?: string;
// }

// interface Comment {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   user: User;
//   likes: string[];
//   dislikes: string[];
//   parent_comment_id?: string | null;
//   replies?: Comment[];
// }

// interface Opinion {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   user: User;
//   likes: { user_id: string }[];
//   dislikes: { user_id: string }[];
//   comments: Comment[];
// }

// interface OpinionPayload {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
// }

// interface CommentPayload {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   opinion_id: string;
//   parent_comment_id?: string | null;
//   likes: string[];
//   dislikes: string[];
// }

// interface LikeDislikePayload {
//   opinion_id?: string;
//   comment_id?: string;
//   user_id: string;
// }

// export default function Opinions() {
//   const [newOpinion, setNewOpinion] = useState('');
//   const [commentContent, setCommentContent] = useState<{
//     [key: string]: string;
//   }>({});
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
//   const [isOnline, setIsOnline] = useState(true);
//   const queryClient = useQueryClient();

//   // Sync online/offline state
//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     setIsOnline(navigator.onLine);
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // Fetch current user
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const user = await getCurrentUser();
//         setCurrentUserId(user?.id || null);
//         console.log('Current user ID:', user?.id || 'null');
//       } catch (error) {
//         console.error('Error fetching current user:', error);
//         toast.error('Failed to load current user.');
//       }
//     };
//     fetchCurrentUser();
//   }, []);

//   // Fetch opinions
//   const { data: opinions = [], isLoading: isLoadingOpinions } = useQuery<
//     Opinion[],
//     Error
//   >({
//     queryKey: ['opinions'],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from('opinions')
//         .select(
//           `
//           *,
//           user:profiles!user_id(username, avatar_url),
//           likes:opinion_likes(user_id),
//           dislikes:opinion_dislikes(user_id),
//           comments:opinion_comments(
//             id, user_id, content, created_at, parent_comment_id, likes, dislikes,
//             user:profiles!user_id(username, avatar_url)
//           )
//         `
//         )
//         .order('created_at', { ascending: true }); // Newest at bottom
//       if (error) {
//         console.error('Error fetching opinions:', error);
//         throw new Error('Failed to load opinions.');
//       }
//       // Nest comments with replies
//       const nestedData = (data || []).map(opinion => ({
//         ...opinion,
//         comments: nestComments(opinion.comments || []),
//       }));
//       console.log('Fetched opinions:', nestedData);
//       return nestedData;
//     },
//     enabled: isOnline,
//     retry: 2,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   // Helper to nest comments
//   const nestComments = (comments: Comment[]): Comment[] => {
//     const commentMap = new Map<string, Comment>();
//     const topLevel: Comment[] = [];

//     comments.forEach(comment => {
//       comment.replies = [];
//       commentMap.set(comment.id, comment);
//     });

//     comments.forEach(comment => {
//       if (comment.parent_comment_id) {
//         const parent = commentMap.get(comment.parent_comment_id);
//         if (parent) {
//           parent.replies = parent.replies || [];
//           parent.replies.push(comment);
//         }
//       } else {
//         topLevel.push(comment);
//       }
//     });

//     return topLevel;
//   };

//   // Handle incoming opinion
//   const handleIncomingOpinion = async (payload: { new: OpinionPayload }) => {
//     if (!isOnline || payload.new.user_id === currentUserId) {
//       console.log('Skipping opinion event:', {
//         isOnline,
//         user_id: payload.new.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received opinion event:', payload);
//     const { data: userData, error: userError } = await supabase
//       .from('profiles')
//       .select('username, avatar_url')
//       .eq('id', payload.new.user_id)
//       .single();

//     if (userError) {
//       console.error('Error fetching user for opinion:', userError);
//       toast.error('Failed to load user profile.');
//       return;
//     }

//     const newOpinion: Opinion = {
//       ...payload.new,
//       user: userData || { username: 'Unknown', avatar_url: '' },
//       likes: [],
//       dislikes: [],
//       comments: [],
//     };

//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return [newOpinion];
//       if (old.some(op => op.id === newOpinion.id)) {
//         console.log('Opinion already exists in cache:', newOpinion.id);
//         return old;
//       }
//       const updated = [...old, newOpinion]; // Append to bottom
//       console.log('Updated opinions cache with new opinion:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming opinion like
//   const handleIncomingOpinionLike = (
//     payload: { new: LikeDislikePayload } | { old: LikeDislikePayload }
//   ) => {
//     if (
//       !isOnline ||
//       ('new' in payload ? payload.new.user_id : payload.old.user_id) ===
//         currentUserId
//     ) {
//       console.log('Skipping opinion like event:', {
//         isOnline,
//         user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received opinion like event:', payload);
//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map(op => {
//         if ('new' in payload && op.id === payload.new.opinion_id) {
//           if (op.likes.some(l => l.user_id === payload.new.user_id)) return op;
//           return {
//             ...op,
//             likes: [...op.likes, { user_id: payload.new.user_id }],
//           };
//         }
//         if ('old' in payload && op.id === payload.old.opinion_id) {
//           return {
//             ...op,
//             likes: op.likes.filter(l => l.user_id !== payload.old.user_id),
//           };
//         }
//         return op;
//       });
//       console.log('Updated opinions cache with like:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming opinion dislike
//   const handleIncomingOpinionDislike = (
//     payload: { new: LikeDislikePayload } | { old: LikeDislikePayload }
//   ) => {
//     if (
//       !isOnline ||
//       ('new' in payload ? payload.new.user_id : payload.old.user_id) ===
//         currentUserId
//     ) {
//       console.log('Skipping opinion dislike event:', {
//         isOnline,
//         user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received opinion dislike event:', payload);
//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map(op => {
//         if ('new' in payload && op.id === payload.new.opinion_id) {
//           if (op.dislikes.some(d => d.user_id === payload.new.user_id))
//             return op;
//           return {
//             ...op,
//             dislikes: [...op.dislikes, { user_id: payload.new.user_id }],
//           };
//         }
//         if ('old' in payload && op.id === payload.old.opinion_id) {
//           return {
//             ...op,
//             dislikes: op.dislikes.filter(
//               d => d.user_id !== payload.old.user_id
//             ),
//           };
//         }
//         return op;
//       });
//       console.log('Updated opinions cache with dislike:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming comment
//   const handleIncomingComment = async (payload: { new: CommentPayload }) => {
//     if (!isOnline || payload.new.user_id === currentUserId) {
//       console.log('Skipping comment event:', {
//         isOnline,
//         user_id: payload.new.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received comment event:', payload);
//     const { data: userData, error: userError } = await supabase
//       .from('profiles')
//       .select('username, avatar_url')
//       .eq('id', payload.new.user_id)
//       .single();

//     if (userError) {
//       console.error('Error fetching user for comment:', userError);
//       toast.error('Failed to load user profile.');
//       return;
//     }

//     const newComment: Comment = {
//       ...payload.new,
//       user: userData || { username: 'Unknown', avatar_url: '' },
//       likes: payload.new.likes || [],
//       dislikes: payload.new.dislikes || [],
//       parent_comment_id: payload.new.parent_comment_id,
//     };

//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map(op => {
//         if (op.id !== payload.new.opinion_id) return op;
//         const comments = nestComments([...op.comments, newComment]);
//         return { ...op, comments };
//       });
//       console.log('Updated opinions cache with comment:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming comment like/dislike
//   const handleIncomingCommentLikeDislike = (
//     payload: { new: CommentPayload } | { old: CommentPayload }
//   ) => {
//     if (
//       !isOnline ||
//       ('new' in payload ? payload.new.user_id : payload.old.user_id) ===
//         currentUserId
//     ) {
//       console.log('Skipping comment like/dislike event:', {
//         isOnline,
//         user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received comment like/dislike event:', payload);
//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map(op => {
//         if (
//           op.id !==
//           ('new' in payload ? payload.new.opinion_id : payload.old.opinion_id)
//         )
//           return op;
//         const comments = op.comments.map(c => {
//           if (c.id !== ('new' in payload ? payload.new.id : payload.old.id))
//             return c;
//           return {
//             ...c,
//             likes: 'new' in payload ? payload.new.likes : c.likes,
//             dislikes: 'new' in payload ? payload.new.dislikes : c.dislikes,
//           };
//         });
//         return { ...op, comments: nestComments(comments) };
//       });
//       console.log('Updated opinions cache with comment like/dislike:', updated);
//       return updated;
//     });
//   };

//   // Subscribe to real-time changes
//   useEffect(() => {
//     if (!isOnline || !currentUserId) {
//       console.log(
//         'Subscriptions skipped: isOnline=',
//         isOnline,
//         'currentUserId=',
//         currentUserId
//       );
//       return;
//     }

//     const opinionsChannel = supabase
//       .channel('opinions')
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'opinions' },
//         handleIncomingOpinion
//       )
//       .subscribe((status, error) => {
//         console.log(
//           'Opinions channel status:',
//           status,
//           error ? `Error: ${error.message}` : ''
//         );
//         if (error)
//           toast.error('Failed to subscribe to opinions: ' + error.message);
//       });

//     const likesChannel = supabase
//       .channel('opinion_likes')
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'opinion_likes' },
//         handleIncomingOpinionLike
//       )
//       .on(
//         'postgres_changes',
//         { event: 'DELETE', schema: 'public', table: 'opinion_likes' },
//         handleIncomingOpinionLike
//       )
//       .subscribe((status, error) => {
//         console.log(
//           'Likes channel status:',
//           status,
//           error ? `Error: ${error.message}` : ''
//         );
//         if (error)
//           toast.error('Failed to subscribe to likes: ' + error.message);
//       });

//     const dislikesChannel = supabase
//       .channel('opinion_dislikes')
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'opinion_dislikes' },
//         handleIncomingOpinionDislike
//       )
//       .on(
//         'postgres_changes',
//         { event: 'DELETE', schema: 'public', table: 'opinion_dislikes' },
//         handleIncomingOpinionDislike
//       )
//       .subscribe((status, error) => {
//         console.log(
//           'Dislikes channel status:',
//           status,
//           error ? `Error: ${error.message}` : ''
//         );
//         if (error)
//           toast.error('Failed to subscribe to dislikes: ' + error.message);
//       });

//     const commentsChannel = supabase
//       .channel('opinion_comments')
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'opinion_comments' },
//         handleIncomingComment
//       )
//       .on(
//         'postgres_changes',
//         { event: 'UPDATE', schema: 'public', table: 'opinion_comments' },
//         handleIncomingCommentLikeDislike
//       )
//       .subscribe((status, error) => {
//         console.log(
//           'Comments channel status:',
//           status,
//           error ? `Error: ${error.message}` : ''
//         );
//         if (error)
//           toast.error('Failed to subscribe to comments: ' + error.message);
//       });

//     return () => {
//       console.log('Removing subscriptions');
//       supabase.removeChannel(opinionsChannel);
//       supabase.removeChannel(likesChannel);
//       supabase.removeChannel(dislikesChannel);
//       supabase.removeChannel(commentsChannel);
//     };
//   }, [isOnline, currentUserId]);

//   // Post opinion mutation
//   const postOpinionMutation = useMutation<Opinion, Error, { content: string }>({
//     mutationFn: async ({ content }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: userData, error: userError } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       if (userError) {
//         throw new Error('Failed to fetch user profile.');
//       }
//       const { data: insertedOpinion, error } = await supabase
//         .from('opinions')
//         .insert({ user_id: currentUserId, content })
//         .select(
//           `
//           *,
//           user:profiles!user_id(username, avatar_url),
//           likes:opinion_likes(user_id),
//           dislikes:opinion_dislikes(user_id),
//           comments:opinion_comments(id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!user_id(username, avatar_url))
//         `
//         )
//         .single();
//       if (error || !insertedOpinion) {
//         console.error('Error posting opinion:', error);
//         throw new Error('Failed to post opinion.');
//       }
//       return {
//         ...insertedOpinion,
//         comments: nestComments(insertedOpinion.comments || []),
//       };
//     },
//     onMutate: async ({ content }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as
//         | Opinion[]
//         | undefined;
//       const { data: userData } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       const tempOpinion: Opinion = {
//         id: `temp-${Date.now()}`,
//         user_id: currentUserId!,
//         content,
//         created_at: new Date().toISOString(),
//         user: userData || { username: 'You', avatar_url: '' },
//         likes: [],
//         dislikes: [],
//         comments: [],
//       };
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = [...(old || []), tempOpinion]; // Append to bottom
//         console.log('Optimistic update for opinion:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err, _vars, context) => {
//       console.error('Error in postOpinion mutation:', err);
//       toast.error(err.message || 'Failed to post opinion.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: insertedOpinion => {
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op =>
//           op.id === insertedOpinion.id || op.id.startsWith('temp-')
//             ? insertedOpinion
//             : op
//         ) || [insertedOpinion];
//         console.log('Updated opinions cache with server opinion:', updated);
//         return updated;
//       });
//       toast.success('Opinion posted!');
//     },
//   });

//   // Like/unlike opinion mutation
//   const likeOpinionMutation = useMutation<
//     void,
//     Error,
//     { opinionId: string; isLiked: boolean }
//   >({
//     mutationFn: async ({ opinionId, isLiked }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       if (isLiked) {
//         const { error } = await supabase
//           .from('opinion_likes')
//           .delete()
//           .eq('opinion_id', opinionId)
//           .eq('user_id', currentUserId);
//         if (error) {
//           console.error('Error unliking opinion:', error);
//           throw new Error('Failed to unlike opinion.');
//         }
//       } else {
//         const { error } = await supabase
//           .from('opinion_likes')
//           .insert({ opinion_id: opinionId, user_id: currentUserId });
//         if (error) {
//           console.error('Error liking opinion:', error);
//           throw new Error('Failed to like opinion.');
//         }
//       }
//     },
//     onMutate: async ({ opinionId, isLiked }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as
//         | Opinion[]
//         | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op =>
//           op.id === opinionId
//             ? {
//                 ...op,
//                 likes: isLiked
//                   ? op.likes.filter(l => l.user_id !== currentUserId!)
//                   : [...op.likes, { user_id: currentUserId! }],
//                 dislikes: isLiked
//                   ? op.dislikes
//                   : op.dislikes.filter(d => d.user_id !== currentUserId!), // Remove dislike if liking
//               }
//             : op
//         );
//         console.log('Optimistic update for opinion like:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err, { opinionId, isLiked }, context) => {
//       console.error('Error in likeOpinion mutation:', err);
//       toast.error(err.message || 'Failed to update like.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_, { isLiked }) => {
//       toast.success(isLiked ? 'Opinion unliked!' : 'Opinion liked!');
//     },
//   });

//   // Dislike/undislike opinion mutation
//   const dislikeOpinionMutation = useMutation<
//     void,
//     Error,
//     { opinionId: string; isDisliked: boolean }
//   >({
//     mutationFn: async ({ opinionId, isDisliked }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       if (isDisliked) {
//         const { error } = await supabase
//           .from('opinion_dislikes')
//           .delete()
//           .eq('opinion_id', opinionId)
//           .eq('user_id', currentUserId);
//         if (error) {
//           console.error('Error undisliking opinion:', error);
//           throw new Error('Failed to undislike opinion.');
//         }
//       } else {
//         const { error } = await supabase
//           .from('opinion_dislikes')
//           .insert({ opinion_id: opinionId, user_id: currentUserId });
//         if (error) {
//           console.error('Error disliking opinion:', error);
//           throw new Error('Failed to dislike opinion.');
//         }
//       }
//     },
//     onMutate: async ({ opinionId, isDisliked }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as
//         | Opinion[]
//         | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op =>
//           op.id === opinionId
//             ? {
//                 ...op,
//                 dislikes: isDisliked
//                   ? op.dislikes.filter(d => d.user_id !== currentUserId!)
//                   : [...op.dislikes, { user_id: currentUserId! }],
//                 likes: isDisliked
//                   ? op.likes
//                   : op.likes.filter(l => l.user_id !== currentUserId!), // Remove like if disliking
//               }
//             : op
//         );
//         console.log('Optimistic update for opinion dislike:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err, { opinionId, isDisliked }, context) => {
//       console.error('Error in dislikeOpinion mutation:', err);
//       toast.error(err.message || 'Failed to update dislike.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_, { isDisliked }) => {
//       toast.success(isDisliked ? 'Opinion undisliked!' : 'Opinion disliked!');
//     },
//   });

//   // Post comment mutation
//   const postCommentMutation = useMutation<
//     Comment,
//     Error,
//     { opinionId: string; content: string; parentCommentId?: string }
//   >({
//     mutationFn: async ({ opinionId, content, parentCommentId }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: userData, error: userError } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       if (userError) {
//         throw new Error('Failed to fetch user profile.');
//       }
//       const { data: insertedComment, error } = await supabase
//         .from('opinion_comments')
//         .insert({
//           opinion_id: opinionId,
//           user_id: currentUserId,
//           content,
//           parent_comment_id: parentCommentId,
//         })
//         .select(
//           'id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!user_id(username, avatar_url)'
//         )
//         .single();
//       if (error || !insertedComment) {
//         console.error('Error posting comment:', error);
//         throw new Error('Failed to post comment.');
//       }
//       return insertedComment;
//     },
//     onMutate: async ({ opinionId, content, parentCommentId }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as
//         | Opinion[]
//         | undefined;
//       const { data: userData } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       const tempComment: Comment = {
//         id: `temp-${Date.now()}`,
//         user_id: currentUserId!,
//         content,
//         created_at: new Date().toISOString(),
//         user: userData || { username: 'You', avatar_url: '' },
//         likes: [],
//         dislikes: [],
//         parent_comment_id: parentCommentId,
//       };
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op => {
//           if (op.id !== opinionId) return op;
//           let comments = [...op.comments];
//           if (parentCommentId) {
//             comments = comments.map(c =>
//               c.id === parentCommentId
//                 ? { ...c, replies: [...(c.replies || []), tempComment] }
//                 : c
//             );
//           } else {
//             comments.push(tempComment);
//           }
//           return { ...op, comments: nestComments(comments) };
//         });
//         console.log('Optimistic update for comment:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err, { opinionId }, context) => {
//       console.error('Error in postComment mutation:', err);
//       toast.error(err.message || 'Failed to post comment.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (insertedComment, { opinionId, parentCommentId }) => {
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op => {
//           if (op.id !== opinionId) return op;
//           let comments = [...op.comments];
//           if (parentCommentId) {
//             comments = comments.map(c =>
//               c.id === parentCommentId
//                 ? {
//                     ...c,
//                     replies: (c.replies || []).map(r =>
//                       r.id === insertedComment.id || r.id.startsWith('temp-')
//                         ? insertedComment
//                         : r
//                     ),
//                   }
//                 : c
//             );
//           } else {
//             comments = comments.map(c =>
//               c.id === insertedComment.id || c.id.startsWith('temp-')
//                 ? insertedComment
//                 : c
//             );
//           }
//           return { ...op, comments: nestComments(comments) };
//         });
//         console.log('Updated opinions cache with server comment:', updated);
//         return updated;
//       });
//       toast.success('Comment posted!');
//     },
//   });

//   // Like/unlike comment mutation
//   const likeCommentMutation = useMutation<
//     void,
//     Error,
//     { commentId: string; isLiked: boolean }
//   >({
//     mutationFn: async ({ commentId, isLiked }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: comment, error: fetchError } = await supabase
//         .from('opinion_comments')
//         .select('likes, dislikes, opinion_id')
//         .eq('id', commentId)
//         .single();
//       if (fetchError || !comment) {
//         console.error('Error fetching comment:', fetchError);
//         throw new Error('Failed to fetch comment.');
//       }
//       const updatedLikes = isLiked
//         ? comment.likes.filter((id: string) => id !== currentUserId)
//         : [...comment.likes, currentUserId];
//       const updatedDislikes = isLiked
//         ? comment.dislikes
//         : comment.dislikes.filter((id: string) => id !== currentUserId);
//       const { error } = await supabase
//         .from('opinion_comments')
//         .update({ likes: updatedLikes, dislikes: updatedDislikes })
//         .eq('id', commentId);
//       if (error) {
//         console.error('Error updating comment like:', error);
//         throw new Error('Failed to update comment like.');
//       }
//     },
//     onMutate: async ({ commentId, isLiked }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as
//         | Opinion[]
//         | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op => ({
//           ...op,
//           comments: nestComments(
//             op.comments.map(c =>
//               c.id === commentId
//                 ? {
//                     ...c,
//                     likes: isLiked
//                       ? c.likes.filter(id => id !== currentUserId!)
//                       : [...c.likes, currentUserId!],
//                     dislikes: isLiked
//                       ? c.dislikes
//                       : c.dislikes.filter(id => id !== currentUserId!),
//                   }
//                 : {
//                     ...c,
//                     replies: (c.replies || []).map(r =>
//                       r.id === commentId
//                         ? {
//                             ...r,
//                             likes: isLiked
//                               ? r.likes.filter(id => id !== currentUserId!)
//                               : [...r.likes, currentUserId!],
//                             dislikes: isLiked
//                               ? r.dislikes
//                               : r.dislikes.filter(id => id !== currentUserId!),
//                           }
//                         : r
//                     ),
//                   }
//             )
//           ),
//         }));
//         console.log('Optimistic update for comment like:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err, { commentId, isLiked }, context) => {
//       console.error('Error in likeComment mutation:', err);
//       toast.error(err.message || 'Failed to update comment like.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_, { isLiked }) => {
//       toast.success(isLiked ? 'Comment unliked!' : 'Comment liked!');
//     },
//   });

//   // Dislike/undislike comment mutation
//   const dislikeCommentMutation = useMutation<
//     void,
//     Error,
//     { commentId: string; isDisliked: boolean }
//   >({
//     mutationFn: async ({ commentId, isDisliked }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: comment, error: fetchError } = await supabase
//         .from('opinion_comments')
//         .select('likes, dislikes, opinion_id')
//         .eq('id', commentId)
//         .single();
//       if (fetchError || !comment) {
//         console.error('Error fetching comment:', fetchError);
//         throw new Error('Failed to fetch comment.');
//       }
//       const updatedDislikes = isDisliked
//         ? comment.dislikes.filter((id: string) => id !== currentUserId)
//         : [...comment.dislikes, currentUserId];
//       const updatedLikes = isDisliked
//         ? comment.likes
//         : comment.likes.filter((id: string) => id !== currentUserId);
//       const { error } = await supabase
//         .from('opinion_comments')
//         .update({ likes: updatedLikes, dislikes: updatedDislikes })
//         .eq('id', commentId);
//       if (error) {
//         console.error('Error updating comment dislike:', error);
//         throw new Error('Failed to update comment dislike.');
//       }
//     },
//     onMutate: async ({ commentId, isDisliked }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as
//         | Opinion[]
//         | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map(op => ({
//           ...op,
//           comments: nestComments(
//             op.comments.map(c =>
//               c.id === commentId
//                 ? {
//                     ...c,
//                     dislikes: isDisliked
//                       ? c.dislikes.filter(id => id !== currentUserId!)
//                       : [...c.dislikes, currentUserId!],
//                     likes: isDisliked
//                       ? c.likes
//                       : c.likes.filter(id => id !== currentUserId!),
//                   }
//                 : {
//                     ...c,
//                     replies: (c.replies || []).map(r =>
//                       r.id === commentId
//                         ? {
//                             ...r,
//                             dislikes: isDisliked
//                               ? r.dislikes.filter(id => id !== currentUserId!)
//                               : [...r.dislikes, currentUserId!],
//                             likes: isDisliked
//                               ? r.likes
//                               : r.likes.filter(id => id !== currentUserId!),
//                           }
//                         : r
//                     ),
//                   }
//             )
//           ),
//         }));
//         console.log('Optimistic update for comment dislike:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err, { commentId, isDisliked }, context) => {
//       console.error('Error in dislikeComment mutation:', err);
//       toast.error(err.message || 'Failed to update comment dislike.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_, { isDisliked }) => {
//       toast.success(isDisliked ? 'Comment undisliked!' : 'Comment disliked!');
//     },
//   });

//   // Handle submitting a new opinion
//   const handleSubmitOpinion = () => {
//     if (!newOpinion.trim() || !isOnline) {
//       toast.error(
//         isOnline
//           ? 'Please enter an opinion.'
//           : 'Cannot post opinion: No internet connection.'
//       );
//       return;
//     }
//     postOpinionMutation.mutate({ content: newOpinion });
//     setNewOpinion('');
//   };

//   // Handle liking/unliking an opinion
//   const handleLikeOpinion = (opinionId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot like opinion: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find(o => o.id === opinionId);
//     const isLiked = opinion?.likes.some(like => like.user_id === currentUserId);
//     likeOpinionMutation.mutate({ opinionId, isLiked: !!isLiked });
//   };

//   // Handle disliking/undisliking an opinion
//   const handleDislikeOpinion = (opinionId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot dislike opinion: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find(o => o.id === opinionId);
//     const isDisliked = opinion?.dislikes.some(
//       dislike => dislike.user_id === currentUserId
//     );
//     dislikeOpinionMutation.mutate({ opinionId, isDisliked: !!isDisliked });
//   };

//   // Handle submitting a comment
//   const handleSubmitComment = (opinionId: string, parentCommentId?: string) => {
//     const key = opinionId + (parentCommentId || '');
//     const content = commentContent[key]?.trim();
//     if (!content || !isOnline) {
//       toast.error(
//         isOnline
//           ? 'Please enter a comment.'
//           : 'Cannot post comment: No internet connection.'
//       );
//       return;
//     }
//     postCommentMutation.mutate({ opinionId, content, parentCommentId });
//     setCommentContent(prev => ({ ...prev, [key]: '' }));
//   };

//   // Handle liking/unliking a comment
//   const handleLikeComment = (commentId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot like comment: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find(op =>
//       op.comments.some(
//         c => c.id === commentId || c.replies?.some(r => r.id === commentId)
//       )
//     );
//     const comment =
//       opinion?.comments.find(c => c.id === commentId) ||
//       opinion?.comments
//         .flatMap(c => c.replies || [])
//         .find(r => r.id === commentId);
//     const isLiked = comment?.likes.includes(currentUserId!);
//     likeCommentMutation.mutate({ commentId, isLiked: !!isLiked });
//   };

//   // Handle disliking/undisliking a comment
//   const handleDislikeComment = (commentId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot dislike comment: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find(op =>
//       op.comments.some(
//         c => c.id === commentId || c.replies?.some(r => r.id === commentId)
//       )
//     );
//     const comment =
//       opinion?.comments.find(c => c.id === commentId) ||
//       opinion?.comments
//         .flatMap(c => c.replies || [])
//         .find(r => r.id === commentId);
//     const isDisliked = comment?.dislikes.includes(currentUserId!);
//     dislikeCommentMutation.mutate({ commentId, isDisliked: !!isDisliked });
//   };

//   // Render comment with replies
//   const renderComment = (comment: Comment, opinionId: string, level = 0) => (
//     <Box
//       key={comment.id}
//       className={`flex items-start gap-2 ${level > 0 ? 'ml-8' : ''}`}
//     >
//       <Avatar className="h-8 w-8">
//         <AvatarImage
//           src={comment.user.avatar_url || ''}
//           alt={comment.user.username}
//         />
//         <AvatarFallback className="text-xs">
//           {comment.user.username?.[0] || 'U'}
//         </AvatarFallback>
//       </Avatar>
//       <Box className="flex-1">
//         <Box className="flex items-center gap-2">
//           <p className="text-sm font-semibold text-foreground">
//             {comment.user.username}
//           </p>
//           <p className="text-xs text-muted-foreground">
//             {formatDistanceToNow(new Date(comment.created_at), {
//               addSuffix: true,
//             })}
//           </p>
//         </Box>
//         <p className="text-sm text-foreground">{comment.content}</p>
//         <Box className="flex gap-6 mt-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleLikeComment(comment.id)}
//             className={`flex items-center gap-2 text-muted-foreground hover:text-red-500 ${
//               comment.likes.includes(currentUserId!) ? 'text-red-500' : ''
//             }`}
//             disabled={likeCommentMutation.isPending || !isOnline}
//           >
//             <Heart
//               className="h-4 w-4"
//               fill={
//                 comment.likes.includes(currentUserId!) ? 'currentColor' : 'none'
//               }
//             />
//             <span className="text-xs">{comment.likes.length || ''}</span>
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleDislikeComment(comment.id)}
//             className={`flex items-center gap-2 text-muted-foreground hover:text-gray-600 ${
//               comment.dislikes.includes(currentUserId!) ? 'text-gray-600' : ''
//             }`}
//             disabled={dislikeCommentMutation.isPending || !isOnline}
//           >
//             <ThumbsDown
//               className="h-4 w-4"
//               fill={
//                 comment.dislikes.includes(currentUserId!)
//                   ? 'currentColor'
//                   : 'none'
//               }
//             />
//             <span className="text-xs">{comment.dislikes.length || ''}</span>
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
//             onClick={() =>
//               setCommentContent(prev => ({
//                 ...prev,
//                 [opinionId + comment.id]: prev[opinionId + comment.id] || '',
//               }))
//             }
//           >
//             <MessageCircle className="h-4 w-4" />
//             <span className="text-xs">{comment.replies?.length || ''}</span>
//           </Button>
//         </Box>
//         {commentContent[opinionId + comment.id] !== undefined && (
//           <Box className="mt-2 flex gap-2">
//             <Textarea
//               value={commentContent[opinionId + comment.id] || ''}
//               onChange={e =>
//                 setCommentContent(prev => ({
//                   ...prev,
//                   [opinionId + comment.id]: e.target.value,
//                 }))
//               }
//               placeholder="Reply to this comment..."
//               className="text-sm rounded-2xl border border-input focus:border-blue-500"
//               disabled={!isOnline}
//             />
//             <Button
//               size="sm"
//               onClick={() => handleSubmitComment(opinionId, comment.id)}
//               className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
//               disabled={postCommentMutation.isPending || !isOnline}
//             >
//               Reply
//             </Button>
//           </Box>
//         )}
//         {comment.replies?.length > 0 && (
//           <Box className="mt-3 space-y-3">
//             {comment.replies.map(reply =>
//               renderComment(reply, opinionId, level + 1)
//             )}
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
//  const feedRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll to bottom when opinions update
//   useEffect(() => {
//     if (feedRef.current) {
//       feedRef.current.scrollTo({
//         top: feedRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [opinions]);

//   return (
//     <Box className="flex h-screen">

//       {/* Main Feed */}
//       <Box className="flex-1 flex flex-col">
//         {/* Scrollable feed */}
//         <Box ref={feedRef} className="flex-1 overflow-y-auto pb-28">
//           <Box className="max-w-2xl mx-auto w-full px-4 py-4">
//             {isLoadingOpinions ? (
//               <Box className="space-y-4">
//                 {[...Array(5)].map((_, idx) => (
//                   <Skeleton key={idx} className="h-24 w-full" />
//                 ))}
//               </Box>
//             ) : opinions.length === 0 ? (
//               <p className="text-sm text-muted-foreground text-center py-8">
//                 No opinions yet.
//               </p>
//             ) : (
//               <Box className="space-y-0">
//                 {opinions.map((opinion) => (
//                   <Card
//                     key={opinion.id}
//                     className="border-x-0 border-t-0 border-b rounded-none shadow-none hover:bg-muted/40 transition-colors"
//                   >
//                     <CardContent className="pt-4 pb-2">
//                       <Box className="flex items-start gap-3">
//                         <Avatar className="h-10 w-10">
//                           <AvatarImage
//                             src={opinion.user.avatar_url || ""}
//                             alt={opinion.user.username}
//                           />
//                           <AvatarFallback className="text-sm">
//                             {opinion.user.username?.[0] || "U"}
//                           </AvatarFallback>
//                         </Avatar>

//                         <Box className="flex-1">
//                           <Box className="flex items-center gap-2">
//                             <p className="text-sm font-semibold text-foreground">
//                               {opinion.user.username}
//                             </p>
//                             <p className="text-xs text-muted-foreground">
//                               {formatDistanceToNow(
//                                 new Date(opinion.created_at),
//                                 { addSuffix: true }
//                               )}
//                             </p>
//                           </Box>
//                           <p className="text-sm text-foreground mt-1">
//                             {opinion.content}
//                           </p>

//                           {/* Actions */}
//                           <Box className="flex gap-6 mt-3">
//                             {/* Like */}
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleLikeOpinion(opinion.id)}
//                               className={`flex items-center gap-2 text-muted-foreground hover:text-red-500 ${
//                                 opinion.likes.some(
//                                   (like) => like.user_id === currentUserId
//                                 )
//                                   ? "text-red-500"
//                                   : ""
//                               }`}
//                               disabled={
//                                 likeOpinionMutation.isPending || !isOnline
//                               }
//                             >
//                               <Heart
//                                 className="h-4 w-4"
//                                 fill={
//                                   opinion.likes.some(
//                                     (like) => like.user_id === currentUserId
//                                   )
//                                     ? "currentColor"
//                                     : "none"
//                                 }
//                               />
//                               <span className="text-xs">
//                                 {opinion.likes.length || ""}
//                               </span>
//                             </Button>

//                             {/* Dislike */}
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleDislikeOpinion(opinion.id)}
//                               className={`flex items-center gap-2 text-muted-foreground hover:text-gray-600 ${
//                                 opinion.dislikes.some(
//                                   (dislike) =>
//                                     dislike.user_id === currentUserId
//                                 )
//                                   ? "text-gray-600"
//                                   : ""
//                               }`}
//                               disabled={
//                                 dislikeOpinionMutation.isPending || !isOnline
//                               }
//                             >
//                               <ThumbsDown
//                                 className="h-4 w-4"
//                                 fill={
//                                   opinion.dislikes.some(
//                                     (dislike) =>
//                                       dislike.user_id === currentUserId
//                                   )
//                                     ? "currentColor"
//                                     : "none"
//                                 }
//                               />
//                               <span className="text-xs">
//                                 {opinion.dislikes.length || ""}
//                               </span>
//                             </Button>

//                             {/* Comment */}
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
//                               onClick={() =>
//                                 setCommentContent((prev) => ({
//                                   ...prev,
//                                   [opinion.id]: prev[opinion.id] || "",
//                                 }))
//                               }
//                             >
//                               <MessageCircle className="h-4 w-4" />
//                               <span className="text-xs">
//                                 {opinion.comments.length || ""}
//                               </span>
//                             </Button>
//                           </Box>

//                           {/* Reply Input */}
//                           {commentContent[opinion.id] !== undefined && (
//                             <Box className="mt-3 flex gap-2">
//                               <Textarea
//                                 value={commentContent[opinion.id] || ""}
//                                 onChange={(e) =>
//                                   setCommentContent((prev) => ({
//                                     ...prev,
//                                     [opinion.id]: e.target.value,
//                                   }))
//                                 }
//                                 placeholder="Reply..."
//                                 className="text-sm rounded-2xl border border-input focus:border-blue-500"
//                                 disabled={!isOnline}
//                               />
//                               <Button
//                                 size="sm"
//                                 onClick={() => handleSubmitComment(opinion.id)}
//                                 className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
//                                 disabled={
//                                   postOpinionMutation.isPending || !isOnline
//                                 }
//                               >
//                                 Reply
//                               </Button>
//                             </Box>
//                           )}

//                           {/* Comments */}
//                           {opinion.comments.length > 0 && (
//                             <Box className="mt-3 space-y-3">
//                               {opinion.comments.map((comment) =>
//                                 renderComment(comment, opinion.id)
//                               )}
//                             </Box>
//                           )}
//                         </Box>
//                       </Box>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </Box>
//             )}
//           </Box>
//         </Box>

//         {/* Fixed Input Bar */}
//         <Box
//           as="div"
//           className="fixed bottom-0 left-0 right-0 z-10 pl-64"
//         >
//           <Box className="max-w-2xl mx-auto w-full px-4 py-3 flex items-start gap-3 bg-background border-t">
//             <Avatar className="h-10 w-10">
//               <AvatarImage src="" alt="Your avatar" />
//               <AvatarFallback className="text-sm font-medium">U</AvatarFallback>
//             </Avatar>

//             <Box className="flex-1 flex flex-col rounded-2xl border border-input bg-muted px-4 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200 ease-in-out">
//               <Textarea
//                 value={newOpinion}
//                 onChange={(e) => setNewOpinion(e.target.value)}
//                 placeholder="What’s happening?"
//                 className="w-full resize-none text-sm bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground"
//                 rows={1}
//                 disabled={!isOnline}
//               />
//               <div className="flex justify-end mt-2">
//                 <Button
//                   onClick={handleSubmitOpinion}
//                   className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={postOpinionMutation.isPending || !isOnline}
//                 >
//                   Post
//                 </Button>
//               </div>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// }



// 'use client';

// import { useEffect, useState, ChangeEvent, useRef } from 'react';
// import { supabase, getCurrentUser } from '@/lib/supabaseClient';
// import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import Textarea from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { toast } from 'sonner';
// import { formatDistanceToNow } from 'date-fns';
// import { Heart, MessageCircle, ThumbsDown, ArrowDown } from 'lucide-react';

// // Define interfaces
// interface User {
//   username: string;
//   avatar_url?: string | null;
// }

// interface Comment {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   user: User;
//   likes: string[];
//   dislikes: string[];
//   parent_comment_id?: string | null;
//   replies?: Comment[];
// }

// interface Opinion {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   user: User;
//   likes: { user_id: string }[];
//   dislikes: { user_id: string }[];
//   comments: Comment[];
// }

// interface OpinionPayload {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
// }

// interface CommentPayload {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   opinion_id: string;
//   parent_comment_id?: string | null;
//   likes: string[];
//   dislikes: string[];
// }

// interface LikeDislikePayload {
//   opinion_id?: string;
//   comment_id?: string;
//   user_id: string;
// }

// // Supabase query response types
// interface SupabaseUser {
//   username: string;
//   avatar_url?: string | null;
// }

// interface SupabaseComment {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   parent_comment_id?: string | null;
//   likes: string[];
//   dislikes: string[];
//   user: SupabaseUser;
// }

// interface SupabaseOpinion {
//   id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   user: SupabaseUser;
//   likes: { user_id: string }[];
//   dislikes: { user_id: string }[];
//   comments: SupabaseComment[];
// }

// // Type for getCurrentUser response
// interface CurrentUser {
//   id: string;
// }

// export default function Opinions() {
//   const [newOpinion, setNewOpinion] = useState<string>('');
//   const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
//   const [isOnline, setIsOnline] = useState<boolean>(true);
//   const queryClient = useQueryClient();
//   const opinionsContainerRef = useRef<HTMLDivElement>(null);

//   // Sync online/offline state
//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     setIsOnline(navigator.onLine);
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // Fetch current user
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const user: CurrentUser | null = await getCurrentUser();
//         setCurrentUserId(user?.id || null);
//         console.log('Current user ID:', user?.id || 'null');
//       } catch (error: unknown) {
//         console.error('Error fetching current user:', error);
//         toast.error('Failed to load current user.');
//       }
//     };
//     fetchCurrentUser();
//   }, []);

//   // Fetch opinions
//   const { data: opinions = [], isLoading: isLoadingOpinions }: UseQueryResult<Opinion[], Error> = useQuery({
//     queryKey: ['opinions'],
//     queryFn: async (): Promise<Opinion[]> => {
//       const { data, error } = await supabase
//         .from('opinions')
//         .select(`
//           id, user_id, content, created_at,
//           user:profiles!user_id(username, avatar_url),
//           likes:opinion_likes(user_id),
//           dislikes:opinion_dislikes(user_id),
//           comments:opinion_comments(
//             id, user_id, content, created_at, parent_comment_id, likes, dislikes,
//             user:profiles!user_id(username, avatar_url)
//           )
//         `)
//         .order('created_at', { ascending: true });
//       if (error) {
//         console.error('Error fetching opinions:', error);
//         throw new Error('Failed to load opinions.');
//       }
//       // Nest comments with replies
//       const nestedData = (data as SupabaseOpinion[] || []).map((opinion) => ({
//         ...opinion,
//         comments: nestComments(opinion.comments || []),
//       }));
//       console.log('Fetched opinions:', nestedData);
//       return nestedData;
//     },
//     enabled: isOnline,
//     retry: 2,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   // Helper to nest comments
//   const nestComments = (comments: SupabaseComment[]): Comment[] => {
//     const commentMap = new Map<string, Comment>();
//     const topLevel: Comment[] = [];

//     comments.forEach((comment) => {
//       const typedComment: Comment = { ...comment, replies: [] };
//       commentMap.set(comment.id, typedComment);
//     });

//     comments.forEach((comment) => {
//       if (comment.parent_comment_id) {
//         const parent = commentMap.get(comment.parent_comment_id);
//         if (parent) {
//           parent.replies = parent.replies || [];
//           parent.replies.push({ ...comment, replies: [] });
//         }
//       } else {
//         topLevel.push(commentMap.get(comment.id)!);
//       }
//     });

//     return topLevel;
//   };

//   // Handle incoming opinion
//   const handleIncomingOpinion = async (payload: { new: OpinionPayload }) => {
//     if (!isOnline || payload.new.user_id === currentUserId) {
//       console.log('Skipping opinion event:', { isOnline, user_id: payload.new.user_id, currentUserId });
//       return;
//     }

//     console.log('Received opinion event:', payload);
//     const { data: userData, error: userError } = await supabase
//       .from('profiles')
//       .select('username, avatar_url')
//       .eq('id', payload.new.user_id)
//       .single();

//     if (userError) {
//       console.error('Error fetching user for opinion:', userError);
//       toast.error('Failed to load user profile.');
//       return;
//     }

//     const newOpinion: Opinion = {
//       ...payload.new,
//       user: userData || { username: 'Unknown', avatar_url: null },
//       likes: [],
//       dislikes: [],
//       comments: [],
//     };

//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return [newOpinion];
//       if (old.some((op) => op.id === newOpinion.id)) {
//         console.log('Opinion already exists in cache:', newOpinion.id);
//         return old;
//       }
//       const updated = [...old, newOpinion];
//       console.log('Updated opinions cache with new opinion:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming opinion like
//   const handleIncomingOpinionLike = (payload: { new: LikeDislikePayload } | { old: LikeDislikePayload }) => {
//     if (!isOnline || ('new' in payload ? payload.new.user_id : payload.old.user_id) === currentUserId) {
//       console.log('Skipping opinion like event:', {
//         isOnline,
//         user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received opinion like event:', payload);
//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map((op) => {
//         if ('new' in payload && op.id === payload.new.opinion_id) {
//           if (op.likes.some((l) => l.user_id === payload.new.user_id)) return op;
//           return { ...op, likes: [...op.likes, { user_id: payload.new.user_id }] };
//         }
//         if ('old' in payload && op.id === payload.old.opinion_id) {
//           return { ...op, likes: op.likes.filter((l) => l.user_id !== payload.old.user_id) };
//         }
//         return op;
//       });
//       console.log('Updated opinions cache with like:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming opinion dislike
//   const handleIncomingOpinionDislike = (payload: { new: LikeDislikePayload } | { old: LikeDislikePayload }) => {
//     if (!isOnline || ('new' in payload ? payload.new.user_id : payload.old.user_id) === currentUserId) {
//       console.log('Skipping opinion dislike event:', {
//         isOnline,
//         user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received opinion dislike event:', payload);
//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map((op) => {
//         if ('new' in payload && op.id === payload.new.opinion_id) {
//           if (op.dislikes.some((d) => d.user_id === payload.new.user_id)) return op;
//           return { ...op, dislikes: [...op.dislikes, { user_id: payload.new.user_id }] };
//         }
//         if ('old' in payload && op.id === payload.old.opinion_id) {
//           return { ...op, dislikes: op.dislikes.filter((d) => d.user_id !== payload.old.user_id) };
//         }
//         return op;
//       });
//       console.log('Updated opinions cache with dislike:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming comment
//   const handleIncomingComment = async (payload: { new: CommentPayload }) => {
//     if (!isOnline || payload.new.user_id === currentUserId) {
//       console.log('Skipping comment event:', { isOnline, user_id: payload.new.user_id, currentUserId });
//       return;
//     }

//     console.log('Received comment event:', payload);
//     const { data: userData, error: userError } = await supabase
//       .from('profiles')
//       .select('username, avatar_url')
//       .eq('id', payload.new.user_id)
//       .single();

//     if (userError) {
//       console.error('Error fetching user for comment:', userError);
//       toast.error('Failed to load user profile.');
//       return;
//     }

//     const newComment: Comment = {
//       ...payload.new,
//       user: userData || { username: 'Unknown', avatar_url: null },
//       likes: payload.new.likes || [],
//       dislikes: payload.new.dislikes || [],
//       parent_comment_id: payload.new.parent_comment_id,
//     };

//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map((op) => {
//         if (op.id !== payload.new.opinion_id) return op;
//         const comments = nestComments([...op.comments, newComment]);
//         return { ...op, comments };
//       });
//       console.log('Updated opinions cache with comment:', updated);
//       return updated;
//     });
//   };

//   // Handle incoming comment like/dislike
//   const handleIncomingCommentLikeDislike = (payload: { new: CommentPayload } | { old: CommentPayload }) => {
//     if (!isOnline || ('new' in payload ? payload.new.user_id : payload.old.user_id) === currentUserId) {
//       console.log('Skipping comment like/dislike event:', {
//         isOnline,
//         user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
//         currentUserId,
//       });
//       return;
//     }

//     console.log('Received comment like/dislike event:', payload);
//     queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//       if (!old) return old;
//       const updated = old.map((op) => {
//         if (op.id !== ('new' in payload ? payload.new.opinion_id : payload.old.opinion_id)) return op;
//         const comments = op.comments.map((c) => {
//           if (c.id !== ('new' in payload ? payload.new.id : payload.old.id)) return c;
//           return {
//             ...c,
//             likes: 'new' in payload ? payload.new.likes : c.likes,
//             dislikes: 'new' in payload ? payload.new.dislikes : c.dislikes,
//           };
//         });
//         return { ...op, comments: nestComments(comments) };
//       });
//       console.log('Updated opinions cache with comment like/dislike:', updated);
//       return updated;
//     });
//   };

//   // Subscribe to real-time changes
//   useEffect(() => {
//     if (!isOnline || !currentUserId) {
//       console.log('Subscriptions skipped: isOnline=', isOnline, 'currentUserId=', currentUserId);
//       return;
//     }

//     const opinionsChannel = supabase
//       .channel('opinions')
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinions' }, handleIncomingOpinion)
//       .subscribe((status: string, error: Error | null) => {
//         console.log('Opinions channel status:', status, error ? `Error: ${error.message}` : '');
//         if (error) toast.error('Failed to subscribe to opinions: ' + error.message);
//       });

//     const likesChannel = supabase
//       .channel('opinion_likes')
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_likes' }, handleIncomingOpinionLike)
//       .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'opinion_likes' }, handleIncomingOpinionLike)
//       .subscribe((status: string, error: Error | null) => {
//         console.log('Likes channel status:', status, error ? `Error: ${error.message}` : '');
//         if (error) toast.error('Failed to subscribe to likes: ' + error.message);
//       });

//     const dislikesChannel = supabase
//       .channel('opinion_dislikes')
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_dislikes' }, handleIncomingOpinionDislike)
//       .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'opinion_dislikes' }, handleIncomingOpinionDislike)
//       .subscribe((status: string, error: Error | null) => {
//         console.log('Dislikes channel status:', status, error ? `Error: ${error.message}` : '');
//         if (error) toast.error('Failed to subscribe to dislikes: ' + error.message);
//       });

//     const commentsChannel = supabase
//       .channel('opinion_comments')
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_comments' }, handleIncomingComment)
//       .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'opinion_comments' }, handleIncomingCommentLikeDislike)
//       .subscribe((status: string, error: Error | null) => {
//         console.log('Comments channel status:', status, error ? `Error: ${error.message}` : '');
//         if (error) toast.error('Failed to subscribe to comments: ' + error.message);
//       });

//     return () => {
//       console.log('Removing subscriptions');
//       supabase.removeChannel(opinionsChannel);
//       supabase.removeChannel(likesChannel);
//       supabase.removeChannel(dislikesChannel);
//       supabase.removeChannel(commentsChannel);
//     };
//   }, [isOnline, currentUserId]);

//   // Post opinion mutation
//   const postOpinionMutation: UseMutationResult<Opinion, Error, { content: string }, { previousOpinions?: Opinion[] }> = useMutation({
//     mutationFn: async ({ content }: { content: string }): Promise<Opinion> => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: userData, error: userError } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       if (userError) {
//         throw new Error('Failed to fetch user profile.');
//       }
//       const { data: insertedOpinion, error } = await supabase
//         .from('opinions')
//         .insert({ user_id: currentUserId, content })
//         .select(`
//           id, user_id, content, created_at,
//           user:profiles!user_id(username, avatar_url),
//           likes:opinion_likes(user_id),
//           dislikes:opinion_dislikes(user_id),
//           comments:opinion_comments(id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!user_id(username, avatar_url))
//         `)
//         .single();
//       if (error || !insertedOpinion) {
//         console.error('Error posting opinion:', error);
//         throw new Error('Failed to post opinion.');
//       }
//       return { ...insertedOpinion, comments: nestComments(insertedOpinion.comments || []) } as Opinion;
//     },
//     onMutate: async ({ content }: { content: string }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
//       const { data: userData } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       const tempOpinion: Opinion = {
//         id: `temp-${Date.now()}`,
//         user_id: currentUserId!,
//         content,
//         created_at: new Date().toISOString(),
//         user: userData || { username: 'You', avatar_url: null },
//         likes: [],
//         dislikes: [],
//         comments: [],
//       };
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = [...(old || []), tempOpinion];
//         console.log('Optimistic update for opinion:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err: Error, _vars, context) => {
//       console.error('Error in postOpinion mutation:', err);
//       toast.error(err.message || 'Failed to post opinion.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (insertedOpinion: Opinion) => {
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) => (op.id === insertedOpinion.id || op.id.startsWith('temp-') ? insertedOpinion : op)) || [insertedOpinion];
//         console.log('Updated opinions cache with server opinion:', updated);
//         return updated;
//       });
//       toast.success('Opinion posted!');
//     },
//   });

//   // Like/unlike opinion mutation
//   const likeOpinionMutation: UseMutationResult<void, Error, { opinionId: string; isLiked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
//     mutationFn: async ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       if (isLiked) {
//         const { error } = await supabase
//           .from('opinion_likes')
//           .delete()
//           .eq('opinion_id', opinionId)
//           .eq('user_id', currentUserId);
//         if (error) {
//           console.error('Error unliking opinion:', error);
//           throw new Error('Failed to unlike opinion.');
//         }
//       } else {
//         const { error } = await supabase
//           .from('opinion_likes')
//           .insert({ opinion_id: opinionId, user_id: currentUserId });
//         if (error) {
//           console.error('Error liking opinion:', error);
//           throw new Error('Failed to like opinion.');
//         }
//       }
//     },
//     onMutate: async ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) =>
//           op.id === opinionId
//             ? {
//                 ...op,
//                 likes: isLiked
//                   ? op.likes.filter((l) => l.user_id !== currentUserId!)
//                   : [...op.likes, { user_id: currentUserId! }],
//                 dislikes: isLiked
//                   ? op.dislikes
//                   : op.dislikes.filter((d) => d.user_id !== currentUserId!),
//               }
//             : op
//         );
//         console.log('Optimistic update for opinion like:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err: Error, { opinionId, isLiked }, context) => {
//       console.error('Error in likeOpinion mutation:', err);
//       toast.error(err.message || 'Failed to update like.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_: void, { isLiked }: { opinionId: string; isLiked: boolean }) => {
//       toast.success(isLiked ? 'Opinion unliked!' : 'Opinion liked!');
//     },
//   });

//   // Dislike/undislike opinion mutation
//   const dislikeOpinionMutation: UseMutationResult<void, Error, { opinionId: string; isDisliked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
//     mutationFn: async ({ opinionId, isDisliked }: { opinionId: string; isDisliked: boolean }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       if (isDisliked) {
//         const { error } = await supabase
//           .from('opinion_dislikes')
//           .delete()
//           .eq('opinion_id', opinionId)
//           .eq('user_id', currentUserId);
//         if (error) {
//           console.error('Error undisliking opinion:', error);
//           throw new Error('Failed to undislike opinion.');
//         }
//       } else {
//         const { error } = await supabase
//           .from('opinion_dislikes')
//           .insert({ opinion_id: opinionId, user_id: currentUserId });
//         if (error) {
//           console.error('Error disliking opinion:', error);
//           throw new Error('Failed to dislike opinion.');
//         }
//       }
//     },
//     onMutate: async ({ opinionId, isDisliked }: { opinionId: string; isDisliked: boolean }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) =>
//           op.id === opinionId
//             ? {
//                 ...op,
//                 dislikes: isDisliked
//                   ? op.dislikes.filter((d) => d.user_id !== currentUserId!)
//                   : [...op.dislikes, { user_id: currentUserId! }],
//                 likes: isDisliked
//                   ? op.likes
//                   : op.likes.filter((l) => l.user_id !== currentUserId!),
//               }
//             : op
//         );
//         console.log('Optimistic update for opinion dislike:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err: Error, { opinionId, isDisliked }, context) => {
//       console.error('Error in dislikeOpinion mutation:', err);
//       toast.error(err.message || 'Failed to update dislike.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_: void, { isDisliked }: { opinionId: string; isDisliked: boolean }) => {
//       toast.success(isDisliked ? 'Opinion undisliked!' : 'Opinion disliked!');
//     },
//   });

//   // Post comment mutation
//   const postCommentMutation: UseMutationResult<Comment, Error, { opinionId: string; content: string; parentCommentId?: string }, { previousOpinions?: Opinion[] }> = useMutation({
//     mutationFn: async ({ opinionId, content, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }): Promise<Comment> => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: userData, error: userError } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       if (userError) {
//         throw new Error('Failed to fetch user profile.');
//       }
//       const { data: insertedComment, error } = await supabase
//         .from('opinion_comments')
//         .insert({ opinion_id: opinionId, user_id: currentUserId, content, parent_comment_id: parentCommentId })
//         .select('id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!user_id(username, avatar_url)')
//         .single();
//       if (error || !insertedComment) {
//         console.error('Error posting comment:', error);
//         throw new Error('Failed to post comment.');
//       }
//       return insertedComment as Comment;
//     },
//     onMutate: async ({ opinionId, content, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
//       const { data: userData } = await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', currentUserId)
//         .single();
//       const tempComment: Comment = {
//         id: `temp-${Date.now()}`,
//         user_id: currentUserId!,
//         content,
//         created_at: new Date().toISOString(),
//         user: userData || { username: 'You', avatar_url: null },
//         likes: [],
//         dislikes: [],
//         parent_comment_id: parentCommentId,
//         replies: [],
//       };
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) => {
//           if (op.id !== opinionId) return op;
//           let comments = [...op.comments];
//           if (parentCommentId) {
//             comments = comments.map((c) =>
//               c.id === parentCommentId
//                 ? { ...c, replies: [...(c.replies || []), tempComment] }
//                 : c
//             );
//           } else {
//             comments.push(tempComment);
//           }
//           return { ...op, comments: nestComments(comments) };
//         });
//         console.log('Optimistic update for comment:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err: Error, { opinionId }, context) => {
//       console.error('Error in postComment mutation:', err);
//       toast.error(err.message || 'Failed to post comment.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (insertedComment: Comment, { opinionId, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }) => {
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) => {
//           if (op.id !== opinionId) return op;
//           let comments = [...op.comments];
//           if (parentCommentId) {
//             comments = comments.map((c) =>
//               c.id === parentCommentId
//                 ? {
//                     ...c,
//                     replies: (c.replies || []).map((r) =>
//                       r.id === insertedComment.id || r.id.startsWith('temp-') ? insertedComment : r
//                     ),
//                   }
//                 : c
//             );
//           } else {
//             comments = comments.map((c) =>
//               c.id === insertedComment.id || c.id.startsWith('temp-') ? insertedComment : c
//             );
//             if (!comments.some((c) => c.id === insertedComment.id)) {
//               comments.push(insertedComment);
//             }
//           }
//           return { ...op, comments: nestComments(comments) };
//         });
//         console.log('Updated opinions cache with server comment:', updated);
//         return updated;
//       });
//       toast.success('Comment posted!');
//     },
//   });

//   // Like/unlike comment mutation
//   const likeCommentMutation: UseMutationResult<void, Error, { commentId: string; isLiked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
//     mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: comment, error: fetchError } = await supabase
//         .from('opinion_comments')
//         .select('likes, dislikes, opinion_id')
//         .eq('id', commentId)
//         .single();
//       if (fetchError || !comment) {
//         console.error('Error fetching comment:', fetchError);
//         throw new Error('Failed to fetch comment.');
//       }
//       const updatedLikes = isLiked
//         ? comment.likes.filter((id: string) => id !== currentUserId)
//         : [...comment.likes, currentUserId];
//       const updatedDislikes = isLiked ? comment.dislikes : comment.dislikes.filter((id: string) => id !== currentUserId);
//       const { error } = await supabase
//         .from('opinion_comments')
//         .update({ likes: updatedLikes, dislikes: updatedDislikes })
//         .eq('id', commentId);
//       if (error) {
//         console.error('Error updating comment like:', error);
//         throw new Error('Failed to update comment like.');
//       }
//     },
//     onMutate: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) => ({
//           ...op,
//           comments: nestComments(
//             op.comments.map((c) =>
//               c.id === commentId
//                 ? {
//                     ...c,
//                     likes: isLiked
//                       ? c.likes.filter((id) => id !== currentUserId!)
//                       : [...c.likes, currentUserId!],
//                     dislikes: isLiked ? c.dislikes : c.dislikes.filter((id) => id !== currentUserId!),
//                   }
//                 : {
//                     ...c,
//                     replies: (c.replies || []).map((r) =>
//                       r.id === commentId
//                         ? {
//                             ...r,
//                             likes: isLiked
//                               ? r.likes.filter((id) => id !== currentUserId!)
//                               : [...r.likes, currentUserId!],
//                             dislikes: isLiked ? r.dislikes : r.dislikes.filter((id) => id !== currentUserId!),
//                           }
//                         : r
//                     ),
//                   }
//             )
//           ),
//         }));
//         console.log('Optimistic update for comment like:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err: Error, { commentId, isLiked }, context) => {
//       console.error('Error in likeComment mutation:', err);
//       toast.error(err.message || 'Failed to update comment like.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_: void, { isLiked }: { commentId: string; isLiked: boolean }) => {
//       toast.success(isLiked ? 'Comment unliked!' : 'Comment liked!');
//     },
//   });

//   // Dislike/undislike comment mutation
//   const dislikeCommentMutation: UseMutationResult<void, Error, { commentId: string; isDisliked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
//     mutationFn: async ({ commentId, isDisliked }: { commentId: string; isDisliked: boolean }) => {
//       if (!currentUserId || !isOnline) {
//         throw new Error('User not authenticated or offline.');
//       }
//       const { data: comment, error: fetchError } = await supabase
//         .from('opinion_comments')
//         .select('likes, dislikes, opinion_id')
//         .eq('id', commentId)
//         .single();
//       if (fetchError || !comment) {
//         console.error('Error fetching comment:', fetchError);
//         throw new Error('Failed to fetch comment.');
//       }
//       const updatedDislikes = isDisliked
//         ? comment.dislikes.filter((id: string) => id !== currentUserId)
//         : [...comment.dislikes, currentUserId];
//       const updatedLikes = isDisliked ? comment.likes : comment.likes.filter((id) => id !== currentUserId);
//       const { error } = await supabase
//         .from('opinion_comments')
//         .update({ likes: updatedLikes, dislikes: updatedDislikes })
//         .eq('id', commentId);
//       if (error) {
//         console.error('Error updating comment dislike:', error);
//         throw new Error('Failed to update comment dislike.');
//       }
//     },
//     onMutate: async ({ commentId, isDisliked }: { commentId: string; isDisliked: boolean }) => {
//       await queryClient.cancelQueries({ queryKey: ['opinions'] });
//       const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
//       queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
//         const updated = old?.map((op) => ({
//           ...op,
//           comments: nestComments(
//             op.comments.map((c) =>
//               c.id === commentId
//                 ? {
//                     ...c,
//                     dislikes: isDisliked
//                       ? c.dislikes.filter((id) => id !== currentUserId!)
//                       : [...c.dislikes, currentUserId!],
//                     likes: isDisliked ? c.likes : c.likes.filter((id) => id !== currentUserId!),
//                   }
//                 : {
//                     ...c,
//                     replies: (c.replies || []).map((r) =>
//                       r.id === commentId
//                         ? {
//                             ...r,
//                             dislikes: isDisliked
//                               ? r.dislikes.filter((id) => id !== currentUserId!)
//                               : [...r.dislikes, currentUserId!],
//                             likes: isDisliked ? r.likes : r.likes.filter((id) => id !== currentUserId!),
//                           }
//                         : r
//                     ),
//                   }
//             )
//           ),
//         }));
//         console.log('Optimistic update for comment dislike:', updated);
//         return updated;
//       });
//       return { previousOpinions };
//     },
//     onError: (err: Error, { commentId, isDisliked }, context) => {
//       console.error('Error in dislikeComment mutation:', err);
//       toast.error(err.message || 'Failed to update comment dislike.');
//       queryClient.setQueryData(['opinions'], context?.previousOpinions);
//     },
//     onSuccess: (_: void, { isDisliked }: { commentId: string; isDisliked: boolean }) => {
//       toast.success(isDisliked ? 'Comment undisliked!' : 'Comment disliked!');
//     },
//   });

//   // Handle submitting a new opinion
//   const handleSubmitOpinion = () => {
//     if (!newOpinion.trim() || !isOnline) {
//       toast.error(isOnline ? 'Please enter an opinion.' : 'Cannot post opinion: No internet connection.');
//       return;
//     }
//     postOpinionMutation.mutate({ content: newOpinion });
//     setNewOpinion('');
//   };

//   // Handle liking/unliking an opinion
//   const handleLikeOpinion = (opinionId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot like opinion: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find((o) => o.id === opinionId);
//     const isLiked = opinion?.likes.some((like) => like.user_id === currentUserId);
//     likeOpinionMutation.mutate({ opinionId, isLiked: !!isLiked });
//   };

//   // Handle disliking/undisliking an opinion
//   const handleDislikeOpinion = (opinionId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot dislike opinion: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find((o) => o.id === opinionId);
//     const isDisliked = opinion?.dislikes.some((dislike) => dislike.user_id === currentUserId);
//     dislikeOpinionMutation.mutate({ opinionId, isDisliked: !!isDisliked });
//   };

//   // Handle submitting a comment
//   const handleSubmitComment = (opinionId: string, parentCommentId?: string) => {
//     const key = opinionId + (parentCommentId || '');
//     const content = commentContent[key]?.trim();
//     if (!content || !isOnline) {
//       toast.error(isOnline ? 'Please enter a comment.' : 'Cannot post comment: No internet connection.');
//       return;
//     }
//     postCommentMutation.mutate({ opinionId, content, parentCommentId });
//     setCommentContent((prev) => ({ ...prev, [key]: '' }));
//   };

//   // Handle liking/unliking a comment
//   const handleLikeComment = (commentId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot like comment: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find((op) => op.comments.some((c) => c.id === commentId || (c.replies || []).some((r) => r.id === commentId)));
//     const comment = opinion?.comments.find((c) => c.id === commentId) || opinion?.comments.flatMap((c) => c.replies || []).find((r) => r.id === commentId);
//     const isLiked = comment?.likes.includes(currentUserId!);
//     likeCommentMutation.mutate({ commentId, isLiked: !!isLiked });
//   };

//   // Handle disliking/undisliking a comment
//   const handleDislikeComment = (commentId: string) => {
//     if (!currentUserId || !isOnline) {
//       toast.error('Cannot dislike comment: No internet connection.');
//       return;
//     }
//     const opinion = opinions.find((op) => op.comments.some((c) => c.id === commentId || (c.replies || []).some((r) => r.id === commentId)));
//     const comment = opinion?.comments.find((c) => c.id === commentId) || opinion?.comments.flatMap((c) => c.replies || []).find((r) => r.id === commentId);
//     const isDisliked = comment?.dislikes.includes(currentUserId!);
//     dislikeCommentMutation.mutate({ commentId, isDisliked: !!isDisliked });
//   };

//   // Scroll to the most recent opinion
//   const scrollToBottom = () => {
//     if (opinionsContainerRef.current) {
//       const lastOpinion = opinionsContainerRef.current.querySelector(`[data-opinion-id="${opinions[opinions.length - 1]?.id}"]`);
//       if (lastOpinion) {
//         lastOpinion.scrollIntoView({ behavior: 'smooth' });
//       } else {
//         opinionsContainerRef.current.scrollTop = opinionsContainerRef.current.scrollHeight;
//       }
//     }
//   };

//   // Render comment with replies
//   const renderComment = (comment: Comment, opinionId: string, level: number = 0): JSX.Element => (
//     <div key={comment.id} className={`flex items-start gap-3 ${level > 0 ? 'ml-10' : ''} py-2`}>
//       <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-gray-700">
//         <AvatarImage src={comment.user.avatar_url || ''} alt={comment.user.username} />
//         <AvatarFallback className="text-xs font-medium">{comment.user.username?.[0] || 'U'}</AvatarFallback>
//       </Avatar>
//       <div className="flex-1">
//         <div className="flex items-center gap-2">
//           <p className="text-sm font-semibold text-foreground">{comment.user.username}</p>
//           <p className="text-xs text-muted-foreground">
//             {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
//           </p>
//         </div>
//         <p className="text-sm text-foreground mt-1">{comment.content}</p>
//         <div className="flex gap-4 mt-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleLikeComment(comment.id)}
//             className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${
//               comment.likes.includes(currentUserId!) ? 'text-red-500' : ''
//             }`}
//             disabled={likeCommentMutation.isPending || !isOnline}
//           >
//             <Heart className="h-4 w-4" fill={comment.likes.includes(currentUserId!) ? 'currentColor' : 'none'} />
//             <span className="text-xs">{comment.likes.length || ''}</span>
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleDislikeComment(comment.id)}
//             className={`flex items-center gap-1 text-muted-foreground hover:text-gray-600 transition-colors ${
//               comment.dislikes.includes(currentUserId!) ? 'text-gray-600' : ''
//             }`}
//             disabled={dislikeCommentMutation.isPending || !isOnline}
//           >
//             <ThumbsDown className="h-4 w-4" fill={comment.dislikes.includes(currentUserId!) ? 'currentColor' : 'none'} />
//             <span className="text-xs">{comment.dislikes.length || ''}</span>
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
//             onClick={() =>
//               setCommentContent((prev) => ({
//                 ...prev,
//                 [opinionId + comment.id]: prev[opinionId + comment.id] || '',
//               }))
//             }
//           >
//             <MessageCircle className="h-4 w-4" />
//             <span className="text-xs">{comment.replies?.length || ''}</span>
//           </Button>
//         </div>
//         {commentContent[opinionId + comment.id] !== undefined && (
//           <div className="mt-3 flex gap-2">
//             <Textarea
//               value={commentContent[opinionId + comment.id] || ''}
//               onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
//                 setCommentContent((prev) => ({
//                   ...prev,
//                   [opinionId + comment.id]: e.target.value,
//                 }))
//               }
//               placeholder="Reply to this comment..."
//               className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 shadow-sm min-h-[60px] max-h-[120px] resize-y"
//               disabled={!isOnline}
//             />
//             <Button
//               size="sm"
//               onClick={() => handleSubmitComment(opinionId, comment.id)}
//               className="rounded-full px-4 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors"
//               disabled={postCommentMutation.isPending || !isOnline}
//             >
//               Reply
//             </Button>
//           </div>
//         )}
//         {comment.replies?.length > 0 && (
//           <div className="mt-3 space-y-3">
//             {comment.replies.map((reply) => renderComment(reply, opinionId, level + 1))}
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen flex flex-col">
//       <div className="flex-1 overflow-y-auto pb-24 relative" ref={opinionsContainerRef}>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="absolute top-4 right-4 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//           onClick={scrollToBottom}
//           title="Scroll to most recent"
//         >
//           <ArrowDown className="h-5 w-5" />
//         </Button>
//         <div className="max-w-2xl mx-auto px-4 py-6">
//           {isLoadingOpinions ? (
//             <div className="space-y-6">
//               {[...Array(5)].map((_, idx) => (
//                 <Skeleton key={idx} className="h-28 w-full rounded-xl shadow-sm" />
//               ))}
//             </div>
//           ) : opinions.length === 0 ? (
//             <p className="text-sm text-muted-foreground text-center py-10">No opinions yet.</p>
//           ) : (
//             <div className="space-y-4">
//               {opinions.map((opinion) => (
//                 <Card
//                   key={opinion.id}
//                   data-opinion-id={opinion.id}
//                   className="border-x-0 border-t-0 border-b border-gray-200 dark:border-gray-700 rounded-none shadow-sm transition-shadow hover:shadow-md"
//                 >
//                   <CardContent className="pt-6 pb-4">
//                     <div className="flex items-start gap-4">
//                       <Avatar className="h-10 w-10 ring-1 ring-gray-200 dark:ring-gray-700">
//                         <AvatarImage src={opinion.user.avatar_url || ''} alt={opinion.user.username} />
//                         <AvatarFallback className="text-sm font-medium">{opinion.user.username?.[0] || 'U'}</AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3">
//                           <p className="text-sm font-semibold text-foreground">{opinion.user.username}</p>
//                           <p className="text-xs text-muted-foreground">
//                             {formatDistanceToNow(new Date(opinion.created_at), { addSuffix: true })}
//                           </p>
//                         </div>
//                         <p className="text-sm text-foreground mt-2 leading-relaxed">{opinion.content}</p>
//                         <div className="flex gap-4 mt-4">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleLikeOpinion(opinion.id)}
//                             className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${
//                               opinion.likes.some((like) => like.user_id === currentUserId) ? 'text-red-500' : ''
//                             }`}
//                             disabled={likeOpinionMutation.isPending || !isOnline}
//                           >
//                             <Heart className="h-4 w-4" fill={opinion.likes.some((like) => like.user_id === currentUserId) ? 'currentColor' : 'none'} />
//                             <span className="text-xs">{opinion.likes.length || ''}</span>
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleDislikeOpinion(opinion.id)}
//                             className={`flex items-center gap-1 text-muted-foreground hover:text-gray-600 transition-colors ${
//                               opinion.dislikes.some((dislike) => dislike.user_id === currentUserId) ? 'text-gray-600' : ''
//                             }`}
//                             disabled={dislikeOpinionMutation.isPending || !isOnline}
//                           >
//                             <ThumbsDown className="h-4 w-4" fill={opinion.dislikes.some((dislike) => dislike.user_id === currentUserId) ? 'currentColor' : 'none'} />
//                             <span className="text-xs">{opinion.dislikes.length || ''}</span>
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
//                             onClick={() =>
//                               setCommentContent((prev) => ({
//                                 ...prev,
//                                 [opinion.id]: prev[opinion.id] || '',
//                               }))
//                             }
//                           >
//                             <MessageCircle className="h-4 w-4" />
//                             <span className="text-xs">{opinion.comments.length || ''}</span>
//                           </Button>
//                         </div>
//                         {commentContent[opinion.id] !== undefined && (
//                           <div className="mt-4 flex gap-2">
//                             <Textarea
//                               value={commentContent[opinion.id] || ''}
//                               onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
//                                 setCommentContent((prev) => ({
//                                   ...prev,
//                                   [opinion.id]: e.target.value,
//                                 }))
//                               }
//                               placeholder="Reply to this opinion..."
//                               className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 shadow-sm min-h-[60px] max-h-[120px] resize-y"
//                               disabled={!isOnline}
//                             />
//                             <Button
//                               size="sm"
//                               onClick={() => handleSubmitComment(opinion.id)}
//                               className="rounded-full px-4 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors"
//                               disabled={postCommentMutation.isPending || !isOnline}
//                             >
//                               Reply
//                             </Button>
//                           </div>
//                         )}
//                         {opinion.comments.length > 0 && (
//                           <div className="mt-4 space-y-4">
//                             {opinion.comments.map((comment) => renderComment(comment, opinion.id))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="fixed bottom-0 left-0 right-0 z-10">
//         <div
//           className="pl-64 border-t border-gray-200 dark:border-gray-700 py-4"
//           style={{ background: 'linear-gradient(to right, transparent 16rem, var(--background) 16rem)' }}
//         >
//           <div className="max-w-2xl mx-auto flex items-center gap-3 px-4">
//             <Avatar className="h-10 w-10 ring-1 ring-gray-200 dark:ring-gray-700">
//               <AvatarImage src="" alt="Your avatar" />
//               <AvatarFallback className="text-sm font-medium">U</AvatarFallback>
//             </Avatar>
//             <Textarea
//               value={newOpinion}
//               onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewOpinion(e.target.value)}
//               placeholder="What's your opinion?"
//               className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 shadow-sm min-h-[60px] max-h-[120px] resize-y transition-shadow hover:shadow-md"
//               disabled={!isOnline}
//             />
//             <Button
//               onClick={handleSubmitOpinion}
//               className="rounded-full px-6 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors"
//               disabled={postOpinionMutation.isPending || !isOnline}
//             >
//               Post
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import { useEffect, useState, ChangeEvent, useRef } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Textarea from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { Heart, MessageCircle, ThumbsDown, ArrowDown } from 'lucide-react';

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

// Supabase query response types
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

// Type for getCurrentUser response
interface CurrentUser {
  id: string;
}

// Type for grouped opinions by date
interface GroupedOpinions {
  date: string;
  label: string;
  opinions: Opinion[];
}

export default function Opinions() {
  const [newOpinion, setNewOpinion] = useState<string>('');
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
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

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user: CurrentUser | null = await getCurrentUser();
        setCurrentUserId(user?.id || null);
        console.log('Current user ID:', user?.id || 'null');
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
        .select(`
          id, user_id, content, created_at,
          user:profiles!user_id(username, avatar_url),
          likes:opinion_likes(user_id),
          dislikes:opinion_dislikes(user_id),
          comments:opinion_comments(
            id, user_id, content, created_at, parent_comment_id, likes, dislikes,
            user:profiles!user_id(username, avatar_url)
          )
        `)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching opinions:', error);
        throw new Error('Failed to load opinions.');
      }
      // Nest comments with replies
      const nestedData = (data as SupabaseOpinion[] || []).map((opinion) => ({
        ...opinion,
        comments: nestComments(opinion.comments || []),
      }));
      console.log('Fetched opinions:', nestedData);
      return nestedData;
    },
    enabled: isOnline,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Group opinions by date
  const groupedOpinions: GroupedOpinions[] = opinions.reduce((acc: GroupedOpinions[], opinion) => {
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
    const existingGroup = acc.find((group) => group.date === dateKey);
    if (existingGroup) {
      existingGroup.opinions.push(opinion);
    } else {
      acc.push({ date: dateKey, label, opinions: [opinion] });
    }
    return acc;
  }, []);

  // Helper to nest comments
  const nestComments = (comments: SupabaseComment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const topLevel: Comment[] = [];

    comments.forEach((comment) => {
      const typedComment: Comment = { ...comment, replies: [] };
      commentMap.set(comment.id, typedComment);
    });

    comments.forEach((comment) => {
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

  // Handle incoming opinion
  const handleIncomingOpinion = async (payload: { new: OpinionPayload }) => {
    if (!isOnline || payload.new.user_id === currentUserId) {
      console.log('Skipping opinion event:', { isOnline, user_id: payload.new.user_id, currentUserId });
      return;
    }

    console.log('Received opinion event:', payload);
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', payload.new.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user for opinion:', userError);
      toast.error('Failed to load user profile.');
      return;
    }

    const newOpinion: Opinion = {
      ...payload.new,
      user: userData || { username: 'Unknown', avatar_url: null },
      likes: [],
      dislikes: [],
      comments: [],
    };

    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return [newOpinion];
      if (old.some((op) => op.id === newOpinion.id)) {
        console.log('Opinion already exists in cache:', newOpinion.id);
        return old;
      }
      const updated = [...old, newOpinion];
      console.log('Updated opinions cache with new opinion:', updated);
      return updated;
    });
  };

  // Handle incoming opinion like
  const handleIncomingOpinionLike = (payload: { new: LikeDislikePayload } | { old: LikeDislikePayload }) => {
    if (!isOnline || ('new' in payload ? payload.new.user_id : payload.old.user_id) === currentUserId) {
      console.log('Skipping opinion like event:', {
        isOnline,
        user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
        currentUserId,
      });
      return;
    }

    console.log('Received opinion like event:', payload);
    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map((op) => {
        if ('new' in payload && op.id === payload.new.opinion_id) {
          if (op.likes.some((l) => l.user_id === payload.new.user_id)) return op;
          return { ...op, likes: [...op.likes, { user_id: payload.new.user_id }] };
        }
        if ('old' in payload && op.id === payload.old.opinion_id) {
          return { ...op, likes: op.likes.filter((l) => l.user_id !== payload.old.user_id) };
        }
        return op;
      });
      console.log('Updated opinions cache with like:', updated);
      return updated;
    });
  };

  // Handle incoming opinion dislike
  const handleIncomingOpinionDislike = (payload: { new: LikeDislikePayload } | { old: LikeDislikePayload }) => {
    if (!isOnline || ('new' in payload ? payload.new.user_id : payload.old.user_id) === currentUserId) {
      console.log('Skipping opinion dislike event:', {
        isOnline,
        user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
        currentUserId,
      });
      return;
    }

    console.log('Received opinion dislike event:', payload);
    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map((op) => {
        if ('new' in payload && op.id === payload.new.opinion_id) {
          if (op.dislikes.some((d) => d.user_id === payload.new.user_id)) return op;
          return { ...op, dislikes: [...op.dislikes, { user_id: payload.new.user_id }] };
        }
        if ('old' in payload && op.id === payload.old.opinion_id) {
          return { ...op, dislikes: op.dislikes.filter((d) => d.user_id !== payload.old.user_id) };
        }
        return op;
      });
      console.log('Updated opinions cache with dislike:', updated);
      return updated;
    });
  };

  // Handle incoming comment
  const handleIncomingComment = async (payload: { new: CommentPayload }) => {
    if (!isOnline || payload.new.user_id === currentUserId) {
      console.log('Skipping comment event:', { isOnline, user_id: payload.new.user_id, currentUserId });
      return;
    }

    console.log('Received comment event:', payload);
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', payload.new.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user for comment:', userError);
      toast.error('Failed to load user profile.');
      return;
    }

    const newComment: Comment = {
      ...payload.new,
      user: userData || { username: 'Unknown', avatar_url: null },
      likes: payload.new.likes || [],
      dislikes: payload.new.dislikes || [],
      parent_comment_id: payload.new.parent_comment_id,
    };

    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map((op) => {
        if (op.id !== payload.new.opinion_id) return op;
        const comments = nestComments([...op.comments, newComment]);
        return { ...op, comments };
      });
      console.log('Updated opinions cache with comment:', updated);
      return updated;
    });
  };

  // Handle incoming comment like/dislike
  const handleIncomingCommentLikeDislike = (payload: { new: CommentPayload } | { old: CommentPayload }) => {
    if (!isOnline || ('new' in payload ? payload.new.user_id : payload.old.user_id) === currentUserId) {
      console.log('Skipping comment like/dislike event:', {
        isOnline,
        user_id: 'new' in payload ? payload.new.user_id : payload.old.user_id,
        currentUserId,
      });
      return;
    }

    console.log('Received comment like/dislike event:', payload);
    queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
      if (!old) return old;
      const updated = old.map((op) => {
        if (op.id !== ('new' in payload ? payload.new.opinion_id : payload.old.opinion_id)) return op;
        const comments = op.comments.map((c) => {
          if (c.id !== ('new' in payload ? payload.new.id : payload.old.id)) return c;
          return {
            ...c,
            likes: 'new' in payload ? payload.new.likes : c.likes,
            dislikes: 'new' in payload ? payload.new.dislikes : c.dislikes,
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
    if (!isOnline || !currentUserId) {
      console.log('Subscriptions skipped: isOnline=', isOnline, 'currentUserId=', currentUserId);
      return;
    }

    const opinionsChannel = supabase
      .channel('opinions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinions' }, handleIncomingOpinion)
      .subscribe((status: string, error: Error | null) => {
        console.log('Opinions channel status:', status, error ? `Error: ${error.message}` : '');
        if (error) toast.error('Failed to subscribe to opinions: ' + error.message);
      });

    const likesChannel = supabase
      .channel('opinion_likes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_likes' }, handleIncomingOpinionLike)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'opinion_likes' }, handleIncomingOpinionLike)
      .subscribe((status: string, error: Error | null) => {
        console.log('Likes channel status:', status, error ? `Error: ${error.message}` : '');
        if (error) toast.error('Failed to subscribe to likes: ' + error.message);
      });

    const dislikesChannel = supabase
      .channel('opinion_dislikes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_dislikes' }, handleIncomingOpinionDislike)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'opinion_dislikes' }, handleIncomingOpinionDislike)
      .subscribe((status: string, error: Error | null) => {
        console.log('Dislikes channel status:', status, error ? `Error: ${error.message}` : '');
        if (error) toast.error('Failed to subscribe to dislikes: ' + error.message);
      });

    const commentsChannel = supabase
      .channel('opinion_comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opinion_comments' }, handleIncomingComment)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'opinion_comments' }, handleIncomingCommentLikeDislike)
      .subscribe((status: string, error: Error | null) => {
        console.log('Comments channel status:', status, error ? `Error: ${error.message}` : '');
        if (error) toast.error('Failed to subscribe to comments: ' + error.message);
      });

    return () => {
      console.log('Removing subscriptions');
      supabase.removeChannel(opinionsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(dislikesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [isOnline, currentUserId]);

  // Post opinion mutation
  const postOpinionMutation: UseMutationResult<Opinion, Error, { content: string }, { previousOpinions?: Opinion[] }> = useMutation({
    mutationFn: async ({ content }: { content: string }): Promise<Opinion> => {
      if (!currentUserId || !isOnline) {
        throw new Error('User not authenticated or offline.');
      }
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUserId)
        .single();
      if (userError) {
        throw new Error('Failed to fetch user profile.');
      }
      const { data: insertedOpinion, error } = await supabase
        .from('opinions')
        .insert({ user_id: currentUserId, content })
        .select(`
          id, user_id, content, created_at,
          user:profiles!user_id(username, avatar_url),
          likes:opinion_likes(user_id),
          dislikes:opinion_dislikes(user_id),
          comments:opinion_comments(id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!user_id(username, avatar_url))
        `)
        .single();
      if (error || !insertedOpinion) {
        console.error('Error posting opinion:', error);
        throw new Error('Failed to post opinion.');
      }
      return { ...insertedOpinion, comments: nestComments(insertedOpinion.comments || []) } as Opinion;
    },
    onMutate: async ({ content }: { content: string }) => {
      await queryClient.cancelQueries({ queryKey: ['opinions'] });
      const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
      const { data: userData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUserId)
        .single();
      const tempOpinion: Opinion = {
        id: `temp-${Date.now()}`,
        user_id: currentUserId!,
        content,
        created_at: new Date().toISOString(),
        user: userData || { username: 'You', avatar_url: null },
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
        const updated = old?.map((op) => (op.id === insertedOpinion.id || op.id.startsWith('temp-') ? insertedOpinion : op)) || [insertedOpinion];
        console.log('Updated opinions cache with server opinion:', updated);
        return updated;
      });
      toast.success('Opinion posted!');
    },
  });

  // Like/unlike opinion mutation
  const likeOpinionMutation: UseMutationResult<void, Error, { opinionId: string; isLiked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
    mutationFn: async ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) => {
      if (!currentUserId || !isOnline) {
        throw new Error('User not authenticated or offline.');
      }
      if (isLiked) {
        const { error } = await supabase
          .from('opinion_likes')
          .delete()
          .eq('opinion_id', opinionId)
          .eq('user_id', currentUserId);
        if (error) {
          console.error('Error unliking opinion:', error);
          throw new Error('Failed to unlike opinion.');
        }
      } else {
        const { error } = await supabase
          .from('opinion_likes')
          .insert({ opinion_id: opinionId, user_id: currentUserId });
        if (error) {
          console.error('Error liking opinion:', error);
          throw new Error('Failed to like opinion.');
        }
      }
    },
    onMutate: async ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) => {
      await queryClient.cancelQueries({ queryKey: ['opinions'] });
      const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
      queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
        const updated = old?.map((op) =>
          op.id === opinionId
            ? {
                ...op,
                likes: isLiked
                  ? op.likes.filter((l) => l.user_id !== currentUserId!)
                  : [...op.likes, { user_id: currentUserId! }],
                dislikes: isLiked
                  ? op.dislikes
                  : op.dislikes.filter((d) => d.user_id !== currentUserId!),
              }
            : op
        );
        console.log('Optimistic update for opinion like:', updated);
        return updated;
      });
      return { previousOpinions };
    },
    onError: (err: Error, { opinionId, isLiked }, context) => {
      console.error('Error in likeOpinion mutation:', err);
      toast.error(err.message || 'Failed to update like.');
      queryClient.setQueryData(['opinions'], context?.previousOpinions);
    },
    onSuccess: (_: void, { isLiked }: { opinionId: string; isLiked: boolean }) => {
      toast.success(isLiked ? 'Opinion unliked!' : 'Opinion liked!');
    },
  });

  // Dislike/undislike opinion mutation
  const dislikeOpinionMutation: UseMutationResult<void, Error, { opinionId: string; isDisliked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
    mutationFn: async ({ opinionId, isDisliked }: { opinionId: string; isDisliked: boolean }) => {
      if (!currentUserId || !isOnline) {
        throw new Error('User not authenticated or offline.');
      }
      if (isDisliked) {
        const { error } = await supabase
          .from('opinion_dislikes')
          .delete()
          .eq('opinion_id', opinionId)
          .eq('user_id', currentUserId);
        if (error) {
          console.error('Error undisliking opinion:', error);
          throw new Error('Failed to undislike opinion.');
        }
      } else {
        const { error } = await supabase
          .from('opinion_dislikes')
          .insert({ opinion_id: opinionId, user_id: currentUserId });
        if (error) {
          console.error('Error disliking opinion:', error);
          throw new Error('Failed to dislike opinion.');
        }
      }
    },
    onMutate: async ({ opinionId, isDisliked }: { opinionId: string; isDisliked: boolean }) => {
      await queryClient.cancelQueries({ queryKey: ['opinions'] });
      const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
      queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
        const updated = old?.map((op) =>
          op.id === opinionId
            ? {
                ...op,
                dislikes: isDisliked
                  ? op.dislikes.filter((d) => d.user_id !== currentUserId!)
                  : [...op.dislikes, { user_id: currentUserId! }],
                likes: isDisliked
                  ? op.likes
                  : op.likes.filter((l) => l.user_id !== currentUserId!),
              }
            : op
        );
        console.log('Optimistic update for opinion dislike:', updated);
        return updated;
      });
      return { previousOpinions };
    },
    onError: (err: Error, { opinionId, isDisliked }, context) => {
      console.error('Error in dislikeOpinion mutation:', err);
      toast.error(err.message || 'Failed to update dislike.');
      queryClient.setQueryData(['opinions'], context?.previousOpinions);
    },
    onSuccess: (_: void, { isDisliked }: { opinionId: string; isDisliked: boolean }) => {
      toast.success(isDisliked ? 'Opinion undisliked!' : 'Opinion disliked!');
    },
  });

  // Post comment mutation
  const postCommentMutation: UseMutationResult<Comment, Error, { opinionId: string; content: string; parentCommentId?: string }, { previousOpinions?: Opinion[] }> = useMutation({
    mutationFn: async ({ opinionId, content, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }): Promise<Comment> => {
      if (!currentUserId || !isOnline) {
        throw new Error('User not authenticated or offline.');
      }
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUserId)
        .single();
      if (userError) {
        throw new Error('Failed to fetch user profile.');
      }
      const { data: insertedComment, error } = await supabase
        .from('opinion_comments')
        .insert({ opinion_id: opinionId, user_id: currentUserId, content, parent_comment_id: parentCommentId })
        .select('id, user_id, content, created_at, parent_comment_id, likes, dislikes, user:profiles!user_id(username, avatar_url)')
        .single();
      if (error || !insertedComment) {
        console.error('Error posting comment:', error);
        throw new Error('Failed to post comment.');
      }
      return insertedComment as Comment;
    },
    onMutate: async ({ opinionId, content, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }) => {
      await queryClient.cancelQueries({ queryKey: ['opinions'] });
      const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
      const { data: userData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUserId)
        .single();
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        user_id: currentUserId!,
        content,
        created_at: new Date().toISOString(),
        user: userData || { username: 'You', avatar_url: null },
        likes: [],
        dislikes: [],
        parent_comment_id: parentCommentId,
        replies: [],
      };
      queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
        const updated = old?.map((op) => {
          if (op.id !== opinionId) return op;
          let comments = [...op.comments];
          if (parentCommentId) {
            comments = comments.map((c) =>
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
    onError: (err: Error, { opinionId }, context) => {
      console.error('Error in postComment mutation:', err);
      toast.error(err.message || 'Failed to post comment.');
      queryClient.setQueryData(['opinions'], context?.previousOpinions);
    },
    onSuccess: (insertedComment: Comment, { opinionId, parentCommentId }: { opinionId: string; content: string; parentCommentId?: string }) => {
      queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
        const updated = old?.map((op) => {
          if (op.id !== opinionId) return op;
          let comments = [...op.comments];
          if (parentCommentId) {
            comments = comments.map((c) =>
              c.id === parentCommentId
                ? {
                    ...c,
                    replies: (c.replies || []).map((r) =>
                      r.id === insertedComment.id || r.id.startsWith('temp-') ? insertedComment : r
                    ),
                  }
                : c
            );
          } else {
            comments = comments.map((c) =>
              c.id === insertedComment.id || c.id.startsWith('temp-') ? insertedComment : c
            );
            if (!comments.some((c) => c.id === insertedComment.id)) {
              comments.push(insertedComment);
            }
          }
          return { ...op, comments: nestComments(comments) };
        });
        console.log('Updated opinions cache with server comment:', updated);
        return updated;
      });
      toast.success('Comment posted!');
    },
  });

  // Like/unlike comment mutation
  const likeCommentMutation: UseMutationResult<void, Error, { commentId: string; isLiked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (!currentUserId || !isOnline) {
        throw new Error('User not authenticated or offline.');
      }
      const { data: comment, error: fetchError } = await supabase
        .from('opinion_comments')
        .select('likes, dislikes, opinion_id')
        .eq('id', commentId)
        .single();
      if (fetchError || !comment) {
        console.error('Error fetching comment:', fetchError);
        throw new Error('Failed to fetch comment.');
      }
      const updatedLikes = isLiked
        ? comment.likes.filter((id: string) => id !== currentUserId)
        : [...comment.likes, currentUserId];
      const updatedDislikes = isLiked ? comment.dislikes : comment.dislikes.filter((id: string) => id !== currentUserId);
      const { error } = await supabase
        .from('opinion_comments')
        .update({ likes: updatedLikes, dislikes: updatedDislikes })
        .eq('id', commentId);
      if (error) {
        console.error('Error updating comment like:', error);
        throw new Error('Failed to update comment like.');
      }
    },
    onMutate: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      await queryClient.cancelQueries({ queryKey: ['opinions'] });
      const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
      queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
        const updated = old?.map((op) => ({
          ...op,
          comments: nestComments(
            op.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    likes: isLiked
                      ? c.likes.filter((id) => id !== currentUserId!)
                      : [...c.likes, currentUserId!],
                    dislikes: isLiked ? c.dislikes : c.dislikes.filter((id) => id !== currentUserId!),
                  }
                : {
                    ...c,
                    replies: (c.replies || []).map((r) =>
                      r.id === commentId
                        ? {
                            ...r,
                            likes: isLiked
                              ? r.likes.filter((id) => id !== currentUserId!)
                              : [...r.likes, currentUserId!],
                            dislikes: isLiked ? r.dislikes : r.dislikes.filter((id) => id !== currentUserId!),
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
    onError: (err: Error, { commentId, isLiked }, context) => {
      console.error('Error in likeComment mutation:', err);
      toast.error(err.message || 'Failed to update comment like.');
      queryClient.setQueryData(['opinions'], context?.previousOpinions);
    },
    onSuccess: (_: void, { isLiked }: { commentId: string; isLiked: boolean }) => {
      toast.success(isLiked ? 'Comment unliked!' : 'Comment liked!');
    },
  });

  // Dislike/undislike comment mutation
  const dislikeCommentMutation: UseMutationResult<void, Error, { commentId: string; isDisliked: boolean }, { previousOpinions?: Opinion[] }> = useMutation({
    mutationFn: async ({ commentId, isDisliked }: { commentId: string; isDisliked: boolean }) => {
      if (!currentUserId || !isOnline) {
        throw new Error('User not authenticated or offline.');
      }
      const { data: comment, error: fetchError } = await supabase
        .from('opinion_comments')
        .select('likes, dislikes, opinion_id')
        .eq('id', commentId)
        .single();
      if (fetchError || !comment) {
        console.error('Error fetching comment:', fetchError);
        throw new Error('Failed to fetch comment.');
      }
      const updatedDislikes = isDisliked
        ? comment.dislikes.filter((id: string) => id !== currentUserId)
        : [...comment.dislikes, currentUserId];
      const updatedLikes = isDisliked ? comment.likes : comment.likes.filter((id: string) => id !== currentUserId);
      const { error } = await supabase
        .from('opinion_comments')
        .update({ likes: updatedLikes, dislikes: updatedDislikes })
        .eq('id', commentId);
      if (error) {
        console.error('Error updating comment dislike:', error);
        throw new Error('Failed to update comment dislike.');
      }
    },
    onMutate: async ({ commentId, isDisliked }: { commentId: string; isDisliked: boolean }) => {
      await queryClient.cancelQueries({ queryKey: ['opinions'] });
      const previousOpinions = queryClient.getQueryData(['opinions']) as Opinion[] | undefined;
      queryClient.setQueryData(['opinions'], (old: Opinion[] | undefined) => {
        const updated = old?.map((op) => ({
          ...op,
          comments: nestComments(
            op.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    dislikes: isDisliked
                      ? c.dislikes.filter((id) => id !== currentUserId!)
                      : [...c.dislikes, currentUserId!],
                    likes: isDisliked ? c.likes : c.likes.filter((id) => id !== currentUserId!),
                  }
                : {
                    ...c,
                    replies: (c.replies || []).map((r) =>
                      r.id === commentId
                        ? {
                            ...r,
                            dislikes: isDisliked
                              ? r.dislikes.filter((id) => id !== currentUserId!)
                              : [...r.dislikes, currentUserId!],
                            likes: isDisliked ? c.likes : c.likes.filter((id) => id !== currentUserId!),
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
    onError: (err: Error, { commentId, isDisliked }, context) => {
      console.error('Error in dislikeComment mutation:', err);
      toast.error(err.message || 'Failed to update comment dislike.');
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

  // Handle liking/unliking an opinion
  const handleLikeOpinion = (opinionId: string) => {
    if (!currentUserId || !isOnline) {
      toast.error('Cannot like opinion: No internet connection.');
      return;
    }
    const opinion = opinions.find((o) => o.id === opinionId);
    const isLiked = opinion?.likes.some((like) => like.user_id === currentUserId);
    likeOpinionMutation.mutate({ opinionId, isLiked: !!isLiked });
  };

  // Handle disliking/undisliking an opinion
  const handleDislikeOpinion = (opinionId: string) => {
    if (!currentUserId || !isOnline) {
      toast.error('Cannot dislike opinion: No internet connection.');
      return;
    }
    const opinion = opinions.find((o) => o.id === opinionId);
    const isDisliked = opinion?.dislikes.some((dislike) => dislike.user_id === currentUserId);
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
    setCommentContent((prev) => ({ ...prev, [key]: '' }));
  };

  // Handle liking/unliking a comment
  const handleLikeComment = (commentId: string) => {
    if (!currentUserId || !isOnline) {
      toast.error('Cannot like comment: No internet connection.');
      return;
    }
    const opinion = opinions.find((op) => op.comments.some((c) => c.id === commentId || (c.replies || []).some((r) => r.id === commentId)));
    const comment = opinion?.comments.find((c) => c.id === commentId) || opinion?.comments.flatMap((c) => c.replies || []).find((r) => r.id === commentId);
    const isLiked = comment?.likes.includes(currentUserId!);
    likeCommentMutation.mutate({ commentId, isLiked: !!isLiked });
  };

  // Handle disliking/undisliking a comment
  const handleDislikeComment = (commentId: string) => {
    if (!currentUserId || !isOnline) {
      toast.error('Cannot dislike comment: No internet connection.');
      return;
    }
    const opinion = opinions.find((op) => op.comments.some((c) => c.id === commentId || (c.replies || []).some((r) => r.id === commentId)));
    const comment = opinion?.comments.find((c) => c.id === commentId) || opinion?.comments.flatMap((c) => c.replies || []).find((r) => r.id === commentId);
    const isDisliked = comment?.dislikes.includes(currentUserId!);
    dislikeCommentMutation.mutate({ commentId, isDisliked: !!isDisliked });
  };

  // Scroll to the most recent opinion
  const scrollToBottom = () => {
    if (opinionsContainerRef.current) {
      const lastOpinion = opinionsContainerRef.current.querySelector(`[data-opinion-id="${opinions[opinions.length - 1]?.id}"]`);
      if (lastOpinion) {
        lastOpinion.scrollIntoView({ behavior: 'smooth' });
      } else {
        opinionsContainerRef.current.scrollTop = opinionsContainerRef.current.scrollHeight;
      }
    }
  };

  // Render comment with replies
  const renderComment = (comment: Comment, opinionId: string, level: number = 0): JSX.Element => (
    <div key={comment.id} className={`flex items-start gap-3 ${level > 0 ? 'ml-10' : ''} py-2`}>
      <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-gray-700">
        <AvatarImage src={comment.user.avatar_url || ''} alt={comment.user.username} />
        <AvatarFallback className="text-xs font-medium">{comment.user.username?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{comment.user.username}</p>
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
            className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${
              comment.likes.includes(currentUserId!) ? 'text-red-500' : ''
            }`}
            disabled={likeCommentMutation.isPending || !isOnline}
          >
            <Heart className="h-4 w-4" fill={comment.likes.includes(currentUserId!) ? 'currentColor' : 'none'} />
            <span className="text-xs">{comment.likes.length || ''}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDislikeComment(comment.id)}
            className={`flex items-center gap-1 text-muted-foreground hover:text-gray-600 transition-colors ${
              comment.dislikes.includes(currentUserId!) ? 'text-gray-600' : ''
            }`}
            disabled={dislikeCommentMutation.isPending || !isOnline}
          >
            <ThumbsDown className="h-4 w-4" fill={comment.dislikes.includes(currentUserId!) ? 'currentColor' : 'none'} />
            <span className="text-xs">{comment.dislikes.length || ''}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
            onClick={() =>
              setCommentContent((prev) => ({
                ...prev,
                [opinionId + comment.id]: prev[opinionId + comment.id] || '',
              }))
            }
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{comment.replies?.length || ''}</span>
          </Button>
        </div>
        {commentContent[opinionId + comment.id] !== undefined && (
          <div className="mt-3 flex gap-2">
            <Textarea
              value={commentContent[opinionId + comment.id] || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setCommentContent((prev) => ({
                  ...prev,
                  [opinionId + comment.id]: e.target.value,
                }))
              }
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
        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => renderComment(reply, opinionId, level + 1))}
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
              {groupedOpinions.map((group) => (
                <div key={group.date} className="space-y-4">
                  <div className="sticky top-0 z-10 py-2">
                    <p className="text-xs text-muted-foreground text-center font-medium">{group.label}</p>
                  </div>
                  {group.opinions.map((opinion) => (
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
                              <p className="text-sm font-semibold text-foreground">{opinion.user.username}</p>
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
                                  opinion.likes.some((like) => like.user_id === currentUserId) ? 'text-red-500' : ''
                                }`}
                                disabled={likeOpinionMutation.isPending || !isOnline}
                              >
                                <Heart className="h-4 w-4" fill={opinion.likes.some((like) => like.user_id === currentUserId) ? 'currentColor' : 'none'} />
                                <span className="text-xs">{opinion.likes.length || ''}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDislikeOpinion(opinion.id)}
                                className={`flex items-center gap-1 text-muted-foreground hover:text-gray-600 transition-colors ${
                                  opinion.dislikes.some((dislike) => dislike.user_id === currentUserId) ? 'text-gray-600' : ''
                                }`}
                                disabled={dislikeOpinionMutation.isPending || !isOnline}
                              >
                                <ThumbsDown className="h-4 w-4" fill={opinion.dislikes.some((dislike) => dislike.user_id === currentUserId) ? 'currentColor' : 'none'} />
                                <span className="text-xs">{opinion.dislikes.length || ''}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                                onClick={() =>
                                  setCommentContent((prev) => ({
                                    ...prev,
                                    [opinion.id]: prev[opinion.id] || '',
                                  }))
                                }
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{opinion.comments.length || ''}</span>
                              </Button>
                            </div>
                            {commentContent[opinion.id] !== undefined && (
                              <div className="mt-4 flex gap-2">
                                <Textarea
                                  value={commentContent[opinion.id] || ''}
                                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                    setCommentContent((prev) => ({
                                      ...prev,
                                      [opinion.id]: e.target.value,
                                    }))
                                  }
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
                                {opinion.comments.map((comment) => renderComment(comment, opinion.id))}
                              </div>
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

            <Button
  variant="ghost"
  size="icon"
  className="fixed bottom-24 right-6 z-50 rounded-full shadow-md 
             bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm 
             text-muted-foreground hover:text-blue-500 
             hover:bg-gray-100 dark:hover:bg-gray-800 
             transition-colors duration-200"
  onClick={scrollToBottom}
  aria-label="Scroll to most recent"
>
  <ArrowDown className="h-5 w-5" />
</Button>


      <div className="fixed bottom-0 left-0 right-0 z-10">
  <div
    className="border-t border-gray-200 dark:border-gray-700 py-3 md:pl-64"
    style={{
      background:
        "linear-gradient(to right, transparent 16rem, var(--background) 16rem)",
    }}
  >
    <div className="max-w-2xl mx-auto px-3 sm:px-4">
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Avatar */}
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-1 ring-gray-200 dark:ring-gray-700 shrink-0">
          <AvatarImage src="" alt="Your avatar" />
          <AvatarFallback className="text-sm font-medium">U</AvatarFallback>
        </Avatar>

        {/* Textarea */}
        <Textarea
          value={newOpinion}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setNewOpinion(e.target.value)
          }
          placeholder="What's your opinion?"
          className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 
                     focus:border-blue-500 shadow-sm min-h-[45px] sm:min-h-[60px] 
                     max-h-[120px] resize-y transition-shadow hover:shadow-md"
          disabled={!isOnline}
        />

        {/* Button */}
        <Button
          onClick={handleSubmitOpinion}
          className="rounded-full px-4 sm:px-6 bg-blue-500 hover:bg-blue-600 
                     text-white shadow-md transition-colors shrink-0"
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


