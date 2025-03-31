import { PostStrategy } from "./PostStrategy";
import { supabase } from "../../database/client";

export class OfferStrategy implements PostStrategy {
  async fetchPosts(userId: string) {
    const { data, error } = await supabase
      .from("Offer")
      .select("*")
      .eq("by_userid", userId)
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(`Error fetching offer: ${error.message}`);
    }
    return data;
  }
}