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

    const reviewStats = await db.review.aggregate({
      where: {
        status: 'approved',
      },
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      calificacionPromedio: reviewStats._avg.rating ?? 0,
      totalReseñas: reviewStats._count._all,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
