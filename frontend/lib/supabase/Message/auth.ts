export function getSortedUserPair(currentUserId: string, targetUserId: string) {
  const sortedIds = [currentUserId, targetUserId].sort();
  const id1 = sortedIds[0];
  const id2 = sortedIds[1];

  return {
    user_a_id: id1,
    user_b_id: id2,
    isCurrentUserA: id1 === currentUserId,
  };
}
