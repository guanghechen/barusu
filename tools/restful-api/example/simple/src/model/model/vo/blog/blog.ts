import {
  PaginationResponseResult,
  ResponseResult,
} from '../../../core/response'
import { Article } from '../../blog/article'


/**
 * query articles under the blog
 */
export interface BlogQueryArticlesRequestVo {
  /**
   * page size
   */
  size: string
  /**
   * page number
   */
  current: string
}
export type BlogQueryArticlesPaginationResponseVo = PaginationResponseResult<Pick<Article, 'id' | 'title' | 'tags'>[]>



/**
 * create an article
 */
export type BlogCreateArticleRequestVo = Omit<Article, 'id' | 'createAt'>
export type BlogCreateArticleResponseVo = ResponseResult<Article>


/**
 * get article with specified `articleId`
 */
export type BlogArticleQueryResponseVo = ResponseResult<Article>


/**
 * update article with specified `articleId`
 */
export type BlogArticleUpdateRequestVo = Omit<Article, 'createAt'>
export type BlogArticleUpdateResponseVo = ResponseResult<Article>


/**
 * delete an article with specified `articleId`
 */
export type BlogArticleDeleteResponseVo = ResponseResult
