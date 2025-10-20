//CRUD FUNCTION (GET/POST/PATCH/DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { ERConfig } from '@/app/lib/sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS – CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET – Get all users or one by ID (?id=1)
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const idParam = url.searchParams.get('id');
    const uid = url.searchParams.get('uid');

    if (idParam) {
      const id = Number(idParam);
      if (!Number.isFinite(id)) {
        return new NextResponse('Invalid id', { status: 400, headers: corsHeaders });
      }
      const room = await ERConfig.findByPk(id);
      if (!room) return new NextResponse('Room not found', { status: 404, headers: corsHeaders });
      return NextResponse.json(room.toJSON(), { headers: corsHeaders });
    }

    if (uid) {
      const room = await ERConfig.findOne({ where: { uniqueId: uid } });
      if (!room) return new NextResponse('Room not found', { status: 404, headers: corsHeaders });
      return NextResponse.json(room.toJSON(), { headers: corsHeaders });
    }

    const rooms = await ERConfig.findAll();
    return NextResponse.json(rooms.map(r => r.toJSON()), { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Server error', { status: 500, headers: corsHeaders });
  }
}

// POST – Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return new NextResponse('Invalid request body', { status: 400, headers: corsHeaders });
    }

    const { name, appliedImagesData, uniqueId } = body as {
      name?: string;
      appliedImagesData?: any[];
      uniqueId?: string; // e.g. your timestamp-based ID
    };

    if (!name || !appliedImagesData) {
      return new NextResponse('Missing name or image configurations', { status: 400, headers: corsHeaders });
    }
    if (!Array.isArray(appliedImagesData)) {
      return new NextResponse('appliedImagesData must be an array', { status: 400, headers: corsHeaders });
    }

    const newRoom = await ERConfig.create({ name, appliedImagesData, uniqueId });
    return NextResponse.json(newRoom.toJSON(), { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request body', { status: 400, headers: corsHeaders });
  }
}

// PATCH – Update user by ID (?id=1)
export async function PATCH(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const idParam = url.searchParams.get('id');
    const uid = url.searchParams.get('uid');

    let room = null;
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isFinite(id)) return new NextResponse('Invalid id', { status: 400, headers: corsHeaders });
      room = await ERConfig.findByPk(id);
    } else if (uid) {
      room = await ERConfig.findOne({ where: { uniqueId: uid } });
    } else {
      return new NextResponse('Missing id or uid', { status: 400, headers: corsHeaders });
    }

    if (!room) return new NextResponse('Room not found', { status: 404, headers: corsHeaders });

    const body = await request.json().catch(() => ({}));
    const { name, appliedImagesData } = body as { name?: string; appliedImagesData?: any[] };

    if (name !== undefined) (room as any).name = name;
    if (appliedImagesData !== undefined) (room as any).appliedImagesData = appliedImagesData;

    await room.save();
    return NextResponse.json(room.toJSON(), { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}

// DELETE – Delete user by ID (?id=1)
export async function DELETE(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const idParam = url.searchParams.get('id');
    const uid = url.searchParams.get('uid');

    let room = null;
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isFinite(id)) return new NextResponse('Invalid id', { status: 400, headers: corsHeaders });
      room = await ERConfig.findByPk(id);
    } else if (uid) {
      room = await ERConfig.findOne({ where: { uniqueId: uid } });
    } else {
      return new NextResponse('Missing id or uid', { status: 400, headers: corsHeaders });
    }

    if (!room) return new NextResponse('Room not found', { status: 404, headers: corsHeaders });

    await room.destroy();
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}