import { useCallback } from 'react';
import { useApi } from './useJsonApi';
import { VIDEO_ENDPOINT } from '../constants/api';
import { VideoProcessingResponse } from '../types/api';
import { TimelineItem } from '../types/timeline';

export const useVideo = () => {
  const { loading, fetchJson } = useApi();

  const requestVideo = useCallback(async (effects: TimelineItem[], videoUrl: string) => {
    try {
      const result: VideoProcessingResponse = await fetchJson(VIDEO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
          effects: effects
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
