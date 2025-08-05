import { useCallback } from 'react';
import { useApi } from './useJsonApi';
import { VIDEO_ENDPOINT } from '../constants/api';
import { FilterType } from '../types/filter';
import { VideoProcessingResponse } from '../types/api';
import { videoUrl as defaultVideoUrl } from '../consts';

export const useVideo = () => {
  const { loading, fetchJson } = useApi();

  const requestVideo = useCallback(async (filter: FilterType, videoUrl: string = defaultVideoUrl) => {
    try {
      const result: VideoProcessingResponse = await fetchJson(VIDEO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
          effect: filter
        })
      });
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Video processing error:', error);
      return { data: null, error: 'Error processing video' };
    }
  }, [fetchJson]);

  return {
    loading,
    requestVideo
  };
};
