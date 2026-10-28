export interface ScanSession {
  id?: number
  user_id?: string
  product_id?: number

  original_image_url?: string
  extraction_raw?: unknown // Raw AI response
  online_search_results?: unknown // Raw search results

  created_at?: string
}
