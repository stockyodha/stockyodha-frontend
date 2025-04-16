import React from 'react';
import NewsCardOrganism from '@/components/organisms/NewsCardOrganism';

const NewsPage: React.FC = () => {
  const FIVE_DAYS_IN_SECONDS = 5 * 24 * 60 * 60;

  return (
    <div className="container mx-auto p-4 space-y-6">
      
      {/* Render the organism, passing only the timeframe. Pagination is internal */}
      <NewsCardOrganism 
        timeframeSeconds={FIVE_DAYS_IN_SECONDS}
      /> 

    </div>
  );
};

export default NewsPage; 