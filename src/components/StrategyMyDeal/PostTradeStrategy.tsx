import { PostStrategy } from "./PostStrategy";
import { supabase } from "../../database/client";

export class PostTradeStrategy implements PostStrategy {
  async fetchPosts(userId: string) {
    const { data, error } = await supabase
      .from("Posts-trade")
      .select("*")
      .eq("by_userid", userId)
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(`Error fetching post trade: ${error.message}`);
    }

    const transformedData = data.map((item) => {
      return {
        ...item,
        description : item.description_i_have,
        pic : item.post_img_i_have 
      };
    });

    return transformedData;
  }

}




