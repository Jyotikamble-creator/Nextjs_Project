import mongoose from "mongoose";
import { sanitizeString } from "@/lib/validation";

/**
 * Build search query for text fields
 */
export function buildSearchQuery(
  searchTerm: string,
  fields: string[]
): Record<string, any> {
  if (!searchTerm?.trim()) return {};
  
  const sanitized = sanitizeString(searchTerm);
  const searchConditions = fields.map(field => ({
    [field]: { $regex: sanitized, $options: "i" }
  }));
  
  return { $or: searchConditions };
}

/**
 * Build tag filter query
 */
export function buildTagQuery(tag: string | null): Record<string, any> {
  if (!tag) return {};
  return { tags: { $in: [sanitizeString(tag)] } };
}

/**
 * Build category filter query
 */
export function buildCategoryQuery(category: string | null): Record<string, any> {
  if (!category || category === "all") return {};
  return { category: sanitizeString(category) };
}

/**
 * Build album filter query
 */
export function buildAlbumQuery(album: string | null): Record<string, any> {
  if (!album || album === "all") return {};
  return { album: sanitizeString(album) };
}

/**
 * Build user filter query with ObjectId validation
 */
export function buildUserQuery(
  userId: string | null,
  fieldName: string = "uploader"
): Record<string, any> {
  if (!userId) return {};
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format");
  }
  
  return { [fieldName]: new mongoose.Types.ObjectId(userId) };
}

/**
 * Build date range query
 */
export function buildDateRangeQuery(
  startDate?: string | null,
  endDate?: string | null,
  fieldName: string = "createdAt"
): Record<string, any> {
  const query: Record<string, any> = {};
  
  if (startDate) {
    query[fieldName] = { ...query[fieldName], $gte: new Date(startDate) };
  }
  
  if (endDate) {
    query[fieldName] = { ...query[fieldName], $lte: new Date(endDate) };
  }
  
  return query;
}

/**
 * Merge multiple query objects
 */
export function mergeQueries(...queries: Record<string, any>[]): Record<string, any> {
  return Object.assign({}, ...queries);
}

/**
 * Build sort options from request parameters
 */
export function buildSortOptions(
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Record<string, 1 | -1> {
  const order = sortOrder.toLowerCase() === "asc" ? 1 : -1;
  return { [sortBy]: order };
}

/**
 * Common query options for optimized reads
 */
export const LEAN_QUERY_OPTIONS = {
  lean: true, // Return plain JavaScript objects instead of Mongoose documents
  cache: false
};

/**
 * Build aggregation pipeline for content with user info
 */
export function buildContentAggregation(
  matchQuery: Record<string, any>,
  userFieldName: string = "uploader"
) {
  return [
    { $match: matchQuery },
    {
      $lookup: {
        from: "users",
        localField: userFieldName,
        foreignField: "_id",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              name: 1,
              avatar: 1,
              email: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        [userFieldName]: "$userInfo"
      }
    },
    {
      $project: {
        userInfo: 0
      }
    },
    { $sort: { createdAt: -1 } }
  ];
}
