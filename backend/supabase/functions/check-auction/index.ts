import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

import nodemailer from "npm:nodemailer@6.9.7";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!

// Dùng Service Role để có quyền đọc/ghi tất cả các bảng (kể cả bảng users nếu setup RLS chặt)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  // Hàm gửi email (Helper function)
  async function sendEmailSMTP(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: `"Sàn Đấu Giá" <${SMTP_USER}>`, // Tên hiển thị
        to: to,
        subject: subject,
        html: html,
      });
      console.log(`SMTP sent to ${to}: ${info.messageId}`);
    } catch (err) {
      console.error(`Lỗi gửi SMTP tới ${to}:`, err);
    }
  }
  
  try {
    // 1. Gọi RPC lấy các sản phẩm hết hạn và khóa lại
    const { data: products, error } = await supabase.rpc('get_and_lock_expired_products')

    if (error) throw error
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ message: 'Không có phiên đấu giá nào kết thúc' }), { headers: { 'Content-Type': 'application/json' } })
    }

    console.log(`Đang xử lý ${products.length} sản phẩm...`)

    // 2. Lặp qua từng sản phẩm
    for (const product of products) {
        
        // --- BƯỚC A: LẤY THÔNG TIN NGƯỜI BÁN (SELLER) ---
        // Giả sử bảng chứa thông tin user tên là 'users'
        const { data: sellerData } = await supabase
            .from('users') 
            .select('email')
            .eq('id', product.seller_id)
            .single()
        
        const sellerEmail = sellerData?.email

        // --- BƯỚC B: LẤY BIDS VÀ JOIN VỚI NGƯỜI MUA (BIDDER) ---
        // LƯU Ý: Với hệ thống auto-bid, cần sort theo max_bid_amount để tìm winner
        // Người có max_bid_amount cao nhất + đặt trước sẽ thắng
        const { data: bids } = await supabase
            .from('bids')
            .select(`
                bid_amount,
                max_bid_amount,
                bidder_id,
                created_at,
                users ( email, full_name )
            `)
            .eq('product_id', product.id)
            .eq('is_rejected', false) // Chỉ lấy bid không bị từ chối
            .order('max_bid_amount', { ascending: false }) // Sort theo max_bid (cao nhất trước)
            .order('created_at', { ascending: true }) // Nếu cùng max_bid, người đặt trước thắng

        // --- BƯỚC C: XỬ LÝ LOGIC GỬI MAIL ---
        if (bids && bids.length > 0) {
            // === TRƯỜNG HỢP 1: CÓ NGƯỜI MUA ===
            const winner = bids[0]
            // @ts-ignore
            const winnerEmail = winner.users?.email
            // @ts-ignore
            const winnerName = winner.users?.full_name || 'Người thắng'
            const winningPrice = winner.bid_amount // Giá thực tế người thắng phải trả
            const maxBidAmount = winner.max_bid_amount // Giá tối đa người đó đã đặt

            // 1. Gửi cho Người Thắng
            if (winnerEmail) {
                await sendEmailSMTP(
                    winnerEmail, 
                    `🎉 Chúc mừng! Bạn đã thắng đấu giá: ${product.name}`,
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4CAF50;">🎉 Chúc mừng ${winnerName}!</h2>
                        <p>Bạn đã chiến thắng phiên đấu giá sản phẩm <strong>${product.name}</strong>!</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Giá thắng:</strong> ${winningPrice?.toLocaleString('vi-VN')} đ</p>
                            <p style="margin: 5px 0;"><strong>Giá tối đa của bạn:</strong> ${maxBidAmount?.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <p>Vui lòng đăng nhập vào hệ thống để hoàn tất thanh toán và nhận sản phẩm.</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">Email này được gửi tự động từ Sàn Đấu Giá.</p>
                    </div>
                    `
                )
            }

            // 2. Gửi cho Người Bán (Báo tin vui)
            if (sellerEmail) {
                await sendEmailSMTP(
                    sellerEmail,
                    `💰 Sản phẩm của bạn đã bán thành công: ${product.name}`,
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2196F3;">💰 Bán hàng thành công!</h2>
                        <p>Sản phẩm <strong>${product.name}</strong> của bạn đã được bán thành công!</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Giá bán:</strong> ${winningPrice?.toLocaleString('vi-VN')} đ</p>
                            <p style="margin: 5px 0;"><strong>Người mua:</strong> ${winnerName}</p>
                        </div>
                        <p>Vui lòng đăng nhập vào hệ thống để xử lý đơn hàng.</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">Email này được gửi tự động từ Sàn Đấu Giá.</p>
                    </div>
                    `
                )
            }

            // 3. Cập nhật trạng thái thành công
            await supabase
                .from('products')
                .update({ status: 'sold' }) // Hoặc 'sold'
                .eq('id', product.id)

        } else {
            // === TRƯỜNG HỢP 2: KHÔNG CÓ AI MUA ===
            
            // Chỉ gửi cho Người Bán (Báo tin buồn)
            if (sellerEmail) {
                await sendEmailSMTP(
                    sellerEmail,
                    `⚠️ Đấu giá kết thúc không thành công: ${product.name}`,
                    `<p>Phiên đấu giá cho <strong>${product.name}</strong> đã kết thúc nhưng chưa có ai đặt giá.</p>`
                )
            }

            // Cập nhật trạng thái đóng/ế
            await supabase
                .from('products')
                .update({ status: 'closed' }) // Hoặc 'unsold'
                .eq('id', product.id)
        }
    }

    return new Response(JSON.stringify({ success: true, processed: products.length }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

