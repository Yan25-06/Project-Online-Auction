import { supabase } from '../config/supabase.js';
import type { Question, Answer, QuestionWithDetails, AnswerWithSeller } from 'shared-auction';

export const questionModel = {
  // Create question
  async create(userId: string, productId: string, questionText: string): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        user_id: userId,
        product_id: productId,
        question_text: questionText
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get questions for a product
  async findByProduct(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        user:users!user_id(id, full_name),
        answers(
          *,
          seller:users!seller_id(id, full_name)
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Answer question
  async answer(questionId: string, sellerId: string, answerText: string): Promise<Answer> {
    // Create answer
    const { data: answerData, error: answerError } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        seller_id: sellerId,
        answer_text: answerText
      })
      .select()
      .single();

    if (answerError) throw answerError;

    // Mark question as answered
    const { error: updateError } = await supabase
      .from('questions')
      .update({ is_answered: true })
      .eq('id', questionId);

    if (updateError) throw updateError;

    return answerData;
  },

  // Get question by ID
  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        user:users!user_id(id, full_name),
        product:products(id, name, seller_id),
        answers(
          *,
          seller:users!seller_id(id, full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Get unanswered questions for seller's products
  async getUnansweredBySeller(sellerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        user:users!user_id(id, full_name),
        product:products!inner(
          id,
          name,
          seller_id
        )
      `)
      .eq('is_answered', false)
      .eq('product.seller_id', sellerId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
