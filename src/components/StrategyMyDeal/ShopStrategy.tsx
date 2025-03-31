import { PostStrategy } from "./PostStrategy";
import { supabase } from "../../database/client";




export class ShopStrategy implements PostStrategy {
  async fetchPosts(userId: string) {
    const { data, error } = await supabase
      .from("MyShop")
      .select("*, Posts-sell(id_post, title)") 
      .eq("by_userid", userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching shop: ${error.message}`);
    }


    const transformedData = data.map((item: any) => {
      const postSell = item["Posts-sell"]; 
      return {
        ...item,
        title: postSell ? postSell.title : '',
        postId: item.id_post,
      };
    });

    return transformedData;
  }
}
