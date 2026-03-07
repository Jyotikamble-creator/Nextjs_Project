import MODEL_NAME, { IMODEL_NAME } from "@/server/models/MODEL_NAME"
import { connectToDatabase } from "@/server/db"
import { Logger, LogTags } from "@/lib/logger"
import { updateUserStats, USER_POPULATE_OPTIONS, isValidObjectId } from "@/server/utils/apiHelpers"
import { buildSearchQuery, buildUserQuery, mergeQueries } from "@/server/utils/queryHelpers"
import mongoose from "mongoose"

interface ItemFilters {
  param1?: string | null
  param2?: string | null
  search?: string | null
  userId?: string | null
  limit?: number
}

interface CreateItemData {
  field1: string
  field2?: string
  // Add more fields...
}

interface DeleteResult {
  success: boolean
  message: string
  notFound?: boolean
}

/**
 * FEATURE_NAME Service
 * Contains all business logic for FEATURE_NAME operations
 * Handles database interactions and data processing
 */
export class FEATURE_NAMEService {
  /**
   * Get items with optional filters
   */
  async getItems(filters: ItemFilters): Promise<IMODEL_NAME[]> {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connected for item fetch')

    const query: Record<string, unknown> = {}
    
    // Build filters
    if (filters.param1) {
      query.param1 = filters.param1
    }

    if (filters.search) {
      Object.assign(query, buildSearchQuery(filters.search, ["field1", "field2"]))
    }

    if (filters.userId) {
      if (!isValidObjectId(filters.userId)) {
        throw new Error("Invalid user ID format")
      }
      Object.assign(query, buildUserQuery(filters.userId, "owner"))
    }

    Logger.d(LogTags.API_REQUEST, 'Executing query', { query, limit: filters.limit })

    const items = await MODEL_NAME.find(query)
      .populate("owner", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .lean()

    Logger.i(LogTags.API_RESPONSE, `Found ${items.length} items`)

    return items as IMODEL_NAME[]
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId: string): Promise<IMODEL_NAME | null> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid item ID format")
    }

    Logger.d(LogTags.API_REQUEST, 'Fetching item by ID', { itemId })

    const item = await MODEL_NAME.findById(itemId)
      .populate("owner", USER_POPULATE_OPTIONS)
      .lean()

    return item as IMODEL_NAME | null
  }

  /**
   * Get user's items
   */
  async getUserItems(userId: string, limit: number = 20): Promise<IMODEL_NAME[]> {
    await connectToDatabase()

    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID format")
    }

    Logger.d(LogTags.API_REQUEST, 'Fetching items for user', { userId, limit })

    const items = await MODEL_NAME.find({ owner: userId })
      .populate("owner", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.API_RESPONSE, `Found ${items.length} items for user`, { userId })

    return items as IMODEL_NAME[]
  }

  /**
   * Create new item
   */
  async createItem(userId: string, itemData: CreateItemData): Promise<IMODEL_NAME> {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connected for item creation')

    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID format")
    }

    // Create item document
    const item = await MODEL_NAME.create({
      ...itemData,
      owner: userId,
      createdAt: new Date()
    })

    Logger.d(LogTags.API_REQUEST, 'Item document created', { itemId: item._id })

    // Update user stats (if applicable)
    // await updateUserStats(userId, { totalItems: 1 })

    // Populate and return
    const populatedItem = await MODEL_NAME.findById(item._id)
      .populate("owner", USER_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.API_RESPONSE, 'Item created successfully', { 
      itemId: item._id, 
      userId 
    })

    return populatedItem as IMODEL_NAME
  }

  /**
   * Update item (with ownership check)
   */
  async updateItem(itemId: string, userId: string, updates: Partial<CreateItemData>): Promise<IMODEL_NAME | null> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid item ID format")
    }

    Logger.d(LogTags.API_REQUEST, 'Attempting to update item', { itemId, userId })

    // Find and check ownership
    const item = await MODEL_NAME.findById(itemId).lean()
    if (!item || item.owner.toString() !== userId) {
      Logger.w(LogTags.API_REQUEST, 'Item not found or unauthorized', { itemId, userId })
      return null
    }

    // Update item
    const updatedItem = await MODEL_NAME.findByIdAndUpdate(
      itemId,
      { $set: updates },
      { new: true }
    )
      .populate("owner", USER_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.API_RESPONSE, 'Item updated successfully', { itemId, userId })

    return updatedItem as IMODEL_NAME
  }

  /**
   * Delete item (with ownership check)
   */
  async deleteItem(itemId: string, userId: string): Promise<DeleteResult> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid item ID format")
    }

    Logger.d(LogTags.API_REQUEST, 'Attempting to delete item', { itemId, userId })

    // Find item
    const item = await MODEL_NAME.findById(itemId).lean()

    if (!item) {
      Logger.w(LogTags.API_REQUEST, 'Item not found', { itemId })
      return {
        success: false,
        message: "Item not found",
        notFound: true
      }
    }

    // Check ownership
    if (item.owner.toString() !== userId) {
      Logger.w(LogTags.API_REQUEST, 'Unauthorized delete attempt', { itemId, userId, ownerId: item.owner })
      return {
        success: false,
        message: "Unauthorized to delete this item"
      }
    }

    // Delete item
    await MODEL_NAME.findByIdAndDelete(itemId)
    Logger.d(LogTags.API_REQUEST, 'Item deleted from database', { itemId })

    // Update user stats (if applicable)
    // await updateUserStats(userId, { totalItems: -1 })

    Logger.i(LogTags.API_RESPONSE, 'Item deleted successfully', { itemId, userId })

    return {
      success: true,
      message: "Item deleted successfully"
    }
  }

  /**
   * Search items
   */
  async searchItems(searchTerm: string, limit: number = 20): Promise<IMODEL_NAME[]> {
    await connectToDatabase()

    const query = buildSearchQuery(searchTerm, ["field1", "field2"])

    Logger.d(LogTags.API_REQUEST, 'Searching items', { searchTerm, limit })

    const items = await MODEL_NAME.find(query)
      .populate("owner", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.API_RESPONSE, `Found ${items.length} items matching search`, { searchTerm })

    return items as IMODEL_NAME[]
  }
}
