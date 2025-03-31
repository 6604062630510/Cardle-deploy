import { PostStrategy } from "./PostStrategy";
import { supabase } from "../../database/client";

export class PostSellStrategy implements PostStrategy {
  async fetchPosts(userId: string) {
    const { data, error } = await supabase
      .from("Posts-sell")
      .select("*")
      .eq("by_userid", userId)
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(`Error fetching post sell: ${error.message}`);
    }
    const transformedData = data.map((item) => {
      return {
        ...item,
        pic : item.post_img
      };
    });

    return transformedData;
  }
}
