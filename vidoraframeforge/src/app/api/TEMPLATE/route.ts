import { NextRequest, NextResponse } from "next/server"
import { FEATURE_NAMEController } from "@/server/controllers/FEATURE_NAME.controller"

/**
 * FEATURE_NAME API Routes
 * Thin route handlers that delegate to FEATURE_NAMEController
 */

const controller = new FEATURE_NAMEController()

// GET /api/FEATURE_NAME?param1=value&param2=value&limit=20
export async function GET(request: NextRequest) {
  return controller.getItems(request)
}

// POST /api/FEATURE_NAME
export async function POST(request: NextRequest) {
  return controller.createItem(request)
}

// PUT /api/FEATURE_NAME?id=123
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  return controller.updateItem(request, id)
}

// DELETE /api/FEATURE_NAME?id=123
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  return controller.deleteItem(request, id)
}
