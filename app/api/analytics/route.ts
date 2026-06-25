import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const secretKey = process.env.ANALYTICS_SECRET_KEY;

    if (!secretKey) {
      console.error('Analytics auth secret is not configured.');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [stats, totalReseñas, reseñasAceptadas, reseñasRechazadas] = await Promise.all([
      db.review.aggregate({
        where: { status: "approved" },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      db.review.count(),
      db.review.count({ where: { status: "approved" } }),
      db.review.count({ where: { status: "rejected" } }),
    ]);

    return NextResponse.json({
      calificacionPromedio: Number((stats._avg.rating ?? 0).toFixed(2)),
      totalReseñas,
      reseñasAceptadas,
      reseñasRechazadas,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
