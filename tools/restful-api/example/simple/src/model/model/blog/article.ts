/**
 * article info
 */
export interface Article {
  /**
   * the unique identifier of the article
   */
  id: string
  /**
   * title of article
   */
  title: string
  /**
   * content of article
   */
  content: string
  /**
   * tags of article
   */
  tags: string[]
  /**
   * created time of article
   */
  createdAt: Date
}
