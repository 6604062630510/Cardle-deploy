
export interface PostStrategy {
    fetchPosts(userId: string): Promise<any[]>;
  }
  