import React from 'react';
import { Article } from '@/types';
import { ArticleCardBig, ArticleCardGrid, ArticleCardSmall } from './ArticleCards';

const ArticlesFeed: React.FC<{ articles: Article[] | null }> = ({ articles: loadedArticles }) => {

    const endNumber = 9;
    const loadedArticlesFirstChunk = loadedArticles?.slice(0, endNumber) || [];
    const loadedArticlesLastChunk = loadedArticles?.slice(endNumber, loadedArticles.length) || [];

    return (
        <div className='min-h-screen'>
            {/* Mobile */}
            <div className='block lg:hidden'>
                {loadedArticles !== null &&
                    <div className='flex space max-w-7xl'>
                        <div className=''>
                            {loadedArticles.map((article, idx) => (
                                <ArticleCardSmall key={article.id} article={article} idx={idx} includeBorder={idx !== loadedArticles.length - 1} />
                            ))}
                        </div>
                    </div>

                }
            </div>
            {/* Desktop */}
            <div className='hidden lg:block'>
                <div className='flex flex-col max-w-7xl'>
                    <div className='flex space max-w-7xl'>
                        <div className='w-2/3 border-r pr-4'>
                            {loadedArticlesFirstChunk.slice(0, loadedArticlesFirstChunk.length * 2 / 3).filter((_, idx) => idx % 2 === 0).map((article, idx) => (
                                <ArticleCardBig key={article.id} article={article} nextArticle={loadedArticlesFirstChunk?.slice(0, loadedArticlesFirstChunk.length * 2 / 3).filter((_, idx) => idx % 2 !== 0)?.[idx]} idx={idx} includeBorder={idx === loadedArticlesFirstChunk.slice(0, loadedArticlesFirstChunk.length * 1 / 3).length - 1 && loadedArticlesFirstChunk.length > 2} />
                            ))}
                        </div>
                        <div className='w-1/3 pl-4'>
                            {loadedArticlesFirstChunk.slice(loadedArticlesFirstChunk.length * 2 / 3, loadedArticlesFirstChunk.length).map((article, idx) => (
                                <ArticleCardSmall key={article.id} article={article} idx={idx} includeBorder={idx !== loadedArticlesFirstChunk.slice(loadedArticlesFirstChunk.length * 2 / 3, loadedArticlesFirstChunk.length).length - 1} />
                            ))}
                        </div>
                    </div>
                    <div className='grid grid-cols-5 w-full mt-20'>
                        {loadedArticlesLastChunk.slice(loadedArticlesLastChunk.length * 2 / 3, loadedArticlesLastChunk.length).map((article, idx) => (
                            <ArticleCardGrid key={article.id} article={article} idx={idx} />
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ArticlesFeed;