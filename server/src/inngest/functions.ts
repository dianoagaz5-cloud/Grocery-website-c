import inngest from './client';
import prisma from '../config/prisma';
import transporter from '../config/nodemailer';

// 1. Check Low Stock Function
export const checkLowStock = inngest.createFunction(
  { id: 'check-low-stock', name: 'Check Low Stock' },
  [{ cron: '0 9 * * *' }, { event: 'inventory.check_stock' }],
  async ({ step }) => {
    const lowStockProducts = await step.run('fetch-low-stock-products', async () => {
      return prisma.product.findMany({
        where: {
          stock: { lt: 10 },
        },
      });
    });

    if (!lowStockProducts.length) return { message: 'No low stock items' };

    await step.run('send-low-stock-alerts', async () => {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (!adminEmail) return;

      for (const product of lowStockProducts) {
        const html = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px 28px;">
              <h2 style="color: #fff; margin: 0; font-size: 20px;">Low Stock Alert</h2>
            </div>
            <div style="padding: 28px;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 64px; height: 64px; border-radius: 12px; object-fit: cover;" />` : ''}
                <div>
                  <h3 style="margin: 0 0 4px; font-size: 18px; color: #111827;">${product.name}</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">${product.category} • ${product.unit}</p>
                </div>
              </div>
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; text-align: center;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #991b1b; font-weight: 600;">CURRENT STOCK</p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #dc2626;">${product.stock}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">units remaining</p>
              </div>
              <p style="margin: 20px 0 0; font-size: 13px; color: #9ca3af; text-align: center;">Please restock this item as soon as possible.</p>
            </div>
          </div>
        `;

        try {
          await transporter.sendMail({
            from: `"InstantMart Inventory" <${process.env.SMTP_FROM || 'no-reply@instantmart.com'}>`,
            to: adminEmail,
            subject: `⚠️ Low Stock Alert: ${product.name}`,
            html,
          });
        } catch (e) {
          console.error('Failed to send stock email:', e);
        }
      }
    });

    return { alertedCount: lowStockProducts.length };
  }
);

// 2. Auto Assign Delivery Partner
export const autoAssignRider = inngest.createFunction(
  { id: 'auto-assign-rider', name: 'Auto Assign Rider' },
  { event: 'order.created' },
  async ({ event, step }) => {
    const { orderId } = event.data;

    const assigned = await step.run('find-and-assign-rider', async () => {
      const activePartner = await prisma.deliveryPartner.findFirst({
        where: { isActive: true },
      });

      if (!activePartner) return null;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return null;

      const history = (order.statusHistory as any[]) || [];
      history.push({
        status: 'Assigned',
        timestamp: new Date().toISOString(),
        note: `Automatically assigned to ${activePartner.name}`,
      });

      return prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId: activePartner.id,
          deliveryOtp: otp,
          status: 'Assigned',
          statusHistory: history,
        },
      });
    });

    return { assigned: Boolean(assigned) };
  }
);

// 3. Send Monthly Offers Function
export const sendMonthlyOffers = inngest.createFunction(
  { id: 'send-monthly-offers', name: 'Send Monthly Offers' },
  [{ cron: '0 10 1 * *' }, { event: 'campaign.monthly_offers' }],
  async ({ step }) => {
    const { users, deals } = await step.run('fetch-data', async () => {
      const u = await prisma.user.findMany({ select: { email: true, name: true } });
      const d = await prisma.product.findMany({
        where: { originalPrice: { gt: 0 } },
        take: 6,
      });
      return { users: u, deals: d };
    });

    if (!deals.length || !users.length) return { message: 'No deals or users' };

    await step.run('send-offer-emails', async () => {
      for (const u of users) {
        const html = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 24px 28px;">
              <h2 style="color: #fff; margin: 0; font-size: 20px;">Fresh Picks Just For You!</h2>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Exclusive offers to kick off your month right</p>
            </div>
            <div style="padding: 28px;">
              <p style="margin: 0 0 20px; font-size: 15px; color: #374151;">Hi <strong>${u.name}</strong>, check out this month's top deals!</p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/deals"
                   style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                   Shop All Deals →
                </a>
              </div>
            </div>
          </div>
        `;

        try {
          await transporter.sendMail({
            from: `"InstantMart Deals" <${process.env.SMTP_FROM || 'no-reply@instantmart.com'}>`,
            to: u.email,
            subject: '🥑 Fresh Deals Just For You this Month!',
            html,
          });
        } catch (e) {
          console.error('Failed to send offer email:', e);
        }
      }
    });

    return { recipientsCount: users.length };
  }
);
